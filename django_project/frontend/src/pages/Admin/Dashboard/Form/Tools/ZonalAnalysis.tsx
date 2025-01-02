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
 * __date__ = '30/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useState } from 'react';

import './style.scss';
import {
  SELECTION_MODE,
  ZonalAnalysisDashboardConfiguration,
  ZonalAnalysisLayerConfiguration
} from "../../../../../components/ZonalAnalysisTool/index.d";
import { AGGREGATION_TYPES } from "../../../../../utils/analysisData";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Checkbox, FormControl } from "@mui/material";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../components/Modal";
import {
  AddButton,
  DeleteButton,
  SaveButton
} from "../../../../../components/Elements/Button";
import EditIcon from "@mui/icons-material/Edit";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/dashboard/reducers";
import { Variables } from "../../../../../utils/Variables";
import {
  ContextLayer
} from "../../../../../store/dashboard/reducers/contextLayers";
import FormLabel from "@mui/material/FormLabel";
import {
  SelectWithList
} from "../../../../../components/Input/SelectWithList";
import ArcGISRequest from "../../../../../utils/ArcGIS/Request";


interface Props {
  config: ZonalAnalysisDashboardConfiguration;
  setConfig: (config: ZonalAnalysisDashboardConfiguration) => void;
}


/**
 * Zonal analysis configuration
 */
