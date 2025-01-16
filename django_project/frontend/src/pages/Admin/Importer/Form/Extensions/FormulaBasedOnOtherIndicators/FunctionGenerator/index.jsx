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
 * __date__ = '22/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useState } from 'react';
import Grid from "@mui/material/Grid";
import { Input } from "@mui/material";
import { capitalize, nowUTC } from "../../../../../../../utils/main";
import DateTimeInput from "../../../../../Components/Input/DateTimeInput";
import { SaveButton } from "../../../../../../../components/Elements/Button";
import { Select } from "../../../../../../../components/Input";
import IndicatorSelector
  from "../../../../../../../components/ResourceSelector/IndicatorSelector"

import './style.scss';;

/**
 * Time Config
 */
function TimeConfig({ label, type, value, onChange, options }) {
  const renderConfig = () => {
    switch (type.value) {
      case 'none':
        return null
      case 'now':
        return null
      case 'fixed':
        return <DateTimeInput
          label={label + ' date time.'}
          value={value}
          onChange={({ value, error }) => {
            if (!error) {
              onChange({
                type: type,
                value: value
              })
            }
          }}/>
      default:
        return <Fragment>
          <Input
            type='number'
            value={value}
            onChange={(evt) => {
              let newValue = evt.target.value
              if (!newValue) {
                newValue = 1
              }
              onChange({
                type: type,
                value: newValue
              })
            }}
          />
          &nbsp;<span>{type.value.replace('last x', '')}</span>
        </Fragment>
    }
  }

  return <div className="BasicFormSection">
    <label className="form-label required" htmlFor="group">{label}</label>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Select
          options={options.map(row => {
            return {
              label: capitalize(row),
              value: row
            }
          })}
          placeholder={'Select aggregation'}
          value={type}
          onChange={(evt) => {
            const newType = evt
            let newValue = null

            switch (evt.value) {
              case 'none':
                newValue = null
                break
              case 'now':
              case 'fixed':
                const date = nowUTC()
                date.setSeconds(0)
                newValue = date.toISOString()
                break
              default:
                newValue = 1
                break
            }
            onChange({
              type: newType,
              value: newValue
            })
          }}
          menuPlacement={'top'}
        />
      </Grid>
      <Grid item xs={6}>
        {renderConfig()}
      </Grid>
    </Grid>
  </div>
}

/**
 * Function generator
 */
export default function FunctionGenerator(
  { selectedIndicators, functionTarget, onApply, close }
) {
  const getValueFunc = functionTarget === 'get_value'
  const nonTimeValues = ['none', 'now']
  const timesValues = ['fixed', 'last x day(s)', 'last x month(s)', 'last x year(s)']

  const [selectedIndicator, setSelectedIndicator] = useState([])
  const [geometryType, setGeometryType] = useState(null)
  const [aggregation, setAggregation] = useState(null)
  const [t1Type, setT1Type] = useState({
    label: 'None',
    value: 'none',
  })
  const [t1Value, setT1Value] = useState(null)
  const [t2Type, setT2Type] = useState({
    label: 'Now',
    value: 'now'
  })
  const date = nowUTC()
  date.setSeconds(0)
  const [t2Value, setT2Value] = useState(date.toISOString())

  const ready = () => {
    const t1Ready = (nonTimeValues.includes(t1Type.value) || (timesValues.includes(t1Type.value) && t1Value))
    const t2Ready = (nonTimeValues.includes(t2Type.value) || (timesValues.includes(t2Type.value) && t2Value))
    if (getValueFunc) {
      return t1Ready && t2Ready && selectedIndicator.length && geometryType && aggregation
    }
    return t1Ready && t2Ready && selectedIndicator.length && geometryType
  }
  return <form className='BasicForm'>
    <div className="BasicFormSection">
      <label className="form-label required" htmlFor="group">
        Selected indicator
      </label>
      <IndicatorSelector
        initData={selectedIndicator}
        dataSelected={selectedData => {
          setSelectedIndicator(selectedData)
        }}
        defaults={{
          filters: {
            id__in: selectedIndicators
          }
        }}
      />
    </div>
    <div className="BasicFormSection">
      <label className="form-label required" htmlFor="group">
        Geometry Type
      </label>
      <Select
        options={['current', 'parent', 'children', 'siblings'].map(row => {
          return {
            label: capitalize(row),
            value: row
          }
        })}
        placeholder={'Select geometry type'}
        value={geometryType}
        onChange={(evt) => {
          setGeometryType(evt)
        }}
      />
    </div>

    <TimeConfig
      label='t1 (StartTime)'
      type={t1Type}
      value={t1Value}
      onChange={({ type, value }) => {
        setT1Type(type)
        setT1Value(value)
      }}
      options={nonTimeValues.concat(timesValues)}
    />

    <TimeConfig
      label='t2 (EndTime)'
      type={t2Type}
      value={t2Value}
      onChange={({ type, value }) => {
        setT2Type(type)
        setT2Value(value)
      }}
      options={['now'].concat(timesValues)}
    />

    {
      getValueFunc ?
        <div className="BasicFormSection">
          <label className="form-label required" htmlFor="group">
            Aggregation
          </label>
          <Select
            options={['last', 'min', 'max', 'avg'].map(row => {
              return {
                label: capitalize(row),
                value: row
              }
            })}
            placeholder={'Select aggregation'}
            value={aggregation}
            onChange={(evt) => {
              setAggregation(evt)
            }}
            menuPlacement={'top'}
          />
        </div> : null
    }

    <div className='Save-Button'>
      <SaveButton
        variant="primary"
        text={"Update Selection"}
        disabled={!ready()}
        onClick={() => {
          let func;
          let t1 = t1Value
          if (t1Type.value.includes('last x')) {
            t1 = t1Type.value.replace('x', t1)
          }
          let t2 = t2Value
          if (t2Type.value.includes('last x')) {
            t2 = t2Type.value.replace('x', t2)
          }
          if (getValueFunc) {
            func = `get_value("${selectedIndicator[0].shortcode}", "${geometryType.value}", ${t1 ? '"' + t1 + '"' : 'null'}, "${t2}", "${aggregation.value}")`
          } else {
            func = `get_values("${selectedIndicator[0].shortcode}", "${geometryType.value}", ${t1 ? '"' + t1 + '"' : 'null'}, "${t2}")`
          }
          onApply(func)
          close()
        }}
      />
    </div>
  </form>
}
