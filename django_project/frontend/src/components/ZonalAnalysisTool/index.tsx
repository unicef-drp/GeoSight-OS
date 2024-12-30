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
  useRef,
  useState
} from 'react';
import maplibregl from 'maplibre-gl';

import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import CancelIcon from "@mui/icons-material/Cancel";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import { useSelector } from "react-redux";
import { ThemeButton } from "../Elements/Button";
import { FormControl, InputAdornment, Radio } from "@mui/material";
import { SelectWithList } from "../Input/SelectWithList";
import { MapDrawing } from "../../utils/MapDrawing";
import { Variables } from "../../utils/Variables";
import {
  DRAW_MODE,
  SELECTION_MODE,
  ZonalAnalysisConfiguration,
  ZonalAnalysisLayerConfiguration
} from "./index.d";
import { DashboardTool } from "../../store/dashboard/reducers/dashboardTool";

import './style.scss';
import { ZonalAnalysisResult } from "./Result";

interface Props {
  map: maplibregl.Map;
}

/**
 * Zonal Analysis Tool
 */
export const ZonalAnalysisTool = forwardRef((
    { map }: Props, ref
  ) => {
    // @ts-ignore
    const { tools, contextLayers } = useSelector(state => state.dashboard.data)
    const tool: DashboardTool = tools.find((row: DashboardTool) => row.name === Variables.DASHBOARD.TOOL.ZONAL_ANALYSIS);
    let layers: ZonalAnalysisLayerConfiguration[] = []
    if (tool) {
      layers = tool.config.layersConfiguration
    }

    // For ref
    const zonalAnalysisRefs = useRef<(HTMLDivElement | null)[]>([]);
    const addRef = (index: number, ref: HTMLDivElement | null) => {
      zonalAnalysisRefs.current[index] = ref;
    };

    const [config, setConfig] = useState<ZonalAnalysisConfiguration>(
      {
        selectionMode: SELECTION_MODE.MANUAL,
        drawMode: DRAW_MODE.POLYGON,
        buffer: 0
      }
    );
    const [draw, setDraw] = useState<MapDrawing>(null);
    const [drawState, setDrawState] = useState<number>(null);

    // Analyzing state
    const [isAnalyzing, setIsAnalyzing] = useState<boolean[]>([]);
    const isAllAnalyzingDone = !(isAnalyzing.find(row => row))

    useImperativeHandle(ref, () => ({
      stop() {
        if (draw) {
          draw.destroy()
        }
        setDraw(null)
        map.boxZoom.enable();
      }
    }));

    /** When start */
    useEffect(() => {
      const mapDrawing = new MapDrawing(
        map,
        'draw_polygon',
        () => {
          setDrawState(new Date().getTime())
        }
      )
      setDraw(mapDrawing)
    }, []);

    /** Mode changed */
    useEffect(() => {
      if (draw) {
        const drawMode = config.drawMode === DRAW_MODE.POLYGON ? draw.draw.modes.DRAW_POLYGON : config.drawMode === DRAW_MODE.POINT ? draw.draw.modes.DRAW_POINT : draw.draw.modes.DRAW_LINE_STRING;
        draw.changeMode(drawMode)
      }
    }, [config.drawMode]);

    /** Analyze **/
    const analyze = () => {
      if (!draw) {
        return
      }
      const geometries = draw.getFeatures()
      zonalAnalysisRefs.current.map((ref, index) => {
        // @ts-ignore
        ref.analyze(geometries, config)
      })
    }

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
                control={<Radio disabled={!isAllAnalyzingDone}/>}
                label='Draw Manually'/>
            </RadioGroup>
          </FormControl>
          <FormControl className='MuiForm-RadioGroup'>
            <FormLabel className="MuiInputLabel-root">Buffer:</FormLabel>
            <TextField
              disabled={!isAllAnalyzingDone}
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
          <div className='CenteredFlex'>
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
              isDisabled={!isAllAnalyzingDone}
            />
            <div className='Separator'/>
            <ThemeButton
              disabled={draw?.isDrawing || !isAllAnalyzingDone}
              onClick={() => {
                draw.start()
              }}
              style={{ width: '300px' }}
            >
              <AddLocationIcon/> Add new feature
            </ThemeButton>
            {
              draw?.isDrawing ?
                <ThemeButton
                  variant='Error Reverse NoBorder'
                  disabled={!isAllAnalyzingDone}
                  onClick={() => {
                    draw.stop()
                  }}>
                  <CancelIcon/> Cancel
                </ThemeButton> :
                <ThemeButton
                  disabled={!isAllAnalyzingDone}
                  onClick={() => {
                    draw.deleteFeatures()
                    zonalAnalysisRefs.current.map((ref, index) => {
                      // @ts-ignore
                      ref.clear()
                    })
                  }}>
                  <CancelIcon/> Clear
                </ThemeButton>
            }
          </div>
          <div>
            <ThemeButton
              disabled={!(draw?.getFeatures().length) || !isAllAnalyzingDone}
              variant="primary Basic"
              style={{ margin: 0, marginTop: "1rem", minWidth: "100%" }}
              onClick={analyze}
            >
              Run analysis
            </ThemeButton>
          </div>
        </div>
        <div className='PopupToolbarComponentFooter ZonalAnalysisTable'>
          <table>
            <tr>
              <th>Source layer</th>
              <th>Aggregation</th>
              <th>Field</th>
              <th>Value</th>
            </tr>
            {
              layers.map((layer, index) => {
                  return <ZonalAnalysisResult
                    key={index}
                    analysisLayer={layer}
                    ref={(el: HTMLDivElement) => addRef(index, el)}
                    isAnalyzing={isAnalyzing[index]}
                    setIsAnalysing={(_isAnalyzing) => {
                      isAnalyzing[index] = _isAnalyzing;
                      setIsAnalyzing([...isAnalyzing])
                    }}
                  />
                }
              )
            }
          </table>
        </div>
      </>
    );
  }
)