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
import { useSelector } from "react-redux";
import { FormGroup } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import {
  SaveButton,
  ThemeButton
} from "../../../../../../components/Elements/Button";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../../components/Modal";
import MultiSelectorConfig from "../../../../Components/Input/MultiSelector";
import { AdminForm } from "../../../../Components/AdminForm";
import {
  ViewLevelConfiguration
} from "../../../../Components/Input/ReferenceLayerLevelConfiguration";
import PopupConfigForm from "../PopupConfigForm";
import { dataFieldsDefault } from "../../../../../../utils/indicatorLayer";
import { CogIcon } from "../../../../../../components/Icons";
import {
  SelectWithSearch
} from "../../../../../../components/Input/SelectWithSearch";
import Config from "./Config"

import './style.scss';

const FixedSize = "Fixed size"
const sizeTypes = [
  FixedSize,
  "Vary size using sum of values",
  // "Vary size using indicator",
]

const defaultChartType = "Pie"
const chartTypes = [
  defaultChartType,
  "Bar"
]

const ChartMode = "Chart"
const PinMode = "Pin"

/**
 * MultiIndicatorConfig
 * @param {boolean} multiIndicatorStyleOpen Is open or close.
 * @param {Function} setMultiIndicatorStyleOpen Set Parent Open.
 * @param {Array} indicators List of indicators of selected data.
 * @param {dict} indicatorLayer Data of layer.
 * @param {Function} onUpdate Function when data updated.
 */