export function ZonalAnalysisConfiguration(
  { config, setConfig }: Props
) {
  const [data, setData] = useState<ZonalAnalysisDashboardConfiguration>(
    {
      selectionModes: [SELECTION_MODE.SELECT_ADMIN, SELECTION_MODE.MANUAL],
      layersConfiguration: []
    }
  );
  const [open, setOpen] = useState(false);

  // Context layers
  // @ts-ignore
  const { contextLayers: ctxLayer } = useSelector((state: RootState) => state.dashboard.data);
  const contextLayers = ctxLayer.filter(
    (ctx: ContextLayer) => [Variables.LAYER.TYPE.ARCGIS, Variables.LAYER.TYPE.RASTER_COG].includes(ctx.layer_type)
  )

  // For new layer
  const [newLayer, setNewLayer] = useState<ZonalAnalysisLayerConfiguration>({
    id: contextLayers[0]?.id ? contextLayers[0]?.id : null,
    aggregation: AGGREGATION_TYPES.SUM,
    aggregatedField: "loading"
  });
  const [newLayerFieldOptions, setNewLayerFieldOptions] = useState<string[]>([]);

  /** Apply data **/
  const apply = () => {
    setConfig({ ...data })
    setOpen(false)
  }

  // Loading data
  useEffect(() => {
    if (config) {
      setData(config)
    }
  }, [config, open])

  // Loading data
  useEffect(() => {
    if (newLayer.id) {
      // Get metadata
      const contextLayer = contextLayers.find(
        (ctx: ContextLayer) => ctx.id === newLayer.id
      )
      if (contextLayer) {
        setNewLayer({
          ...newLayer,
          aggregatedField: "loading"
        })
        setNewLayerFieldOptions(["loading"])

        switch (contextLayer.layer_type) {
          case Variables.LAYER.TYPE.ARCGIS:
            const arcgisRequest = new ArcGISRequest(
              contextLayer.url, {}, contextLayer.arcgis_config
            )
            // outFields is based on admin config
            arcgisRequest.getMetadata(
            ).then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            }).then((data) => {
              const fields = data.fields.map((field: any) => field.name)
              setNewLayer({
                ...newLayer,
                aggregatedField: fields[0]
              })
              setNewLayerFieldOptions(fields)
            }).catch((error) => {
              setNewLayer({
                ...newLayer,
                aggregatedField: "error"
              })
              setNewLayerFieldOptions(["error"])
            }).finally(() => {
            })
            break;
          case Variables.LAYER.TYPE.RASTER_COG:
            setNewLayer({
              ...newLayer,
              aggregatedField: "Pixel"
            })
            setNewLayerFieldOptions(["Pixel"])
            break;
        }
        return
      } else {
        setNewLayer({
          ...newLayer,
          aggregatedField: ""
        })
        setNewLayerFieldOptions([])
      }
    }

    setNewLayer({
      ...newLayer,
      aggregatedField: null
    })
    setNewLayerFieldOptions([])
  }, [newLayer.id])

  if (!data) {
    return null
  }

  const ctxOptions = contextLayers.map((ctx: ContextLayer) => {
    return {
      label: ctx.name,
      value: ctx.id,
    }
  })

  const { selectionModes, layersConfiguration } = data
  return <>
    <Modal
      className='ZonalAnalysisConfiguration'
      open={open}
      onClosed={() => {
        setOpen(false)
      }}
    >
      <ModalHeader onClosed={() => {
        setOpen(false)
      }}>
        Zonal analysis configuration
      </ModalHeader>
      <ModalContent className='White'>

        {/* -------------------------------------------- */}
        {/* Creator */}
        <div className='Creator'>
          <FormControl style={{ minWidth: "200px" }}>
            <FormLabel className="MuiInputLabel-root">
              Target layer (from context layers):
            </FormLabel>
            <SelectWithList
              isMulti={false}
              value={newLayer.id}
              list={ctxOptions}
              onChange={(evt: any) => {
                setNewLayer({
                  ...newLayer,
                  id: evt.value
                })
              }}
            />
          </FormControl>
          <FormControl style={{ minWidth: "100px" }}>
            <FormLabel className="MuiInputLabel-root">Aggregation:</FormLabel>
            <SelectWithList
              isMulti={false}
              value={newLayer.aggregation}
              list={
                [AGGREGATION_TYPES.COUNT, AGGREGATION_TYPES.SUM, AGGREGATION_TYPES.MIN, AGGREGATION_TYPES.MAX, AGGREGATION_TYPES.AVG]
              }
              onChange={(evt: any) => {
                setNewLayer({ ...newLayer, aggregation: evt.value })
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel className="MuiInputLabel-root">Field:</FormLabel>
            <SelectWithList
              isMulti={false}
              value={newLayer.aggregatedField}
              list={newLayerFieldOptions}
              onChange={(evt: any) => {
                setNewLayer({ ...newLayer, aggregatedField: evt.value })
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel
              className="MuiInputLabel-root"
              style={{ color: "white" }}>
              Create
            </FormLabel>
            <div>
              <AddButton
                style={{ height: "36px" }}
                variant="primary Reverse"
                disabled={
                  !!(
                    !newLayer.id ||
                    !newLayer.aggregation ||
                    !newLayer.aggregatedField ||
                    ['loading', 'error'].includes(newLayer.aggregatedField)
                  )
                }
                onClick={() => {
                  layersConfiguration.push(newLayer)
                  setData({
                    ...data,
                    layersConfiguration: layersConfiguration
                  })
                }}
              />
            </div>
          </FormControl>
        </div>
        {/* -------------------------------------------- */}
        <div className='LayerList'>
          <table>
            <tr>
              <th>Source layer</th>
              <th>Aggregation</th>
              <th>Field</th>
              <th></th>
            </tr>
            {
              layersConfiguration.map((layer: ZonalAnalysisLayerConfiguration, index: number) => {
                return <tr key={index}>
                  <td>{contextLayers.find((ctx: ContextLayer) => ctx.id === layer.id)?.name}</td>
                  <td>{layer.aggregation}</td>
                  <td>{layer.aggregatedField}</td>
                  <td>
                    <DeleteButton
                      variant='Error Reverse NoBorder'
                      onClick={() => {
                        setData(
                          {
                            ...data,
                            layersConfiguration: layersConfiguration.filter((layer, idx) => index !== idx)
                          }
                        )
                      }}/>
                  </td>
                </tr>
              })
            }
          </table>
        </div>

        <div className='BasicForm'>
          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem"
          }}>
            <div>Selection mode:</div>
            {
              [SELECTION_MODE.SELECT_ADMIN, SELECTION_MODE.MANUAL].map(mode => {
                return <FormControlLabel
                  checked={selectionModes.includes(mode)}
                  control={<Checkbox/>}
                  onChange={evt => {
                    // @ts-ignore
                    if (evt.target.checked) {
                      data.selectionModes = [...selectionModes, mode]
                    } else {
                      data.selectionModes = data.selectionModes.filter(
                        (row: string) => mode !== row
                      )
                    }
                    setData({ ...data })
                  }}
                  label={mode === SELECTION_MODE.SELECT_ADMIN ? 'Click to select' : 'Draw Manually'}/>
              })
            }
          </div>
        </div>
        <div className='SaveButton-Section'>
          <SaveButton
            variant="primary"
            text={"Apply Changes"}
            onClick={apply}/>
        </div>
      </ModalContent>
    </Modal>
    <EditIcon
      style={{ marginRight: "1rem", cursor: "pointer" }}
      onClick={() => {
        setOpen(true)
      }}
    />
  </>
}
