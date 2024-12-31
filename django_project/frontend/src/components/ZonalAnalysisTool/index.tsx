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
import { ZonalAnalysisResult } from "./Result";
import { dictDeepCopy, numberWithCommas } from "../../utils/main";

import './style.scss';
import {
  addClickEvent,
  removeClickEvent
} from "../../pages/Dashboard/MapLibre/utils";
import {
  FILL_LAYER_ID_KEY
} from "../../pages/Dashboard/MapLibre/Layers/ReferenceLayer";
import { getFeatureByConceptUUID } from "../../utils/referenceLayer";
import { ContextLayer } from "../../store/dashboard/reducers/contextLayers";
import { fetchArcGISValues } from "./FetchArcGISValues";
import { fetchCOGValues } from "./FetchCOGValues";

interface Props {
  map: maplibregl.Map;
}

const IdFunction = 'ZonaAnalyzing'

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
    let selectionModes: string[] = [SELECTION_MODE.MANUAL, SELECTION_MODE.SELECT_ADMIN]
    if (tool?.config) {
      layers = tool.config.layersConfiguration
      selectionModes = tool.config.selectionModes
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
        removeClickEvent(map, null, IdFunction);
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

    /** When start */
    useEffect(() => {
      // @ts-ignore
      setConfig({ ...config, selectionMode: selectionModes[0] })
    }, [selectionModes]);

    /** Buffer changed */
    useEffect(() => {
      if (draw) {
        draw.updateBuffer(config.buffer)
      }
    }, [draw, config.buffer]);

    /** Draw changed */
    useEffect(() => {
      if (draw) {
        draw.updateBuffer(config.buffer);
        if (config.selectionMode !== SELECTION_MODE.MANUAL) {
          // @ts-ignore
          map.drawingMode = true;
        }
      }
    }, [drawState]);

    /** Mode changed */
    useEffect(() => {
      if (draw) {
        const drawMode = config.drawMode === DRAW_MODE.POLYGON ? draw.draw.modes.DRAW_POLYGON : config.drawMode === DRAW_MODE.POINT ? draw.draw.modes.DRAW_POINT : draw.draw.modes.DRAW_LINE_STRING;
        draw.changeMode(drawMode)
      }
    }, [config.drawMode]);

    /** Selection changed */
    useEffect(() => {
      if (draw) {
        removeClickEvent(map, null, IdFunction);
        draw.deleteFeatures()
        if (config.selectionMode === SELECTION_MODE.MANUAL) {
          draw.start()
        } else {
          draw.stop()
          /** Click map */
          const onClick = (e: any) => {
            const visibleLayerIds = map.getStyle().layers.filter(layer => layer.id.includes(FILL_LAYER_ID_KEY) || layer.id.includes('gl-draw-polygon')).map(layer => layer.id)
            const features = map.queryRenderedFeatures(
              e.point, { layers: visibleLayerIds }
            );
            if (features.length > 0) {
              let feature = features[0];
              let geometry = dictDeepCopy(feature.geometry)
              let id = feature.properties.concept_uuid ? feature.properties.concept_uuid : feature.properties.id
              try {
                geometry = getFeatureByConceptUUID(map, feature.properties.concept_uuid).geometry
              } catch (err) {
                console.log(err)
              }
              const _feature = {
                "type": "Feature",
                "geometry": geometry,
                "properties": {},
                "id": id
              };
              if (_feature.id) {
                draw.toggleGeometry(_feature)
              }
            }
          }
          addClickEvent(map, null, IdFunction, onClick);
        }
      }
    }, [config.selectionMode]);

    /** Analyze **/
    const analyze = () => {
      if (!draw) {
        return
      }
      const features = draw.getFeatures(config.buffer)
      zonalAnalysisRefs.current.map((ref, index) => {
        // @ts-ignore
        ref.startAnalyzing()
      })
      const analysisLayers: string[] = []
      layers.map(analysisLayer => {
        const _id = analysisLayer.id + '-' + analysisLayer.aggregatedField
        if (!analysisLayers.includes(_id)) {
          analysisLayers.push(_id)
        }
      })
      analysisLayers.map((_id: any) => {
        const splittedId = _id.split('-')
        const id = splittedId[0]
        const aggregatedField = splittedId[1]

        const contextLayer = contextLayers.find((ctx: ContextLayer) => ctx.id === parseInt(id))
        const setData = (values: number[], error: string) => {
          zonalAnalysisRefs.current.map((ref, index) => {
            // @ts-ignore
            ref.finishAnalyzing(contextLayer.id, aggregatedField, values, error)
          })
        }
        if (contextLayer) {
          switch (contextLayer.layer_type) {
            case Variables.LAYER.TYPE.ARCGIS: {
              fetchArcGISValues({
                contextLayer,
                config,
                aggregatedField,
                features,
                setData
              })
              return;
            }
            case Variables.LAYER.TYPE.RASTER_COG: {
              fetchCOGValues({
                contextLayer,
                config,
                aggregatedField,
                features,
                setData
              })
              return;
            }
          }
        }
        zonalAnalysisRefs.current.map((ref, index) => {
          // @ts-ignore
          ref.finishAnalyzing(contextLayer.id, aggregatedField, null)
        })
      })
    }

    // Draw information
    let information = null;
    if (draw) {
      information = draw.selectedInformation(config.buffer, config.selectionMode === SELECTION_MODE.MANUAL)
    }
    return (
      <>
        <div className='Title' style={{ display: "flex", alignItems: "center" }}>
          <div>
            Extract zonal statistic
          </div>
          <div className="Separator"/>
          <div>
            <ThemeButton
              disabled={!(draw?.getFeatures().length) || !isAllAnalyzingDone}
              variant="primary Basic"
              style={{ margin: 0, minWidth: "100%" }}
              onClick={analyze}
            >
              Run analysis
            </ThemeButton>
          </div>
        </div>
        <div className='ZonalAnalysisToolConfiguration'>
          <FormControl className='MuiForm-RadioGroup'>
            <FormLabel className="MuiInputLabel-root">Selection
              mode:</FormLabel>
            <RadioGroup
              value={config.selectionMode}
              onChange={(evt) => {
                setConfig({
                  ...config,
                  selectionMode: evt.target.value as keyof typeof SELECTION_MODE
                })
              }}>
              {
                selectionModes.includes(SELECTION_MODE.MANUAL) ?
                  <FormControlLabel
                    value={SELECTION_MODE.MANUAL}
                    control={<Radio disabled={!isAllAnalyzingDone}/>}
                    label='Draw Manually'
                  /> : null
              }
              {
                selectionModes.includes(SELECTION_MODE.SELECT_ADMIN) ?
                  <FormControlLabel
                    value={SELECTION_MODE.SELECT_ADMIN}
                    control={<Radio disabled={!isAllAnalyzingDone}/>}
                    label='Click to select'
                  /> : null
              }
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
            {
              config.selectionMode === SELECTION_MODE.MANUAL ?
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
                /> : null
            }
            <div style={{ marginLeft: "1rem", marginRight: "1rem" }}>
              {
                information ? (
                    <>
                      <div>
                        {numberWithCommas(information.area, 2)} Sq Meters
                      </div>
                      <div>
                        {numberWithCommas(information.lengthMeters, 2)} Meters
                        ({numberWithCommas(information.lengthMiles, 2)} Miles) {information.lengthTerm}
                      </div>
                    </>
                  ) :
                  <i>
                    {
                      config.selectionMode === SELECTION_MODE.MANUAL ? 'Draw on map and finish by double click.' : "Click a feature on the map"
                    }
                  </i>
              }
            </div>
            <div className='Separator'/>
            {
              config.selectionMode === SELECTION_MODE.MANUAL ?
                <ThemeButton
                  disabled={draw?.isDrawing || !isAllAnalyzingDone}
                  onClick={() => {
                    draw.start()
                  }}
                  style={{ width: '300px' }}
                >
                  <AddLocationIcon/> Add new feature
                </ThemeButton> : null
            }
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