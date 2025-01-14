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

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import { useSelector } from "react-redux";
import { ContextLayer } from "../../store/dashboard/reducers/contextLayers";
import { ZonalAnalysisLayerConfiguration } from "./index.d";
import { AGGREGATION_TYPES, analyzeData } from "../../utils/analysisData";
import { Variables } from "../../utils/Variables";
import { Feature } from "geojson";
import { fetchFromAPIValues } from "./fetchFromAPIValues";

import './style.scss';
import Tooltip from "@mui/material/Tooltip";

interface Props {
  index: number;
  analysisLayer: ZonalAnalysisLayerConfiguration;
  isAnalyzing: boolean;
  setIsAnalysing: (isDone: boolean) => void;
}

/**
 * Zonal Analysis Tool
 */
export const ZonalAnalysisResult = forwardRef((
    { index, analysisLayer, isAnalyzing, setIsAnalysing }: Props, ref
  ) => {

    // @ts-ignore
    const { contextLayers } = useSelector(state => state.dashboard.data)
    const [data, setData] = useState<object[]>(null);
    const [value, setValue] = useState<number>(null);
    const [error, setError] = useState<string>(null);
    const contextLayer = contextLayers.find((ctx: ContextLayer) => ctx.id === analysisLayer.id)

    useEffect(() => {
      if (!(value == null && error == null)) {
        setIsAnalysing(false)
      }
    }, [value, error])

    const analyze = async (values: object[], features: Array<Feature>) => {
      // This is for a context layer that does not contain values but requires a specific method
      switch (contextLayer?.layer_type) {
        case Variables.LAYER.TYPE.RASTER_COG:
        case Variables.LAYER.TYPE.RASTER_TILE:
        case Variables.LAYER.TYPE.CLOUD_NATIVE_GIS:
          try {
            setValue(await fetchFromAPIValues(
              {
                contextLayer,
                analysisLayer,
                features
              }
            ))
          } catch (err) {
            setError(err.toString());
            return;
          }
          break;
      }

      // This is for data that having values
      if (values !== null) {
        let data = values
        if (analysisLayer.aggregation !== AGGREGATION_TYPES.COUNT) {
          // @ts-ignore
          data = values.map((value: object) => value[analysisLayer.aggregatedField]).filter(value => value !== undefined)
        }
        setData(data)
        // @ts-ignore
        setValue(analyzeData(analysisLayer.aggregation, data))
        setIsAnalysing(false)
      }
    }

    useImperativeHandle(ref, () => ({
      startAnalyzing() {
        if (contextLayer) {
          setIsAnalysing(true)
          setValue(null)
          setError(null)
        } else {
          setIsAnalysing(false)
          setValue(null)
          setError('Context layer is not setup')
        }
      },
      /** Finish analyzing by context layer**/
      finishAnalyzingByContextLayer(
        id: number, values: object[], error: string, features: Array<Feature>
      ) {
        if (!contextLayer || analysisLayer.id !== id) {
          return
        }
        setError(error)
        if (!error) {
          analyze(values, features)
        } else {
          setIsAnalysing(false)
        }
      },
      /** Finish analyzing by index**/
      finishAnalyzingByIndex(
        analysisIndex: number, features: Array<Feature>
      ) {
        if (!contextLayer || analysisIndex !== index) {
          return
        }
        setError(null)
        analyze(null, features)
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
        <Tooltip title={<p style={{ fontSize: "12px" }}>{contextLayer?.name}</p>}>
          <td
            style={{
              maxWidth: "200px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >{contextLayer?.name}</td>
        </Tooltip>
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
