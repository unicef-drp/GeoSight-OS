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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

import { Actions } from "../../../../../store/dashboard";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../components/Modal";
import {
  SaveButton,
  ThemeButton
} from "../../../../../components/Elements/Button";
import ListForm from '../ListForm'
import StyleConfig from '../../../ContextLayer/StyleConfig'
import { CogIcon } from "../../../../../components/Icons";
import WhereInputModal
  from "../../../../../components/SqlQueryGenerator/WhereInputModal";
import { dictDeepCopy, toJson } from "../../../../../utils/main";
import { getRelatedTableFields } from "../../../../../utils/relatedTable";
import { fetchingData } from "../../../../../Requests";
import {
  SelectWithList
} from "../../../../../components/Input/SelectWithList";
import { Variables } from "../../../../../utils/Variables";
import { returnLayerDetail } from "../../../../../utils/CloudNativeGIS";

import './style.scss';

/**
 * Context Layer Style
 */
function ContextLayerStyle({ contextLayer }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(false);


  const [relatedTableInfo, setRelatedTableInfo] = useState(null)
  const [relatedTableData, setRelatedTableData] = useState(null)

  useEffect(() => {
    const nowData = JSON.parse(JSON.stringify(contextLayer));
    (
      async () => {
        if (nowData.layer_type === Variables.TERMS.CLOUD_NATIVE_GIS && !nowData.mapbox_style) {
          const _detail = await returnLayerDetail(nowData.cloud_native_gis_layer_id)
          nowData.mapbox_style = _detail.mapbox_style
        }
      }
    )()
    setData(nowData)
  }, [open])

  /** Apply the data **/
  const apply = () => {
    dispatch(Actions.ContextLayers.updateStyle(data))
    setOpen(false)
  }

  /** Update data **/
  const updateData = (newData) => {
    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData)
    }
  }

  // Loading data
  useEffect(() => {
    if (data.related_table) {
      const params = {}
      const url_info = `/api/related-table/${data.related_table}`
      const url_data = `/api/related-table/${data.related_table}/data`
      setRelatedTableInfo(null)
      setRelatedTableData(null)
      fetchingData(
        url_data, params, {}, function (response, error) {
          setRelatedTableData(dictDeepCopy(response))
        }
      )
      fetchingData(
        url_info, params, {}, function (response, error) {
          setRelatedTableInfo(dictDeepCopy(response))
        }
      )
    }
  }, [data.related_table])

  const relatedFields = relatedTableInfo && relatedTableData ? getRelatedTableFields(relatedTableInfo, relatedTableData) : []
  const fieldOptions = relatedFields ? relatedFields.filter(
    field => ['Number', 'number'].includes(field.type)
  ).map(field => field.name) : []

  const configuration = toJson(data.configuration);
  const {
    query,
    override_query,
    field_aggregation,
    override_field_aggregation
  } = configuration;

  const {
    query: original_query
  } = toJson(data.original_configuration);

  return (
    <Fragment>
      <Modal
        className='IndicatorLayerConfig BasicForm ContextLayerStyleModal MuiBox-Large'
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          Style for {contextLayer.name}
        </ModalHeader>
        <ModalContent className='Gray'>
          <div className='SaveButton-Section'>
            <SaveButton
              variant="primary"
              text={"Apply Changes"}
              disabled={
                JSON.stringify(contextLayer) === JSON.stringify(data)
              }
              onClick={apply}/>
          </div>
          <div className='AdminForm Section'>
            {
              open ? <StyleConfig
                data={data} setData={updateData}
                useOverride={true}>
                {
                  data.layer_type === 'Related Table' ?
                    <div className='ArcgisConfig General_Override'>
                      {/* OVERRIDE QUERY */}
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={override_query ? override_query : false}
                              onChange={evt => updateData({
                                ...data,
                                configuration: {
                                  ...configuration,
                                  query: original_query,
                                  override_query: evt.target.checked
                                }
                              })}/>
                          }
                          label="Override the query"/>
                      </FormGroup>
                      {
                        override_query ?
                          <div className='BasicFormSection WhereInput'>
                            <WhereInputModal
                              value={query ? query : ''}
                              fields={relatedFields}
                              setValue={evt => {
                                updateData({
                                  ...data,
                                  configuration: {
                                    ...configuration,
                                    query: evt
                                  }
                                })
                              }}
                              title={"Filter"}
                            />
                            <div>
                          <span className="form-helptext">
                            This will be used to filter the data by default.<br/>
                            It will also create slicer on the website that will be used for user
                            to change the filter.
                          </span>
                            </div>
                          </div> : null
                      }

                      {/* OVERRIDE AGGREGATION */}
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={override_field_aggregation ? override_field_aggregation : false}
                              onChange={evt => updateData({
                                ...data,
                                configuration: {
                                  ...configuration,
                                  query: original_query,
                                  override_field_aggregation: evt.target.checked
                                }
                              })}/>
                          }
                          label="Override aggregate data by field name"/>
                      </FormGroup>
                      {
                        override_field_aggregation ?
                          <>
                            <SelectWithList
                              list={
                                [
                                  {
                                    name: '------------------------',
                                    value: null,
                                  },
                                  ...fieldOptions]
                              }
                              placeholder={!relatedFields ? "Loading" : "Select.."}
                              value={field_aggregation ? field_aggregation : null}
                              isDisabled={!data.data_fields}
                              onChange={evt => {
                                updateData({
                                  ...data,
                                  configuration: {
                                    ...configuration,
                                    field_aggregation: evt.value
                                  }
                                })
                              }}/>
                            <div>
                            <span className="form-helptext">
                              Field name that will be used to aggregate data.
                              Aggregation will be use to make clustering of the points on the map.
                            </span>
                            </div>
                          </> : null
                      }
                    </div> : null
                }
              </StyleConfig> : ""

            }
          </div>
        </ModalContent>
      </Modal>
      <ThemeButton className='ContextLayerStyleButton' onClick={() => {
        setOpen(true)
      }}>
        <CogIcon/> Config
      </ThemeButton>
    </Fragment>
  )
}

/**
 * Context Layer dashboard
 */
export default function ContextLayerForm() {
  const dispatch = useDispatch()
  const {
    contextLayers,
    contextLayersStructure
  } = useSelector(state => state.dashboard.data);

  return <ListForm
    pageName={'Context Layers'}
    data={contextLayers}
    dataStructure={contextLayersStructure}
    setDataStructure={structure => {
      dispatch(
        Actions.Dashboard.updateStructure('contextLayersStructure', structure)
      )
    }}
    createNew={true}
    listUrl={urls.api.contextLayerListAPI}
    addLayerAction={layer => {
      layer.default_styles = {
        data_fields: layer.data_fields,
        styles: layer.styles,
        label_styles: layer.label_styles,
      }
      dispatch(Actions.ContextLayers.add(layer))
    }}
    removeLayerAction={(layer) => {
      dispatch(Actions.ContextLayers.remove(layer))
    }}
    changeLayerAction={(layer) => {
      dispatch(Actions.ContextLayers.update(layer))
    }}
    otherActionsFunction={(contextLayer) => {
      return <ContextLayerStyle contextLayer={contextLayer}/>
    }}
  />
}