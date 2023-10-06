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

/** Specifically for Reference Layer <> Level input */

import React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * Specific for date time field settings.
 * @param {String} label Label of input.
 * @param {String} value Value in iso string.
 * @param {Function} onChange When format changed .
 */
export default function DateTimeInput(
  { label = "Date time", value, onChange }
) {
  let usedValue = value
  try {
    usedValue = dayjs.utc(value)
  } catch (err) {
  }
  return <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DateTimePicker
      ampm={false}
      inputFormat="YYYY-MM-DD HH:mm:ss"
      renderInput={(props) => <TextField {...props} />}
      label={label}
      value={usedValue}
      onChange={(newValue) => {
        try {
          onChange({
            value: new Date(newValue).toISOString(),
            error: false
          })
        } catch (err) {
          onChange({
            value: value,
            error: false
          })
        }
      }}
    />
    <span className='form-helptext'>Selected date time of data should be in UTC.</span>
  </LocalizationProvider>
}
