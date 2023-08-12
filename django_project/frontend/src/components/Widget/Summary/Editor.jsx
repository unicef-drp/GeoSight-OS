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

/* ==========================================================================
   SUMMARY EDITOR
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import { Button, FormControl, Input, InputLabel, Radio } from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { DEFINITION } from "../index"
import Modal, { ModalContent, ModalHeader } from "../../Modal";
import { indicatorLayersLikeIndicator } from "../../../utils/indicatorLayer";
import { RemoveIcon } from "../../Icons";

/**
 * Edit section for widget.
 * @param {bool} open Is open or close.
 * @param {Function} setData Set data function.
 * @param {object} data Widget Data.
 * @param {React.Component} children React component to be rendered
 */
export default function WidgetEditor(
  { open, setData, data, children }
) {
  const {
    indicators,
    indicatorLayers
  } = useSelector(state => state.dashboard.data);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [layerID, setLayerID] = useState('');
  const [layerType, setLayerType] = useState('');
  const [operation, setOperation] = useState('');
  const [unit, setUnit] = useState('');
  const [property, setProperty] = useState('');
  const [additionalData, setAdditionalData] = useState({});

  const [dateFilterType, setDateFilterType] = useState('');
  const [dateFilterValue, setDateFilterValue] = useState('');
  const [minDateFilter, setMinDateFilter] = useState(0)
  const [maxDateFilter, setMaxDateFilter] = useState(0)

  // On data Changed
  useEffect(() => {
    const { name, description, config } = data
    const {
      layer_id,
      layer_used,
      operation,
      unit,
      property,
      date_filter_type,
      date_filter_value
    } = config
    setName(name ? name : '')
    setDescription(description ? description : '')
    setLayerID(layer_id ? layer_id : '')
    setLayerType(layer_used ? layer_used : definition.WidgetLayerUsed.INDICATOR)
    setOperation(operation ? operation : DEFINITION.WidgetOperation.SUM)
    setUnit(unit ? unit : '')
    setProperty(property ? property : '')
    setDateFilterType(date_filter_type ? date_filter_type : 'No filter')
    const dateFilterValue = date_filter_value ? date_filter_value : ''
    setDateFilterValue(dateFilterValue)

    let [minDateFilter, maxDateFilter] = dateFilterValue.split(';')
    if ((new Date(minDateFilter)).toString() === 'Invalid Date') {
      minDateFilter = new Date().toISOString()
    }
    if ((new Date(maxDateFilter)).toString() === 'Invalid Date') {
      maxDateFilter = null
    }
    setMinDateFilter(minDateFilter ? minDateFilter : new Date().toISOString())
    setMaxDateFilter(maxDateFilter)

    setAdditionalData({})
  }, [data])

  /** On Closed modal **/
  const onClosed = () => {
    setData();
  };

  /** On apply **/
  const onApply = () => {
    if (!data.config) {
      data.config = {}
    }
    const config = {
      ...data.config,
      ...additionalData,
      layer_id: layerID,
      layer_used: layerType,
      operation: operation,
      unit: unit,
      property: property,
      date_filter_type: dateFilterType,
      date_filter_value: [minDateFilter, maxDateFilter].join(';')
    }
    const newData = {
      ...data,
      ...{
        name: name,
        description: description,
        config: config
      }
    }
    setData(newData)
  }

  // Format indicator list
  const indicatorList = indicators.map(function (indicator) {
    return [indicator.id, indicator.name]
  })
  const indicatorLayerList = indicatorLayersLikeIndicator(indicatorLayers).map(function (indicator) {
    return [indicator.id, indicator.name]
  })


  let selectedData = {
    concept_uuid: '',
    date: '',
    geometry_code: '',
    value: '',
    label: ''
  };

  return (
    <Fragment>
      <Modal
        open={open}
        onClosed={onClosed}
        className='modal__widget__editor MuiFormControl-Form'
      >
        <ModalHeader onClosed={onClosed}>
          {name ? "Change " + name : "New Widget"}
        </ModalHeader>
        <ModalContent>
          <FormControl>
            <InputLabel>Widget name</InputLabel>
            <Input type="text" placeholder="Widget name"
                   onChange={(event) => {
                     setName(event.target.value)
                   }}
                   value={name}
            />
          </FormControl>
          <FormControl>
            <InputLabel>Widget description</InputLabel>
            <Input type="text"
                   placeholder="Widget description"
                   onChange={(event) => {
                     setDescription(event.target.value)
                   }}
                   value={description}
            />
          </FormControl>
          <FormControl>
            <InputLabel>Unit</InputLabel>
            <Input type="text"
                   placeholder="Unit"
                   onChange={(event) => {
                     setUnit(event.target.value)
                   }}
                   value={unit}
            />
          </FormControl>
          <FormControl>
            <InputLabel>Layer Type</InputLabel>
            <Select
              onChange={(event) => {
                setLayerType(event.target.value)
              }}
              value={layerType}
            >
              {
                Object.keys(definition.WidgetLayerUsed).map((key, index) => (
                  <MenuItem
                    key={index}
                    value={definition.WidgetLayerUsed[key]}>
                    {definition.WidgetLayerUsed[key]}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Source Layer</InputLabel>
            <Select
              onChange={(event) => {
                setLayerID(event.target.value)
              }}
              value={layerID}
            >
              {
                (layerType === definition.WidgetLayerUsed.INDICATOR ? indicatorList : indicatorLayerList).map(function (indicator, index) {
                  return <MenuItem
                    key={index}
                    value={indicator[0]}>
                    {indicator[1]}
                  </MenuItem>
                })
              }
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Operation</InputLabel>
            <Select
              onChange={(event) => {
                setOperation(event.target.value)
              }}
              value={operation}
            >
              {
                Object.keys(DEFINITION.WidgetOperation).map((key, index) => (
                  <MenuItem
                    key={index}
                    value={DEFINITION.WidgetOperation[key]}>
                    {DEFINITION.WidgetOperation[key]}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Source Value</InputLabel>
            <Select
              onChange={(event) => {
                setProperty(event.target.value)
              }}
              value={property}
            >
              {
                Object.keys(selectedData).map((key, index) => (
                  <MenuItem
                    key={index}
                    value={key}>{key}</MenuItem>
                ))
              }
            </Select>
          </FormControl>

          {
            React.Children.map(children, child => {
              return React.cloneElement(child, {
                data,
                selectedData,
                setAdditionalData
              })
            })
          }

          <FormControl className='MuiForm-RadioGroup'>
            <FormLabel className="MuiInputLabel-root">Datetime</FormLabel>
            <RadioGroup value={dateFilterType} onChange={(evt) => {
              setDateFilterType(evt.target.value)
            }}>
              <FormControlLabel
                value="No filter" control={<Radio/>}
                label="No filter (global latest values will be used)"/>
              <FormControlLabel
                value="Global datetime filter" control={<Radio/>}
                label="Use datetime filter from Dashboard level."/>
              <FormControlLabel
                value="Custom filter" control={<Radio/>}
                label="Use custom datetime filter."/>
            </RadioGroup>

            {
              dateFilterType === "Custom filter" ?
                <div className='BasicForm'>
                  <div className='CustomDateFilterValues BasicFormSection'>
                    <DatePicker
                      showTimeSelect
                      dateFormat="dd-MM-yyyy hh:mm:ss"
                      selected={minDateFilter ? new Date(minDateFilter) : null}
                      maxDate={new Date(maxDateFilter)}
                      onChange={date => {
                        setMinDateFilter(new Date(date).toISOString())
                      }}
                    />
                    <div className='Separator'><RemoveIcon/></div>
                    <DatePicker
                      showTimeSelect
                      dateFormat="dd-MM-yyyy hh:mm:ss"
                      selected={maxDateFilter ? new Date(maxDateFilter) : null}
                      minDate={new Date(minDateFilter)}
                      onChange={date => {
                        if (date) {
                          setMaxDateFilter(new Date(date).toISOString())
                        } else {
                          setMaxDateFilter(null)
                        }
                      }}
                    />
                  </div>
                  <div className='helptext' style={{ width: '100%' }}>
                    Make the max date empty to make the data filtered up to
                    `today`.
                  </div>
                </div> :
                ""
            }
          </FormControl>

          <Button
            variant="primary"
            className="modal__widget__editor__apply"
            onClick={onApply}
            disabled={!name || !layerType || !operation || !property}
          >
            Apply
          </Button>
        </ModalContent>
      </Modal>
    </Fragment>
  )
}
