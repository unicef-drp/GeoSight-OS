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
import {
  dictDeepCopy,
  getAreaDecimalLength,
  numberWithCommas
} from "../../utils/main";

import './style.scss';
import {
  addClickEvent,
  removeClickEvent
} from "../../pages/Dashboard/MapLibre/utils";
import { getFeatureByConceptUUID } from "../../utils/referenceLayer";
import { ContextLayer } from "../../store/dashboard/reducers/contextLayers";
import { fetchArcGISValues } from "./FetchArcGISValues";
import { fetchGeoJsonValues } from "./FetchGeoJsonValues";
import {
  REFERENCE_LAYER_ID_KEY
} from "../../pages/Dashboard/MapLibre/Layers/ReferenceLayer";

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
      },
      redraw() {
        if (draw) {
          const features = draw.getFeatures(config.buffer)
          draw.redraw(features);
        }
      },
      isActive() {
        return draw
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
      if (tool?.config?.selectionModes) {
        if (selectionModes[0] !== config.selectionMode) {
          // @ts-ignore
          setConfig(
            {
              ...config,
              // @ts-ignore
              selectionMode: tool?.config?.selectionModes[0]
            }
          )
        }
      }
    }, [tool?.config?.selectionModes]);

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
        clearData()
        if (config.selectionMode === SELECTION_MODE.MANUAL) {
          draw.start()
        } else {
          setConfig({ ...config, drawMode: DRAW_MODE.POLYGON })
          draw.stop()
          /** Click map */
          const onClick = (e: any) => {
            const style = map.getStyle()
            const visibleLayerIds = map.getStyle().layers.filter(
              (layer: maplibregl.LayerSpecification) => {
                // @ts-ignore
                const source = style.sources[layer.source]
                return ['vector', 'geojson'].includes(source.type) && !['indicator-label'].includes(layer.id)
              }
            ).map(layer => layer.id)
            const features = map.queryRenderedFeatures(
              e.point, { layers: visibleLayerIds }
            );
            if (features.length > 0) {
              let feature = features[0];
              let geometry = dictDeepCopy(feature.geometry)
              let id = feature.properties.id ? feature.properties.id : JSON.stringify(geometry)
              if (feature.source.includes(REFERENCE_LAYER_ID_KEY)) {
                id = feature.properties.concept_uuid
                try {
                  geometry = getFeatureByConceptUUID(map, feature.properties.concept_uuid).geometry
                } catch (err) {
                  console.log(err)
                }
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

    const clearData = () => {
      zonalAnalysisRefs.current.map((ref, index) => {
        // @ts-ignore
        ref.clear()
      })
      draw.deleteFeatures()
    }

    /** Analyze **/
    const analyze = () => {
      if (!draw) {
        return
      }
      const features = draw.getFeatures(config.buffer)

      /** Start analysis **/
      zonalAnalysisRefs.current.map((ref, index) => {
        // @ts-ignore
        ref.startAnalyzing()
      })

      /** Loop for context layer that is calculated in Result level **/
      layers.map((analysisLayer: ZonalAnalysisLayerConfiguration, index) => {
        const contextLayer = contextLayers.find((ctx: ContextLayer) => ctx.id === analysisLayer.id)
        if (
          [
            Variables.LAYER.TYPE.RASTER_COG,
            Variables.LAYER.TYPE.RASTER_TILE,
            Variables.LAYER.TYPE.CLOUD_NATIVE_GIS,
          ].includes(contextLayer.layer_type)
        ) {
          zonalAnalysisRefs.current.map((ref) => {
            // @ts-ignore
            ref.finishAnalyzingByIndex(index, features)
          })
        }
      })

      /** Calculate by context layer type that is done on this level **/
      const contextLayerIds = layers.map((analysisLayer: ZonalAnalysisLayerConfiguration) => {
        const contextLayer = contextLayers.find((ctx: ContextLayer) => ctx.id === analysisLayer.id)
        if (
          [
            Variables.LAYER.TYPE.ARCGIS,
            Variables.LAYER.TYPE.RELATED_TABLE,
            Variables.LAYER.TYPE.GEOJSON
          ].includes(contextLayer?.layer_type)
        ) {
          return contextLayer.id
        }
        return null
      }).filter(id => id)

      // Calculate per context layer
      contextLayerIds.map(id => {
        const contextLayer = contextLayers.find((ctx: ContextLayer) => ctx.id === id)
        const setData = (values: object[], error: string) => {
          zonalAnalysisRefs.current.map((ref, index) => {
            // @ts-ignore
            ref.finishAnalyzingByContextLayer(contextLayer.id, values, error, features)
          })
        }
        if (contextLayer) {
          switch (contextLayer.layer_type) {
            case Variables.LAYER.TYPE.ARCGIS: {
              fetchArcGISValues({
                contextLayer,
                config,
                features,
                setData
              })
              return;
            }
            case Variables.LAYER.TYPE.RELATED_TABLE:
            case Variables.LAYER.TYPE.GEOJSON: {
              fetchGeoJsonValues({
                map,
                contextLayer,
                config,
                features,
                setData
              })
            }
          }
        }
      })
    }

    // Draw information
    let information = null;
    let area = null;
    let perimeter = null;
    if (draw) {
      information = draw.selectedInformation(config.buffer, config.selectionMode === SELECTION_MODE.MANUAL)
      if (information) {
        if (information.area < 10000) {
          area = `${numberWithCommas(information.area, 2)} m2`;
        } else if (information.area < 1000000) {
          area = `${numberWithCommas(information.area / 1000, 2)} ha`;
        } else {
          area = `${numberWithCommas(information.area / 1000000, 2)} km2`;
        }
        area = `${area} (${information.count} feature${information.count > 1 ? 's' : ''})`

        if (information.lengthMeters < 1000) {
          perimeter = `${numberWithCommas(information.lengthMeters, 2)} m ${information.lengthTerm}`;
        } else {
          perimeter = `${numberWithCommas(information.lengthMeters / 1000, 2)} km 
          (${numberWithCommas(information.lengthMiles, 2)} mi) ${information.lengthTerm}`;
        }
      }

    }
    return (
      <>
        <div className='ZonalAnalysisToolConfiguration'>
          <FormControl className='MuiForm-RadioGroup'>
            <FormLabel className="MuiInputLabel-root">
              Selection mode:
            </FormLabel>
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
                    label='Draw'
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
          <FormControl className='MuiForm-RadioGroup Buffer-Input'>
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
                        {area}
                      </div>
                      <div>
                        {perimeter}
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
                  <AddLocationIcon/> Add
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
                    clearData()
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
                    index={index}
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