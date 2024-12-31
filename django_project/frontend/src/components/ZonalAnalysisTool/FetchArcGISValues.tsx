/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '31/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { DRAW_MODE, FetchingFunctionProp } from "./index.d";
import {
  ArcGISLine,
  ArcGISPoint,
  ArcGISPolygon
} from "../../utils/ArcGIS/DataType";
import ArcGISRequest from "../../utils/ArcGIS/Request";
import { Variables } from "../../utils/Variables";

export const fetchArcGISValues = (
  {
    contextLayer,
    config,
    aggregatedField,
    features,
    setData
  }: FetchingFunctionProp) => {
  if (contextLayer.layer_type !== Variables.LAYER.TYPE.ARCGIS) {
    setData(null, `Can't calculate for ${contextLayer.layer_type}`)
    return;
  }

  let _Class = null;
  const drawMode = config.buffer ? DRAW_MODE.POLYGON : config.drawMode;
  switch (drawMode) {
    case DRAW_MODE.POLYGON:
      _Class = ArcGISPolygon;
      break;
    case DRAW_MODE.LINE:
      _Class = ArcGISLine;
      break;
    case DRAW_MODE.POINT:
      _Class = ArcGISPoint;
      break;
    default:
      setData(null, `${drawMode} is not recognized.`)
  }
  if (_Class) {
    // Change km to meters
    const feature = new _Class(features, 0)

    // Change the url
    const arcgisRequest = new ArcGISRequest(
      contextLayer.url, {}, contextLayer.arcgis_config
    )

    // outFields is based on admin config
    arcgisRequest.queryData(
      {
        outFields: [aggregatedField],
        returnGeometry: false
      },
      feature
    ).then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    }).then((data) => {
      const cleanData = data.features.map((row: any) => {
        try {
          return row.attributes[aggregatedField]
        } catch (err) {
          return null
        }
      }).filter((row: any) => row !== null)
      setData(cleanData, null)
    }).catch((error) => {
      setData(null, error.toString())
    })
  }
}