export default function MultiIndicatorConfig(
  {
    multiIndicatorStyleOpen,
    setMultiIndicatorStyleOpen,
    indicators,
    indicatorLayer,
    onUpdate
  }
) {
  const defaultMinSize = 20
  const defaultMaxSize = 50

  /** Default data **/
  const defaultData = () => {
    return {
      name: "",
      description: "",
      indicators: [],
      style: {
        sizeType: FixedSize,
        chartType: defaultChartType,
        size: 50
      },
      level_config: {},
      data_fields: dataFieldsDefault(),
      type: 'Multi Indicator',
      multi_indicator_mode: ChartMode
    }
  }

  const { referenceLayer } = useSelector(state => state.dashboard.data);
  const [data, setData] = useState(defaultData());
  const [open, setOpen] = useState(false);
  const [indicatorsSelected, setIndicatorsSelected] = useState([]);

  const indicatorIds = data.indicators.map(indicator => indicator.id)
  const indicatorList = indicators.sort((a, b) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  }).filter(indicator => !indicatorIds.includes(indicator.id));

  // Open data selection when the props true
  useEffect(() => {
    if (multiIndicatorStyleOpen) {
      setOpen(true)
    }
  }, [multiIndicatorStyleOpen])

  // Open data selection when the props true
  useEffect(() => {
    if (setMultiIndicatorStyleOpen) {
      setMultiIndicatorStyleOpen(open)
    }
    if (!indicatorLayer) {
      setData(defaultData())
    } else {
      if (!indicatorLayer.chart_style) {
        indicatorLayer.chart_style = {}
      }
      if (!indicatorLayer.chart_style.sizeType) {
        indicatorLayer.chart_style.sizeType = FixedSize
      }
      if (!indicatorLayer.chart_style.size) {
        indicatorLayer.chart_style.size = defaultMinSize
      }
      if (!indicatorLayer.chart_style.chartType) {
        indicatorLayer.chart_style.chartType = defaultChartType
      }
      setData(indicatorLayer)
    }
  }, [open])

  /** Update data **/
  const updateData = () => {
    setData(JSON.parse(JSON.stringify(data)))
  }

  /** Apply data **/
  const apply = () => {
    onUpdate(data)
    setOpen(false)
  }

  if (indicatorLayer && !indicators.length) {
    return ""
  }

  if (!data.chart_style) {
    data.chart_style = {
      sizeType: FixedSize,
      size: defaultMinSize,
      chartType: defaultChartType
    }
  }
  return (
    <Fragment>
      <Modal
        className='IndicatorLayerConfig MultiIndicatorConfig MuiBox-Large'
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
              'Create Multi Indicator Layer' :
              'Change Layer ' + indicatorLayer.name
          }
        </ModalHeader>
        <ModalContent className='Gray'>
          <div className='SaveButton-Section'>
            <SaveButton
              variant="primary"
              text={"Apply Changes"}
              disabled={data.indicators.length < 2 || !data.name}
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
                'Style': (
                  <div>
                    <div className="BasicFormSection">
                      <label className="form-label" htmlFor="group">
                        Mode
                      </label>
                      <SelectWithSearch
                        options={[ChartMode, PinMode]}
                        value={data.multi_indicator_mode ? data.multi_indicator_mode : ChartMode}
                        onChangeFn={evt => {
                          data.chart_style = {
                            ...data.chart_style,
                            sizeType: 'Fixed size'
                          }
                          data.multi_indicator_mode = evt
                          if (data.multi_indicator_mode === PinMode) {
                            data.chart_style.size = 10
                          }
                          setData({ ...data })
                        }}
                        disableCloseOnSelect={false}
                      />
                    </div>
                    <MultiSelectorConfig
                      items={indicators}
                      selectedItems={data?.indicators ? data?.indicators : []}
                      setSelectedItems={items => {
                        data.indicators = items.map(item => {
                          if (!item.override_style) {
                            const indicator = indicators.find(indicator => indicator.id === item.id)
                            if (indicator) {
                              item.style = indicator.style
                              item.style_id = indicator.style_id
                              item.style_type = indicator.style_type
                              item.style_data = indicator.style_data
                              item.style_config = indicator.style_config
                            }
                          }
                          return item
                        })
                        updateData()
                      }}
                      additionalFields={['name']}
                      action={
                        (
                          data.multi_indicator_mode === PinMode ?
                            <Config indicators={indicators}/> : null
                        )
                      }
                      headers={
                        (data.multi_indicator_mode === ChartMode ? ['indicator', 'label', 'color'] : ['indicator', 'label', 'config'])
                      }
                      noColor={data.multi_indicator_mode === PinMode}
                    />
                    <div className='IndicatorsStyle'>
                      {data.multi_indicator_mode === ChartMode ?
                        <Fragment>
                          <div>
                            <FormControl>
                              <div>
                                <b className='light'>Chart Type</b>
                              </div>
                              <RadioGroup
                                value={data.chart_style.chartType}
                                className='IndicatorsStyle-Size'
                                onChange={(evt) => {
                                  data.chart_style.chartType = evt.target.value
                                  updateData()
                                }}
                              >
                                {
                                  chartTypes.map(type => {
                                    return <FormControlLabel
                                      key={type} value={type}
                                      control={<Radio/>}
                                      label={type}/>
                                  })
                                }
                              </RadioGroup>
                            </FormControl>
                          </div>
                          <div>
                            <FormControl>
                              <div>
                                <b className='light'>Size</b>
                              </div>
                              <RadioGroup
                                value={data.chart_style.sizeType}
                                className='IndicatorsStyle-Size'
                                onChange={(evt) => {
                                  switch (evt.target.value) {
                                    case FixedSize:
                                      data.chart_style = {
                                        ...data.chart_style,
                                        sizeType: evt.target.value,
                                        size: data.chart_style.size ? data.chart_style.size : 10
                                      }
                                      break
                                    default:
                                      data.chart_style = {
                                        ...data.chart_style,
                                        sizeType: evt.target.value,
                                        minSize: data.chart_style.minSize ? data.chart_style.minSize : defaultMinSize,
                                        maxSize: data.chart_style.maxSize ? data.chart_style.maxSize : defaultMaxSize,
                                      }
                                  }
                                  updateData()
                                }}
                              >
                                {
                                  sizeTypes.map(type => {
                                    return <FormControlLabel
                                      key={type} value={type}
                                      control={<Radio/>}
                                      label={type}/>
                                  })
                                }
                              </RadioGroup>
                            </FormControl>
                          </div>
                        </Fragment>
                        : null
                      }
                      <div>
                        <div><b className='light'>Symbol Size</b></div>
                        <br/>
                        {
                          data.chart_style.sizeType === FixedSize ? <Fragment>
                            <table>
                              <tbody>
                              <tr>
                                <td>
                                  <input
                                    min={defaultMinSize}
                                    type="number" value={data.chart_style.size}
                                    onChange={evt => {
                                      data.chart_style.size = parseFloat(evt.target.value)
                                      updateData()
                                    }}/>
                                </td>
                                <td>&nbsp;px</td>
                              </tr>
                              </tbody>
                            </table>
                          </Fragment> : <Fragment>
                            <table>
                              <tbody>
                              <tr>
                                <td>Min :</td>
                                <td>
                                  <input
                                    min={defaultMinSize}
                                    type="number"
                                    value={data.chart_style.minSize}
                                    onChange={evt => {
                                      data.chart_style.minSize = parseFloat(evt.target.value)
                                      if (data.chart_style.maxSize < data.chart_style.minSize) {
                                        data.chart_style.maxSize = parseFloat(data.chart_style.minSize)
                                      }
                                      updateData()
                                    }}/>
                                </td>
                                <td>px</td>
                              </tr>
                              <tr>
                                <td>Max :</td>
                                <td>
                                  <input
                                    min={defaultMinSize}
                                    type="number"
                                    value={data.chart_style.maxSize}
                                    onChange={evt => {
                                      data.chart_style.maxSize = parseFloat(evt.target.value)
                                      if (data.chart_style.maxSize < data.chart_style.minSize) {
                                        data.chart_style.minSize = parseFloat(data.chart_style.maxSize)
                                      }
                                      updateData()
                                    }}/>
                                </td>
                                <td>px</td>
                              </tr>
                              </tbody>
                            </table>
                          </Fragment>
                        }
                      </div>
                    </div>
                  </div>
                ),
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
          <ThemeButton className='IndicatorStyleButton' onClick={() => {
            setOpen(true)
          }}>
            <CogIcon/> Config
          </ThemeButton>
          : ""
      }
    </Fragment>
  )
}