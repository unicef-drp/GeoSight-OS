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

import React, { useEffect, useState } from "react";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { Input } from "@mui/material";
import Slider from "@mui/material/Slider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  DesktopDateTimePicker
} from "@mui/x-date-pickers/DesktopDateTimePicker";
import TextField from "@mui/material/TextField";
import {
  LocalizationProvider
} from "@mui/x-date-pickers/LocalizationProvider";

import { SelectPlaceholder } from "../../Input";
import {
  getOperators,
  IS_BETWEEN,
  IS_IN,
  IS_LIKE,
  IS_NOT_IN,
  IS_NOT_LIKE,
  IS_NOT_NULL,
  IS_NULL,
  MULTI_SELECTABLE_OPERATORS,
  OPERATOR_WITH_INTERNEXT,
  OPERATOR_WITH_INTERVAL,
  SINGLE_SELECTABLE_OPERATORS
} from "../../../utils/queryExtraction";
import { capitalize, dictDeepCopy, nowUTC } from "../../../utils/main";
import {
  MultipleSelectWithSearch,
  SelectWithSearch
} from "../../Input/SelectWithSearch";
import { INTERNEXT_IDENTIFIER, INTERVAL_IDENTIFIER } from "./index";

// VARIABLES
// export const INTERVAL = ['minutes', 'hours', 'days', 'months', 'years']
export const INTERVAL = ['days', 'months', 'years']
const defaultMin = 0;
const defaultMax = 0;

