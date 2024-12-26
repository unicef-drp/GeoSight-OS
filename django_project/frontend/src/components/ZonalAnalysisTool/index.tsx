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

import React, { useState } from 'react';
import maplibregl from 'maplibre-gl';

import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { FormControl, InputAdornment, Radio } from "@mui/material";
import { SelectWithList } from "../Input/SelectWithList";

import './style.scss';

interface Props {
  map: maplibregl.Map;
}

export const AGGREGATION_TYPES = {
  'SUM': 'SUM',
  'MIN': 'MIN',
  'MAX': 'MAX',
  'AVG': 'AVG',
} as const;

const SELECTION_MODE = {
  SELECT: "SELECT",
  MANUAL: "MANUAL",
} as const;

const DRAW_MODE = {
  POINT: "POINT",
  LINE: "LINE",
  POLYGON: "POLYGON",
} as const;

interface ZonalAnalysisConfiguration {
  selectionMode: keyof typeof SELECTION_MODE;
  drawMode: keyof typeof DRAW_MODE;
  aggregation: keyof typeof AGGREGATION_TYPES;
  buffer: number;
}

/**
 * Zonal Analysis Tool
 */
export default function ZonalAnalysisTool({ map }: Props) {
  const [config, setConfig] = useState<ZonalAnalysisConfiguration>(
    {
      selectionMode: SELECTION_MODE.MANUAL,
      drawMode: DRAW_MODE.POLYGON,
      aggregation: AGGREGATION_TYPES.SUM,
      buffer: 0
    }
  );
  console.log(config)
  return (
    <>
      <div className='Title'>Extract zonal statistic</div>
      <div className='ZonalAnalysisToolConfiguration'>
        <FormControl className='MuiForm-RadioGroup'>
          <FormLabel className="MuiInputLabel-root">Selection mode:</FormLabel>
          <RadioGroup
            value={config.selectionMode}
            onChange={(evt) => {
              setConfig({
                ...config,
                selectionMode: evt.target.value as keyof typeof SELECTION_MODE
              })
            }}>
            <FormControlLabel
              value={SELECTION_MODE.MANUAL}
              control={<Radio/>}
              label='Draw Manually'/>
          </RadioGroup>
        </FormControl>
        <FormControl className='MuiForm-RadioGroup'>
          <FormLabel className="MuiInputLabel-root">Aggregation:</FormLabel>
          <SelectWithList
            isMulti={false}
            value={config.aggregation}
            list={
              [AGGREGATION_TYPES.SUM, AGGREGATION_TYPES.MIN, AGGREGATION_TYPES.MAX, AGGREGATION_TYPES.AVG]
            }
            onChange={(evt: any) => {
              setConfig({
                ...config,
                aggregation: evt.value as keyof typeof AGGREGATION_TYPES
              })
            }}
          />
        </FormControl>
        <FormControl className='MuiForm-RadioGroup'>
          <FormLabel className="MuiInputLabel-root">Buffer:</FormLabel>
          <TextField
            value={config.buffer}
            type="number"
            onChange={(evt) => {
              setConfig({
                ...config,
                buffer: parseInt(evt.target.value)
              })
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">km</InputAdornment>
              ),
            }}
          />
        </FormControl>
      </div>
      <div className='PopupToolbarComponentFooter'>
        <SelectWithList
          isMulti={false}
          value={config.drawMode}
          list={[DRAW_MODE.POINT, DRAW_MODE.LINE, DRAW_MODE.POLYGON]}
          onChange={(evt: any) => {
            setConfig({
              ...config,
              drawMode: evt.value as keyof typeof DRAW_MODE
            })
          }}
        />
      </div>
    </>
  );
}