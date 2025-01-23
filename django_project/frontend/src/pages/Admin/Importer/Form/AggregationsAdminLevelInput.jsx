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

import React, { forwardRef, Fragment, useImperativeHandle } from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import Aggregation from "./Extensions/QueryForm/Aggregation";

const aggregationEnabled = {
  NONE: "Don't aggregate",
  LEVEL_UP: 'Aggregate up to level',
  N_LEVEL: 'Aggregate n level up',
}

const aggregationValueType = {
  BY_INDICATOR: 'Use default aggregation from indicator',
  BY_INDICATOR_TOOLTIP: 'For each imported indicator, it\'s default aggregation method, ' +
    'configured at the indicator level, will be used.',
  DEFAULT: 'Use custom aggregations',
  DEFAULT_TOOLTIP: 'Custom aggregation method will be applied to all imported indicators. ' +
    'A separate method will be applied to all numerical (integer or float) indicators ' +
    'and a separate method will be applied to all category-based indicators.'
}

/**
 * Indicator specified input
 * @param {string} data .
 * @param {Function} setData .
 * @param {Array} attributes .
 * @param {Array} indicatorList .
 */
export const AggregationsAdminLevelInput = forwardRef(
  ({ data, setData }, ref
  ) => {
    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          !(data.aggregate_upper_level_type === aggregationValueType.DEFAULT && (!data.aggregate_upper_level_string || data.aggregate_upper_level_number))
        )
      }
    }));

    let type = aggregationEnabled.NONE
    if (data.aggregate_upper_level_up_to !== undefined) {
      type = aggregationEnabled.LEVEL_UP
    }
    if (data.aggregate_upper_level_n_level_up !== undefined) {
      type = aggregationEnabled.N_LEVEL
    }

    /**
     * Switch time type
     */
    const switchTo = (type) => {
      switch (type) {
        case aggregationEnabled.NONE: {
          delete data.aggregate_upper_level_type
          delete data.aggregate_upper_level_up_to
          delete data.aggregate_upper_level_n_level_up
          break
        }
        case aggregationEnabled.LEVEL_UP: {
          delete data.aggregate_upper_level_n_level_up
          data.aggregate_upper_level_up_to = 0
          data.aggregate_upper_level_type = aggregationValueType.BY_INDICATOR
          break
        }
        case aggregationEnabled.N_LEVEL: {
          delete data.aggregate_upper_level_up_to
          data.aggregate_upper_level_n_level_up = 1
          data.aggregate_upper_level_type = aggregationValueType.BY_INDICATOR
          break
        }
      }
      setData({ ...data })
    }

    return (
      <Fragment>
        <FormControl className="BasicFormSection">
          <label className="form-label required">
            Aggregate admin level
          </label>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RadioGroup
                name="schedule_type"
                value={type}
                onChange={evt => {
                  switchTo(evt.target.value)
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={2}>
                    <FormControlLabel
                      value={aggregationEnabled.NONE}
                      control={<Radio/>}
                      label={aggregationEnabled.NONE}/>
                  </Grid>
                  <Grid item xs={4}>
                    <div className='BasicFormSection'>
                      <div className='InputInLine'>
                        <FormControlLabel
                          value={aggregationEnabled.LEVEL_UP}
                          control={<Radio/>}
                          label={aggregationEnabled.LEVEL_UP}/>
                        <input
                          style={{ width: "100px" }}
                          type={'number'}
                          disabled={type !== aggregationEnabled.LEVEL_UP}
                          value={data.aggregate_upper_level_up_to ? data.aggregate_upper_level_up_to : 0}
                          min={0}
                          onChange={evt => {
                            data.aggregate_upper_level_up_to = evt.target.value
                            setData({ ...data })
                          }}
                        />
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <div className='BasicFormSection'>
                      <div className='InputInLine'>
                        <FormControlLabel
                          value={aggregationEnabled.N_LEVEL}
                          control={<Radio/>}
                          label={aggregationEnabled.N_LEVEL}/>
                        <input
                          style={{ width: "100px" }}
                          type={'number'}
                          disabled={type !== aggregationEnabled.N_LEVEL}
                          value={data.aggregate_upper_level_n_level_up ? data.aggregate_upper_level_n_level_up : 1}
                          min={0}
                          onChange={evt => {
                            data.aggregate_upper_level_n_level_up = evt.target.value
                            setData({ ...data })
                          }}
                        />
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </RadioGroup>
            </Grid>
          </Grid>
          {
            type !== aggregationEnabled.NONE ?
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <br/>
                  <RadioGroup
                    value={data.aggregate_upper_level_type}
                    onChange={evt => {
                      data.aggregate_upper_level_type = evt.target.value
                      if (evt.target.value === aggregationValueType.BY_INDICATOR) {
                        delete data.aggregate_upper_level_number
                        delete data.aggregate_upper_level_string
                      }
                      setData({ ...data })
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Tooltip title={<p style={{ fontSize: "12px" }}>{aggregationValueType.BY_INDICATOR_TOOLTIP}</p>} className={'tooltip'}>
                          <FormControlLabel
                            value={aggregationValueType.BY_INDICATOR}
                            control={<Radio/>}
                            label={aggregationValueType.BY_INDICATOR}/>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={4}>
                        <Tooltip title={<p style={{ fontSize: "12px" }}>{aggregationValueType.DEFAULT_TOOLTIP}</p>} className={'tooltip'}>
                          <FormControlLabel
                            value={aggregationValueType.DEFAULT}
                            control={<Radio/>}
                            label={aggregationValueType.DEFAULT}/>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </Grid>
                {
                  data.aggregate_upper_level_type === aggregationValueType.DEFAULT ?
                    <Grid item xs={6}>
                      <FormControl className="BasicFormSection">
                        <label className="form-label required">
                          Numbers
                        </label>
                        <Aggregation
                          data={data.aggregate_upper_level_number ? data.aggregate_upper_level_number : ''}
                          setData={newData => {
                            data.aggregate_upper_level_number = newData
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
                        <label className="form-label required">
                          Categories
                        </label>
                        <Aggregation
                          data={data.aggregate_upper_level_string ? data.aggregate_upper_level_string : ''}
                          setData={newData => {
                            data.aggregate_upper_level_string = newData
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