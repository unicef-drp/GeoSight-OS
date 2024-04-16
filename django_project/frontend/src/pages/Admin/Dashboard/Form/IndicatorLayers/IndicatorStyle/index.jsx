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

import React, { forwardRef, Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { FormControlLabel, FormGroup } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import {
  SaveButton,
  ThemeButton
} from "../../../../../../components/Elements/Button";
import { Actions } from "../../../../../../store/dashboard";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../../components/Modal";
import {
  ViewLevelConfiguration
} from "../../../../Components/Input/ReferenceLayerLevelConfiguration";
import LabelForm from "../../../../Indicator/Form/LabelForm";
import { AdminForm } from "../../../../Components/AdminForm";
import { dictDeepCopy } from "../../../../../../utils/main";
import PopupConfigForm from "../PopupConfigForm";
import StyleConfig from "../../../../Style/Form/StyleConfig";
import { CogIcon } from "../../../../../../components/Icons";

import './style.scss';

export const IndicatorStyle = forwardRef(
  ({
     indicator,
     indicatorLayer,
     alwaysOverride = false,
     Button = false,
     header = null,
     onUpdate,
     ...props
   }, ref
  ) => {
    const dispatch = useDispatch();
    const { referenceLayer } = useSelector(state => state.dashboard.data);
    const [data, setData] = useState(indicator)
    const [dataLayer, setDataLayer] = useState(indicatorLayer)
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (open) {
        setData({ ...indicator })
        setDataLayer({ ...indicatorLayer })
      }
    }, [open])

    const apply = () => {
      dispatch(Actions.Indicators.update({ ...data }))
      dispatch(Actions.IndicatorLayers.update(
        {
          ...indicatorLayer,
          level_config: dataLayer.level_config,
          name: dataLayer.name,
          description: dataLayer.description,
          popup_template: dataLayer.popup_template,
          popup_type: dataLayer.popup_type,
          data_fields: dataLayer.data_fields,
        })
      )
      setOpen(false)
    }

    /** Update data **/
    const updateData = () => {
      setData(dictDeepCopy(data, true))
      setDataLayer(dictDeepCopy(dataLayer, true))
    }
    const disabled = data.style_type === 'Style from library.' && !data?.style
    return (
      <Fragment>
        <Modal
          className='IndicatorLayerConfig IndicatorRuleForm MuiBox-Large'
          open={open}
          onClosed={() => {
            setOpen(false)
          }}
        >
          <ModalHeader onClosed={() => {
            setOpen(false)
          }}>
            {
              header ? header : 'Style for ' + dataLayer.name
            }
          </ModalHeader>
          <ModalContent className='Gray'>
            <div className='SaveButton-Section'>
              <SaveButton
                variant="primary"
                text={"Apply Changes"}
                disabled={disabled}
                onClick={apply}/>
            </div>
            <div className='AdminForm Section'>
              <AdminForm
                selectableInput={false}
                forms={{
                  'General': (
                    <div>
                      <div className="BasicFormSection">
                        <div>
                          <label
                            className="form-label">Indicator</label>
                        </div>
                        <div>
                          <input
                            type="text" spellCheck="false"
                            value={data.name}
                            disabled/>
                        </div>
                        <br/>
                        <textarea
                          value={data.description}
                          disabled/>
                      </div>
                      <div className="BasicFormSection">
                        <div>
                          <label className="form-label required">Name</label>
                        </div>
                        <div>
                          <input
                            type="text" spellCheck="false"
                            value={dataLayer.name}
                            onChange={evt => {
                              dataLayer.name = evt.target.value
                              updateData()
                            }}/>
                        </div>
                      </div>
                      <div className="BasicFormSection">
                        <div>
                          <label className="form-label">Description</label>
                        </div>
                        <div>
                        <textarea
                          value={dataLayer.description}
                          onChange={evt => {
                            dataLayer.description = evt.target.value
                            updateData()
                          }}/>
                        </div>
                      </div>

                      {/* ADMIN LEVEL CONFIGURATION*/}
                      <div className='OverrideAdminLevel'>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={!!(dataLayer.level_config && Object.keys(dataLayer.level_config).length)}
                                onChange={evt => {
                                  if (evt.target.checked) {
                                    dataLayer.level_config = {
                                      default_level: 0
                                    }
                                  } else {
                                    dataLayer.level_config = {}
                                  }
                                  updateData()
                                }}/>
                            }
                            label={"Override admin level configuration"}/>
                        </FormGroup>
                        {
                          dataLayer.level_config && Object.keys(dataLayer.level_config).length ?
                            <ViewLevelConfiguration
                              data={dataLayer.level_config}
                              setData={
                                levelConfig => {
                                  dataLayer.level_config = levelConfig
                                  updateData()
                                }
                              }
                              referenceLayer={referenceLayer}
                              ableToSelectReferenceLayer={true}
                            /> : null
                        }
                      </div>
                    </div>
                  ),
                  'Style': <div>
                    <div>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={data.override_style}
                              onChange={evt => {
                                data.override_style = evt.target.checked
                                updateData()
                              }}/>
                          }
                          label={"Override style from indicator style"}/>
                      </FormGroup>
                    </div>
                    {
                      data.override_style ?
                        <StyleConfig
                          data={data}
                          setData={newData => {
                            setData({ ...newData })
                            updateData()
                          }}
                          valuesUrl={`/api/indicator/${data.id}/values/flat/`}
                          defaultStyleRules={data?.style ? data?.style : []}
                          selectableInput={batch !== null}
                        /> : null
                    }
                  </div>,
                  'Label': <div>
                    <div>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={data.override_label}
                              onChange={evt => {
                                data.override_label = evt.target.checked
                                updateData()
                              }}/>
                          }
                          label={"Override label from indicator label"}/>
                      </FormGroup>
                    </div>
                    {
                      data.override_label ?
                        <LabelForm
                          indicator={data}
                          setIndicator={newData => {
                            setData({
                              ...data,
                              label_config: newData.label_config
                            })
                          }}/> : null
                    }
                  </div>,
                  'Popup': <PopupConfigForm
                    indicator={dataLayer}
                    setIndicator={newDataLayer => {
                      dataLayer.popup_template = newDataLayer.popup_template
                      dataLayer.popup_type = newDataLayer.popup_type
                      dataLayer.data_fields = newDataLayer.data_fields
                      updateData()
                    }}
                  />,
                }}
              />
            </div>
          </ModalContent>
        </Modal>
        <ThemeButton className='IndicatorStyleButton' onClick={() => {
          setOpen(true)
        }}>
          <CogIcon/> Config
        </ThemeButton>
      </Fragment>
    )
  }
)