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
import { ContextLayer } from "../../store/dashboard/reducers/contextLayers";
import {
  DRAW_MODE,
  ZonalAnalysisConfiguration,
  ZonalAnalysisLayerConfiguration
} from "./index.d";
import {
  ArcGISLine,
  ArcGISPoint,
  ArcGISPolygon
} from "../../utils/ArcGIS/DataType";
import ArcGISRequest from "../../utils/ArcGIS/Request";
import { analyzeData } from "../../utils/analysisData";
import { Feature } from "geojson";
import { Variables } from "../../utils/Variables";

export const analyzeArcGIS = (
  contextLayer: ContextLayer,
  config: ZonalAnalysisConfiguration,
  analysisLayer: ZonalAnalysisLayerConfiguration,
  features: Array<Feature>,
  setIsAnalysing: (isAnalysing: boolean) => void,
  setValue: (value: number) => void,
  setError: (error: string) => void,
) => {
  if (contextLayer.layer_type !== Variables.LAYER.TYPE.ARCGIS) {
    setIsAnalysing(false)
    setValue(null)
    setError(`Can't calculate for ${contextLayer.layer_type}`)
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
      setError(`${drawMode} is not recognized.`)
      setIsAnalysing(false)
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
        outFields: [analysisLayer.aggregatedField],
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
          return row.attributes[analysisLayer.aggregatedField]
        } catch (err) {
          return null
        }
      }).filter((row: any) => row !== null)
      setValue(analyzeData(analysisLayer.aggregation, cleanData))
    }).catch((error) => {
      setError(error.toString())
    }).finally(() => {
      setIsAnalysing(false)
    })
  }
}