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
 * __date__ = '26/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Feature } from "geojson";
import { ContextLayer } from "../../store/dashboard/reducers/contextLayers";
import {
  DRAW_MODE,
  ZonalAnalysisConfiguration,
  ZonalAnalysisLayerConfiguration
} from "./index.d";

import './style.scss';
import {
  ArcGISLine,
  ArcGISPoint,
  ArcGISPolygon
} from "../../utils/ArcGIS/DataType";
import ArcGISRequest from "../../utils/ArcGIS/Request";
import { Variables } from "../../utils/Variables";
import { analyzeData } from "../../utils/analysisData";
import { useSelector } from "react-redux";

interface Props {
  analysisLayer: ZonalAnalysisLayerConfiguration;
  isAnalyzing: boolean;
  setIsAnalysing: (isDone: boolean) => void;
}

// --------------------------------
// FOR ARCGIS
// --------------------------------
const analyzeArcGIS = (
  contextLayer: ContextLayer,
  config: ZonalAnalysisConfiguration,
  analysisLayer: ZonalAnalysisLayerConfiguration,
  features: Array<Feature>,
  setIsAnalysing: (isAnalysing: boolean) => void,
  setValue: (value: number) => void,
  setError: (error: string) => void,
) => {
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
    const feature = new _Class(features, config.buffer * 1000)

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
/**
 * Zonal Analysis Tool
 */
export const ZonalAnalysisResult = forwardRef((
    { analysisLayer, isAnalyzing, setIsAnalysing }: Props, ref
  ) => {

    // @ts-ignore
    const { contextLayers } = useSelector(state => state.dashboard.data)
    const [value, setValue] = useState<number>(null);
    const [error, setError] = useState<string>(null);
    const contextLayer = contextLayers.find((ctx: ContextLayer) => ctx.id === analysisLayer.id)

    useImperativeHandle(ref, () => ({
      analyze(features: Array<Feature>, config: ZonalAnalysisConfiguration) {
        setIsAnalysing(true)
        setValue(null)
        setError(null)
        switch (contextLayer.layer_type) {
          case Variables.LAYER.TYPE.ARCGIS: {
            analyzeArcGIS(
              contextLayer, config, analysisLayer, features, setIsAnalysing, setValue, setError
            )
            break;
          }
        }
      },
      clear() {
        setValue(null)
        setError(null)
      }
    }));

    if (!contextLayer) {
      return null
    }

    return (
      <tr>
        <td>{contextLayer?.name}</td>
        <td>{analysisLayer.aggregation}</td>
        <td>{analysisLayer.aggregatedField}</td>
        <td>
          {
            isAnalyzing ? <i>Loading</i> : error ?
              <i className='Error'>{error}</i> : value ? value : '-'
          }
        </td>
      </tr>
    );
  }
)