export function WhereInputValue(
  { fieldType, operator, value, setValue, optionsData, disabled, ...props }
) {
  let betweenMin = defaultMin
  let betweenMax = defaultMax
  if (operator === IS_BETWEEN) {
    if (!isNaN(parseFloat(value[0]))) {
      betweenMin = parseFloat(value[0])
    }
    if (!isNaN(parseFloat(value[1]))) {
      betweenMax = parseFloat(value[1])
    }
  }
  const [initValue, setInitValue] = useState(value);
  const [initBetweenMin, setInitBetweenMin] = useState(betweenMin);
  const [initBetweenMax, setInitBetweenMax] = useState(betweenMax);
  const defaultInput = () => {
    return <Input
      type={fieldType}
      className='WhereConfigurationOperatorValue'
      placeholder='Put the value'
      value={value ? value : ""}
      onChange={(evt) => {
        if ([IS_IN, IS_NOT_IN].includes(operator)) {
          setValue(evt.target.value.split(','))
        } else {
          setValue(evt.target.value)
        }
      }}
      disabled={disabled}
    />
  }

  useEffect(() => {
    if (operator === IS_BETWEEN) {
      setInitBetweenMin(betweenMin)
      setInitBetweenMax(betweenMax)
    }
  }, [operator, value]);

  let min = null
  let max = null
  if (optionsData) {
    const data = optionsData.filter(row => {
      return row !== undefined && row !== null && !isNaN(row)
    }).map(row => {
      return parseFloat(row)
    })
    min = Math.min(...data)
    max = Math.max(...data)
    if (operator !== '=' && (isNaN(min) || !isFinite(min))) {
      min = defaultMin
    }
    if (operator !== '=' && (isNaN(max) || !isFinite(max))) {
      max = defaultMax
    }
    optionsData = optionsData.filter(row => {
      return row !== undefined && row !== null && row !== 'null'
    }).sort()
  }
  const textBasedOnMinMax = ((isNaN(min) && isNaN(max)) || (!isFinite(min) && !isFinite(max)))
  /** -------- IF DATE --------- **/
  if (fieldType?.toLowerCase() === 'date') {
    if ([">", ">=", "<", "<="].includes(operator)) {
      return <LocalizationProvider dateAdapter={AdapterMoment}>
        <DesktopDateTimePicker
          className='DatePickerInput'
          value={value}
          inputFormat="YYYY-MM-DDThh:mm:ss"
          onChange={(val) => {
            try {
              setValue(val._d.toISOString())
            } catch (err) {
            }
          }}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
    } else if (operator === IS_BETWEEN) {
      const min = (!(value[0]?.length > 3) ? nowUTC(true).toISOString() : value[0]).replaceAll("'", '')
      const max = (!(value[1]?.length > 3) ? nowUTC(true).toISOString() : value[1]).replaceAll("'", '')
      return <LocalizationProvider dateAdapter={AdapterMoment}>
        <div style={{ display: "flex" }}>
          <DesktopDateTimePicker
            className='DatePickerInput'
            value={min}
            maxDate={max}
            inputFormat="YYYY-MM-DDThh:mm:ss"
            onChange={(val) => {
              setValue([val._d.toISOString(), value[1]])
            }}
            renderInput={(params) => <TextField {...params} />}
          />
          <div className='BetweenDash'>-</div>
          <DesktopDateTimePicker
            className='DatePickerInput'
            value={max}
            minDate={min}
            inputFormat="YYYY-MM-DDThh:mm:ss"
            onChange={(val) => {
              setValue([value[0], val._d.toISOString()])
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>
      </LocalizationProvider>
    } else if (MULTI_SELECTABLE_OPERATORS.includes(operator)) {
      return <MultipleSelectWithSearch
        value={value}
        onChangeFn={(value) => {
          if (Array.isArray(value)) {
            setValue(value.map(val => val.value !== undefined ? val.value : val))
          } else {
            setValue(value.value !== undefined ? value.value : value)
          }
        }}
        options={optionsData ? optionsData : []}
        className='FilterInput'
        disabled={disabled}
        quickSelection={true}
        {...props}
      />
    }
  }
  if ([IS_NULL, IS_NOT_NULL].includes(operator)) {
    return null
  } else if ([IS_LIKE, IS_NOT_LIKE].includes(operator)) {
    return defaultInput()
  } else if ([OPERATOR_WITH_INTERVAL, OPERATOR_WITH_INTERNEXT].includes(operator)) {
    let timeValue = ""
    let timeType = ""
    const IDENTIFIER = operator === OPERATOR_WITH_INTERVAL ? INTERVAL_IDENTIFIER : INTERNEXT_IDENTIFIER
    try {
      const [newTimeValue, newTimeType] = value.replace(INTERVAL_IDENTIFIER, '').replace(INTERNEXT_IDENTIFIER, '').split(' ')
      timeValue = newTimeValue
      timeType = newTimeType
    } catch (err) {

    }
    return <div className='DateOperator'>
      <span
        className='WhereConfigurationOperatorText'>{operator === OPERATOR_WITH_INTERVAL ? 'Last' : 'Next'}</span>
      <Input
        type="number"
        className={'WhereConfigurationOperatorValue'}
        value={timeValue ? timeValue : ""}
        onChange={(evt) => {
          setValue(`${evt.target.value && evt.target.value >= 0 ? evt.target.value : 0} ${timeType}${IDENTIFIER}`)
        }}
        disabled={disabled}
      />
      <SelectPlaceholder
        placeholder='Pick a time'
        className={'WhereConfigurationOperatorType'}
        list={
          INTERVAL.map((key, idx) => {
            return { id: key, name: capitalize(key) }
          })
        }
        initValue={timeType ? timeType : ""}
        onChangeFn={(value) => {
          setValue(`${timeValue} ${value}${IDENTIFIER}`)
        }}
        disabled={disabled}
      />
    </div>
  } else if (MULTI_SELECTABLE_OPERATORS.includes(operator)) {
    return <MultipleSelectWithSearch
      value={value}
      onChangeFn={(value) => {
        if (Array.isArray(value)) {
          setValue(value.map(val => val.value !== undefined ? val.value : val))
        } else {
          setValue(value.value !== undefined ? value.value : value)
        }
      }}
      options={optionsData ? optionsData : []}
      className='FilterInput'
      disabled={disabled}
      {...props}
    />
  } else if (SINGLE_SELECTABLE_OPERATORS.includes(operator) && textBasedOnMinMax) {
    if (!optionsData) {
      return defaultInput()
    }
    return <SelectWithSearch
      value={value}
      onChangeFn={(value) => {
        if (Array.isArray(value)) {
          setValue(value.map(val => val.value))
        } else if ((value === Object)) {
          setValue(value.value)
        } else {
          setValue(value)
        }
      }}
      options={optionsData}
      className='FilterInput'
      disabled={disabled}
      {...props}
    />
  } else if (operator === IS_BETWEEN) {
    if (isNaN(min) || isNaN(max)) {
      return null
    }
    return <div
      className='FilterInput MuiInputSliderWithInput MuiInputSliderWithInputMulti'>
      <Input
        value={initBetweenMin}
        size="small"
        onChange={(event) => {
          const val = parseFloat(event.target.value)
          setValue([val > initBetweenMax ? initBetweenMax : val, initBetweenMax]);
        }}
        inputProps={{
          min: min,
          max: max,
          type: 'number',
        }}
        disabled={disabled}
      />
      <div className='MuiInputSlider'>
        <Slider
          value={[initBetweenMin, initBetweenMax]}
          step={max >= 5 ? 1 : max <= 1 ? 0.01 : 0.1}
          min={min ? min : 0}
          max={max ? max : 0}
          onChange={(event) => {
            setInitBetweenMin(event.target.value[0])
            setInitBetweenMax(event.target.value[1])
          }}
          onChangeCommitted={(e) => setValue([initBetweenMin, initBetweenMax])}
          disabled={disabled}
        />
      </div>
      <Input
        value={initBetweenMax}
        size="small"
        onChange={(event) => {
          const val = parseFloat(event.target.value)
          setValue([initBetweenMin, val < initBetweenMin ? initBetweenMin : val]);
        }}
        inputProps={{
          min: min,
          max: max,
          type: 'number',
        }}
        disabled={disabled}
      />
    </div>
  } else {
    if (!isNaN(min) || !isNaN(max)) {
      const moreThan = [">", ">="].includes(operator)
      const isEqual = ["="].includes(operator)
      return <div
        className={'MuiInputSliderWithInput ' + (isEqual ? 'Single' : '')}>
        <Input
          className={'MinValue'}
          value={moreThan ? initValue : min}
          size="small"
          onChange={(event) => {
            if (moreThan) {
              const val = parseFloat(event.target.value)
              setInitValue(val);
              setValue(val);
            }
          }}
          inputProps={{
            min: min,
            max: max,
            type: 'number',
          }}
          disabled={disabled || !moreThan}
        />
        <div className='MuiInputSlider'>
          <Slider
            value={initValue === '' ? 0 : parseFloat(initValue)}
            step={max >= 5 ? 1 : max <= 1 ? 0.01 : 0.1}
            min={min ? min : 0}
            max={max ? max : 1000}
            onChange={(event) => {
              setInitValue(event.target.value)
            }}
            track={moreThan ? "inverted" : !isEqual}
            onChangeCommitted={(e) => {
              setValue(initValue)
            }}
            disabled={disabled}
          />
        </div>
        <Input
          value={!moreThan ? initValue : max}
          size="small"
          onChange={(event) => {
            if (!moreThan) {
              const val = parseFloat(event.target.value)
              setInitValue(val);
              setValue(val);
            }
          }}
          inputProps={{
            min: min,
            max: max,
            type: 'number',
          }}
          disabled={disabled || moreThan}
        />
      </div>
    }
  }
  {
    return defaultInput()
  }
}

export default function WhereInput(
  { where, upperWhere, updateWhere, fields, disabledChanges = {}, ...props }) {

  // UPDATE THE OPERATOR
  // If it has :interval, it is last x (time)
  const value = where.value
  const field = where.field
  const currentField = fields.find(fieldDef => fieldDef.name === field.replaceAll('"', ''))
  let operator = ('' + value)?.includes(INTERVAL_IDENTIFIER) ? OPERATOR_WITH_INTERVAL : ('' + value)?.includes(INTERNEXT_IDENTIFIER) ? OPERATOR_WITH_INTERNEXT : where.operator;

  // Check the input type
  let fieldType = currentField?.type ? currentField?.type : 'text'
  if (currentField?.type !== 'date') {
    fieldType = currentField?.type
    if (currentField?.options) {
      fieldType = 'number'
      currentField?.options.map(option => {
        if (isNaN(parseFloat(option))) {
          fieldType = 'text'
        }
      })
    }
  }

  // Check the fields
  if ([OPERATOR_WITH_INTERVAL, OPERATOR_WITH_INTERNEXT].includes(operator)) {
    fields = dictDeepCopy(fields)
    fields = fields.filter(fieldDef => fieldDef.type === 'date')
  }

  let UPDATED_OPERATOR = getOperators(fieldType, props.isSimplified)

  let showOperator = false
  let isDate = fieldType?.toLowerCase() === 'date'
  if (fieldType?.toLowerCase() === 'date') {
    if ([">", ">=", "<", "<="].includes(operator)) {
      showOperator = true
    }
  }
  return <div
    className={'WhereConfigurationQuery ' + (props.isSimplified ? 'Simplified' : '') + (showOperator ? ' ShowOperator' : '') + (isDate ? ' IsDate' : '')}>
    <SelectPlaceholder
      placeholder='Pick the field'
      className={'WhereConfigurationField'}
      list={
        fields.map(
          field => field.name ? {
            id: field.name,
            name: field.name,
          } : {
            id: field,
            name: field
          }
        )
      }
      initValue={field ? field.replaceAll('"', '') : ""}
      onChangeFn={(value) => {
        where.field = value
        updateWhere()
      }}
      disabled={disabledChanges.field}
    />
    <SelectPlaceholder
      placeholder='Pick an operation'
      className={'WhereConfigurationOperator ' + (!Object.keys(UPDATED_OPERATOR).includes(operator) ? 'Error' : '')}
      list={
        Object.keys(UPDATED_OPERATOR).map((key, idx) => {
          return { id: key, name: UPDATED_OPERATOR[key] }
        })
      }
      initValue={operator ? operator : ""}
      onChangeFn={(value) => {
        if (value === OPERATOR_WITH_INTERVAL) {
          where.operator = '>'
          where.value = "1 days::interval"
        } else if (value === OPERATOR_WITH_INTERNEXT) {
          where.operator = '<'
          where.value = "1 days::internext"
        } else if ([IS_IN, IS_NOT_IN].includes(value)) {
          where.operator = value
          if (where.value.includes(INTERVAL_IDENTIFIER) || where.value.includes(INTERNEXT_IDENTIFIER)) {
            where.value = []
          }
          if (!Array.isArray(where.value)) {
            if (where.value) {
              where.value = ('' + where.value).split(',')
            } else {
              where.value = []
            }
          }
        } else {
          where.operator = value
          if (Array.isArray(where.value)) {
            where.value = where.value[0]
          }
          if (where.value) {
            where.value = ('' + where?.value).replace(INTERVAL_IDENTIFIER, '').replace(INTERNEXT_IDENTIFIER, '')
          } else {
            where.value = ''
          }
        }
        updateWhere()
      }}
      disabled={disabledChanges.operator}
    />
    <WhereInputValue
      fieldType={fieldType} operator={operator} value={value}
      setValue={(value) => {
        where.value = value
        updateWhere()
      }}
      optionsData={currentField?.options}
      disabled={disabledChanges.value}
      {...props}
    />
    <div className='Separator'/>
    {
      disabledChanges.remove ? null :
        <RemoveCircleIcon className='RemoveIcon' onClick={
          () => {
            const index = upperWhere.queries.indexOf(where);
            if (index > -1) {
              upperWhere.queries.splice(index, 1)
            }
            updateWhere()
          }
        }/>
    }
  </div>
}