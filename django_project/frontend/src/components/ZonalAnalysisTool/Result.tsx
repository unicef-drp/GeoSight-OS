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
import { useSelector } from "react-redux";
import { ContextLayer } from "../../store/dashboard/reducers/contextLayers";
import { ZonalAnalysisLayerConfiguration } from "./index.d";
import { analyzeData } from "../../utils/analysisData";

import './style.scss';

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
    const [data, setData] = useState<object[]>(null);
    const [value, setValue] = useState<number>(null);
    const [error, setError] = useState<string>(null);
    const contextLayer = contextLayers.find((ctx: ContextLayer) => ctx.id === analysisLayer.id)

    useImperativeHandle(ref, () => ({
      startAnalyzing() {
        setIsAnalysing(true)
        setValue(null)
        setError(null)
      },
      finishAnalyzing(id: number, values: object[], error: string) {
        if (contextLayer.id !== id) {
          return
        }
        setError(error)
        if (values) {
          // @ts-ignore
          const data = values.map((value: object) => value[analysisLayer.aggregatedField]).filter(value => value !== undefined)
          setData(data)
          setValue(analyzeData(analysisLayer.aggregation, data))
        }
        setIsAnalysing(false)
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
              <i className='Error'>
                {error}
              </i> : ![null, NaN].includes(value) ? value : '-'
          }
        </td>
      </tr>
    );
  }
)