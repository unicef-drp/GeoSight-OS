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
 * __date__ = '28/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { FormGroup } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import {
  SaveButton,
  ThemeButton
} from "../../../../../../components/Elements/Button";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../../components/Modal";
import { AdminForm } from "../../../../Components/AdminForm";
import PopupConfigForm from "../PopupConfigForm";
import {
  dataFieldsDefault,
  DynamicIndicatorType
} from "../../../../../../utils/indicatorLayer";
import {
  ViewLevelConfiguration
} from "../../../../Components/Input/ReferenceLayerLevelConfiguration";
import Expression from "./Expression";
import LabelForm from "../../../../Indicator/Form/LabelForm";
import StyleConfig from "../../../../Style/Form/StyleConfig";
import { CogIcon } from "../../../../../../components/Icons";

import './style.scss';

/**
 * DynamicIndicatorConfig
 * @param {boolean} openGlobal Is open or close.
 * @param {Function} setOpenGlobal Set Parent Open.
 * @param {Array} indicators List of indicators of selected data.
 * @param {dict} indicatorLayer Data of layer.
 * @param {Function} onUpdate Function when data updated.
 */
export default function DynamicIndicatorConfig(
  {
    openGlobal,
    setOpenGlobal,
    indicators,
    indicatorLayer,
    onUpdate
  }
) {

  /** Default data **/
  const defaultData = () => {
    return {
      name: "",
      description: "",
      indicators: [],
      data_fields: dataFieldsDefault(),
      level_config: {},
      config: {
        exposedVariables: []
      },
      type: DynamicIndicatorType
    }
  }

  const { referenceLayer } = useSelector(state => state.dashboard.data);
  const [data, setData] = useState(defaultData());
  const [open, setOpen] = useState(false);

  /** Update data **/
  const updateData = () => {
    setData(JSON.parse(JSON.stringify(data)))
  }

  // Open data selection when the props true
  useEffect(() => {
    if (openGlobal) {
      setOpen(true)
    }
    if (!indicatorLayer) {
      setData(defaultData())
    } else {
      setData(indicatorLayer)
    }
  }, [openGlobal])

  // Open data selection when the props true
  useEffect(() => {
    if (setOpenGlobal) {
      setOpenGlobal(open)
    }
  }, [open])

  /** Apply data **/
  const apply = () => {
    if (setOpenGlobal) {
      setOpenGlobal(open)
    }
    onUpdate(data)
    setOpen(false)
  }

  return (
    <Fragment>
      <Modal
        className='IndicatorLayerConfig DynamicIndicator MuiBox-Large'
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          {
            !indicatorLayer ?
              'Create Dynamic Indicator Layer' :
              'Change Layer ' + indicatorLayer.name
          }
        </ModalHeader>
        <ModalContent className='Gray'>
          <div className='SaveButton-Section'>
            <SaveButton
              variant="primary"
              text={"Apply Changes"}
              disabled={!data.name}
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
                        <label className="form-label">Name</label>
                      </div>
                      <div className='ContextLayerConfig-IconSize'>
                        <input
                          type="text" spellCheck="false"
                          value={data.name}
                          onChange={evt => {
                            data.name = evt.target.value
                            updateData()
                          }}/>
                      </div>
                    </div>
                    <div className="BasicFormSection">
                      <div>
                        <label className="form-label">Description</label>
                      </div>
                      <div className='ContextLayerConfig-IconSize'>
                        <textarea
                          value={data.description}
                          onChange={evt => {
                            data.description = evt.target.value
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
                              checked={!!(data.level_config && Object.keys(data.level_config).length)}
                              onChange={evt => {
                                if (evt.target.checked) {
                                  data.level_config = {
                                    default_level: 0
                                  }
                                } else {
                                  data.level_config = {}
                                }
                                updateData()
                              }}/>
                          }
                          label={"Override admin level configuration"}/>
                      </FormGroup>
                      {
                        data.level_config && Object.keys(data.level_config).length ?
                          <ViewLevelConfiguration
                            data={data.level_config}
                            setData={
                              levelConfig => {
                                data.level_config = levelConfig
                                updateData()
                              }
                            }
                            referenceLayer={referenceLayer}
                          /> : null
                      }
                    </div>
                  </div>
                ),
                'Expression': <Expression
                  indicators={indicators}
                  data={data.config}
                  setData={config => {
                    data.config = config
                    updateData()
                  }}
                />,
                'Style':
                  <StyleConfig
                    data={data}
                    setData={newData => {
                      setData({ ...newData })
                      updateData()
                    }}
                    defaultStyleRules={data?.style ? data?.style : []}
                  />,
                'Label': <LabelForm
                  indicator={data}
                  setIndicator={newData => {
                    setData({ ...data, label_config: newData.label_config })
                  }}/>,
                'Popup': <PopupConfigForm
                  indicator={data}
                  setIndicator={newDataLayer => {
                    data.popup_template = newDataLayer.popup_template
                    data.popup_type = newDataLayer.popup_type
                    data.data_fields = newDataLayer.data_fields
                    updateData()
                  }}
                />,
              }}
            />
          </div>
        </ModalContent>
      </Modal>
      {
        indicatorLayer ?
          <ThemeButton
            className='IndicatorStyleButton'
            onClick={() => {
              setOpen(true)
            }}>
            <CogIcon/> Config
          </ThemeButton>
          : ""
      }
    </Fragment>
  )
}