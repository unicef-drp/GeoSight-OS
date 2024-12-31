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
import { useSelector } from "react-redux";
import { Variables } from "../../utils/Variables";
import { analyzeArcGIS } from "./AnalyzeArcGIS";
import { ContextLayer } from "../../store/dashboard/reducers/contextLayers";
import {
  ZonalAnalysisConfiguration,
  ZonalAnalysisLayerConfiguration
} from "./index.d";

import './style.scss';
import { analyzeCOG } from "./AnalyzeCOG";

interface Props {
  analysisLayer: ZonalAnalysisLayerConfiguration;
  isAnalyzing: boolean;
  setIsAnalysing: (isDone: boolean) => void;
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
          case Variables.LAYER.TYPE.RASTER_COG: {
            analyzeCOG(
              contextLayer, config, analysisLayer, features, setIsAnalysing, setValue, setError
            )
            break;
          }
          default:
            setIsAnalysing(false)
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