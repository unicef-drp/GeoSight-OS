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

/** Specifically for Reference Layer <> Level input */

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import Match from "../../../../utils/Match";
import DateTimeInput from "./DateTimeInput";
import { optionsToList } from "../../../../utils/main";

/**
 * Date time formats, value is format on python
 */
const dateTimeFormats = [
  { label: 'Timestamp', value: 'timestamp' },
  { label: 'Date Time (YYYY-MM-DDTHH:MM:SS)', value: '%Y-%m-%dT%H:%M:%S' },
  { label: 'Year (YYYY) - will be translated into YYYY-01-01', value: '%Y' },
  { label: 'Date (YYYY-MM-DD)', value: '%Y-%m-%d' },
  {
    label: 'Year-Month (YYYY-MM) - will be translated into YYYY-MM-01',
    value: '%Y-%m'
  },
]

/**
 * Specific for date time field settings.
 * @param {Array} attributes Attributes of data.
 * @param {String} field Field data.
 * @param {Function} fieldChanged When field changed .
 * @param {String} format Format data.
 * @param {Function} formatChanged When format changed .
 */
export function DateTimeDataFieldSetting(
  { attributes, field, fieldChanged, format, formatChanged }
) {

  // Set default field
  useEffect(
    () => {
      let date_field = Match.inList.date(optionsToList(attributes))
      if (field) {
        date_field = field
      }
      if (!field && date_field) {
        fieldChanged(date_field)
      }
    }, [attributes, field]
  )

  // Set default format
  useEffect(
    () => {
      if (!format) {
        formatChanged(dateTimeFormats[1].value)
      }
    }, [attributes, format]
  )
  return <Grid container spacing={2}>
    <Grid item xs={6}>
      <label
        className="form-label required" htmlFor="group">
        Date Time Column/Field
      </label>
      {
        attributes?.length ?
          <SelectWithList
            placeholder={'Date Time Column/Field'}
            list={attributes}
            value={field}
            showFloatingLabel={true}
            onChange={evt => {
              fieldChanged(evt.value)
            }}
          /> :
          <input
            type={'text'}
            placeholder={'Field for the date'}
            value={field}
            onChange={evt => {
              fieldChanged(evt.target.value)
            }}
          />
      }
    </Grid>
    <Grid item xs={6}>
      <label
        className="form-label required" htmlFor="group">
        Date Time Format
      </label>
      <SelectWithList
        list={dateTimeFormats}
        value={format}
        showFloatingLabel={true}
        onChange={evt => {
          formatChanged(evt.value)
        }}
      />
      <span className='form-helptext'>
        Specify input date/time format (e.g: YYYY-MM-DD or YYYY-MM).
        Excel usually converts time to timestamp format.
      </span>
    </Grid>
  </Grid>
}

/**
 * Reference layer specified input
 * @param {string} data .
 * @param {Function} setData .
 * @param {Array} attributes .
 * @param {Boolean} valueOnly If the data just a value only.
 */
export const DateTimeSettings = forwardRef(
  ({
     data, setData, attributes, valueOnly, drivenOnly
   }, ref
  ) => {
    const prevState = useRef()
    const [error, setError] = useState('');
    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          !(data.date_time_data_type === 'Data Driven' && !data.date_time_data_field) &&
          !(data.date_time_data_type === 'By Value' && prevState.error)
        )
      }
    }));
    /**
     * Switch time type
     */
    const switchTo = (type) => {
      data.date_time_data_type = type
      switch (type) {
        case 'Now': {
          delete data.date_time_data_value
          delete data.date_time_data_field
          delete data.date_time_data_format
          delete data.date_data_field
          delete data.time_data_field
          break
        }
        case 'By Value': {
          data.date_time_data_value = new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()
          delete data.date_time_data_field
          delete data.date_time_data_format
          delete data.date_data_field
          delete data.time_data_field
          break
        }
        case 'Data Driven': {
          delete data.date_time_data_value
          delete data.time_data_field
          break
        }
      }
      setData({ ...data })
    }

    // Set default data
    useEffect(
      () => {
        if (!data.date_time_data_type) {
          switchTo('By Value')
        } else if (valueOnly && data.date_time_data_type === 'Data Driven') {
          switchTo('By Value')
        } else if (drivenOnly && data.date_time_data_type !== 'Data Driven') {
          switchTo('Data Driven')
        }
      }, [data]
    )

    // Set default data
    useEffect(
      () => {
        if (data.date_time_data_type === 'Data Driven') {
          switchTo('Data Driven')
          setData({ ...data })
        }
      }, [attributes]
    )
    return (
      <div>
        {
          data.date_time_data_type ?
            <FormControl className="BasicFormSection">
              <div>
                <label className="form-label required">
                  Date Time Setting
                </label>
              </div>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <RadioGroup
                    name="schedule_type"
                    value={data.date_time_data_type}
                    onChange={evt => {
                      switchTo(evt.target.value)
                    }}
                  >
                    <FormControlLabel
                      disabled={drivenOnly}
                      value={'By Value'} control={<Radio/>}
                      label={'Selected Date'}/>
                    <FormControlLabel
                      disabled={valueOnly}
                      value={'Data Driven'} control={<Radio/>}
                      label={'Data-Driven Date'}/>
                    <FormControlLabel
                      disabled={drivenOnly}
                      value={'Now'} control={<Radio/>}
                      label={'Now (Current date/time of the run)'}/>
                  </RadioGroup>
                </Grid>

                {
                  data.date_time_data_type === 'By Value' ?
                    <Grid item xs={6}>
                      <DateTimeInput
                        label="Date Time of Data"
                        value={data.date_time_data_value}
                        onChange={({ value, error }) => {
                          if (!error) {
                            data.date_time_data_value = value
                          }
                          prevState.error = error
                          setData({ ...data })
                        }}/>
                    </Grid> :
                    data.date_time_data_type === 'Data Driven' ?
                      <Grid item xs={6}>
                        <DateTimeDataFieldSetting
                          attributes={attributes}
                          field={data.date_time_data_field}
                          fieldChanged={field => {
                            data.date_time_data_field = field
                            setData({ ...data })
                          }}
                          format={data.date_time_data_format}
                          formatChanged={format => {
                            data.date_time_data_format = format
                            setData({ ...data })

                          }}/>
                      </Grid>
                      : null
                }
              </Grid>
            </FormControl> : null
        }
      </div>
    );
  }
)