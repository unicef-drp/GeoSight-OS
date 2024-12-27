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
import { DRAW_MODE, ZonalAnalysisConfiguration } from "./index.d";

import './style.scss';
import { Variables } from "../../utils/Variables";
import {
  ArcGISLine,
  ArcGISPoint,
  ArcGISPolygon
} from "../../utils/ArcGIS/DataType";

interface Props {
  contextLayer: ContextLayer;
  isAnalyzing: boolean;
  setIsAnalysing: (isDone: boolean) => void;
}

/**
 * Zonal Analysis Tool
 */
export const ZonalAnalysisResult = forwardRef((
    { contextLayer, isAnalyzing, setIsAnalysing }: Props, ref
  ) => {

    const [value, setValue] = useState<number>(null);

    useImperativeHandle(ref, () => ({
      analyze(features: Array<Feature>, config: ZonalAnalysisConfiguration) {
        setIsAnalysing(true)

        switch (contextLayer.layer_type) {

          // --------------------------------
          // FOR ARCGIS
          // --------------------------------
          case Variables.LAYER.TYPE.ARCGIS: {
            let _Class = null;
            switch (config.drawMode) {
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
                setIsAnalysing(false)
            }
            if (_Class) {
              new _Class(features, config.buffer)
            }
            break;
          }
        }
      }
    }));

    return (
      <tr>
        <td>{contextLayer.name}</td>
        <td>{isAnalyzing ? <i>Loading</i> : value ? value : '-'}</td>
      </tr>
    );
  }
)