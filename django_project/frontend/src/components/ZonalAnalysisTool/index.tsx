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
import maplibregl from 'maplibre-gl';

import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { FormControl, InputAdornment, Radio } from "@mui/material";
import { SelectWithList } from "../Input/SelectWithList";
import { MapDrawing } from "../../utils/MapDrawing";

import './style.scss';
import CancelIcon from "@mui/icons-material/Cancel";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import { ThemeButton } from "../Elements/Button";

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
export const ZonalAnalysisTool = forwardRef((
    { map }: Props, ref
  ) => {
    const [config, setConfig] = useState<ZonalAnalysisConfiguration>(
      {
        selectionMode: SELECTION_MODE.MANUAL,
        drawMode: DRAW_MODE.POLYGON,
        aggregation: AGGREGATION_TYPES.SUM,
        buffer: 0
      }
    );
    const [draw, setDraw] = useState<MapDrawing>(null);
    const [drawState, setDrawState] = useState<number>(null);

    useImperativeHandle(ref, () => ({
      start() {
        const mapDrawing = new MapDrawing(
          map,
          'draw_polygon',
          () => {
            setDrawState(new Date().getTime())
          }
        )
        setDraw(mapDrawing)
      },
      stop() {
        if (draw) {
          draw.destroy()
        }
        setDraw(null)
        map.boxZoom.enable();
      }
    }));

    /** Mode changed */
    useEffect(() => {
      if (draw) {
        const drawMode = config.drawMode === DRAW_MODE.POLYGON ? draw.draw.modes.DRAW_POLYGON : config.drawMode === DRAW_MODE.POINT ? draw.draw.modes.DRAW_POINT : draw.draw.modes.DRAW_LINE_STRING;
        draw.changeMode(drawMode)
      }
    }, [config.drawMode]);

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
          <div className='Separator'/>
          <ThemeButton
            disabled={draw?.isDrawing}
            onClick={() => {
              draw.start()
            }}
            style={{ width: '300px' }}
          >
            <AddLocationIcon/> Add new feature
          </ThemeButton>
          {
            draw?.isDrawing ?
              <ThemeButton onClick={() => {
                draw.stop()
              }}>
                <CancelIcon/> Cancel
              </ThemeButton> :
              <ThemeButton onClick={() => {
                draw.deleteFeatures()
              }}>
                <CancelIcon/> Clear
              </ThemeButton>
          }
        </div>
      </>
    );
  }
)