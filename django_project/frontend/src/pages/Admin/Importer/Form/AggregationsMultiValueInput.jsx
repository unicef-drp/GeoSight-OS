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

/** Specifically for Indicator input */

import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle
} from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import Grid from '@mui/material/Grid';
import Aggregation from "./Extensions/QueryForm/Aggregation";

const aggregationValueType = {
  BY_INDICATOR: 'Use aggregation from indicator',
  DEFAULT: 'Default Aggregations'
}

/**
 * Indicator specified input
 * @param {string} data .
 * @param {Function} setData .
 * @param {Array} attributes .
 * @param {Array} indicatorList .
 */
export const AggregationsMultiValueInput = forwardRef(
  ({ data, setData }, ref
  ) => {
    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          !(data.aggregate_multiple_value && data.aggregate_multiple_value_type === aggregationValueType.DEFAULT && (!data.aggregate_multiple_value_string || data.aggregate_multiple_value_number))
        )
      }
    }));
    /**
     * Switch time type
     */
    const switchTo = (type) => {
      data.aggregate_multiple_value = type
      switch (type) {
        case false: {
          delete data.aggregate_multiple_value_type
          delete data.aggregate_multiple_value_string
          delete data.aggregate_multiple_value_number
          break
        }
        case true: {
          data.aggregate_multiple_value_type = aggregationValueType.BY_INDICATOR
          break
        }
      }
      setData({ ...data })
    }

    // Set default data
    useEffect(
      () => {
        if (data.aggregate_multiple_value === undefined) {
          switchTo(false)
        }
      }, [data]
    )
    return (
      <Fragment>
        <FormControl className="BasicFormSection">
          <label className="form-label required">
            Handling multiple values
          </label>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <RadioGroup
                name="schedule_type"
                value={data.aggregate_multiple_value + ''}
                onChange={evt => {
                  switchTo(evt.target.value === 'true')
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <FormControlLabel
                      value={false}
                      control={<Radio/>}
                      label={'Last value'}/>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControlLabel
                      value={true}
                      control={<Radio/>}
                      label={'Aggregate'}/>
                  </Grid>
                </Grid>
              </RadioGroup>
            </Grid>
          </Grid>
          {
            data.aggregate_multiple_value + '' === 'true' ?
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <br/>
                  <RadioGroup
                    name="schedule_type"
                    value={data.aggregate_multiple_value_type}
                    onChange={evt => {
                      data.aggregate_multiple_value_type = evt.target.value
                      if (evt.target.value === aggregationValueType.BY_INDICATOR) {
                        delete data.aggregate_multiple_value_number
                        delete data.aggregate_multiple_value_string
                      }
                      setData({ ...data })
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <FormControlLabel
                          value={aggregationValueType.BY_INDICATOR}
                          control={<Radio/>}
                          label={aggregationValueType.BY_INDICATOR}/>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControlLabel
                          value={aggregationValueType.DEFAULT}
                          control={<Radio/>}
                          label={aggregationValueType.DEFAULT}/>
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </Grid>
                {
                  data.aggregate_multiple_value_type === aggregationValueType.DEFAULT ?
                    <Grid item xs={6}>
                      <FormControl className="BasicFormSection">
                        <label className="form-label required">
                          Numbers
                        </label>
                        <Aggregation
                          data={data.aggregate_multiple_value_number ? data.aggregate_multiple_value_number : ''}
                          setData={newData => {
                            data.aggregate_multiple_value_number = newData
                            setData({ ...data })
                          }}
                          fields={
                            [{
                              'value': 'value',
                              'name': 'value',
                              'type': 'Number'
                            }]
                          }
                          aggregateValueType={'Number'}
                        />
                        <br/>
                        <label className="form-label required">
                          Categories
                        </label>
                        <Aggregation
                          data={data.aggregate_multiple_value_string ? data.aggregate_multiple_value_string : ''}
                          setData={newData => {
                            data.aggregate_multiple_value_string = newData
                            setData({ ...data })
                          }}
                          fields={
                            [{
                              'value': 'value',
                              'name': 'value',
                              'type': 'Number'
                            }]
                          }
                          aggregateValueType={'String'}
                        />
                      </FormControl>
                    </Grid> : null
                }
              </Grid>
              : null
          }
        </FormControl>
      </Fragment>
    );
  }
)