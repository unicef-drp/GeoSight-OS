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
  FormGroup,
  Radio,
  RadioGroup
} from "@mui/material";
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import { CronInput } from '../../Components/Input/CronInput'
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { ThemeButton } from "../../../../components/Elements/Button";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

/**
 * Indicator specified input
 * @param {string} data .
 * @param {Function} setData .
 * @param {Array} attributes .
 * @param {Array} indicatorList .
 */
export const ScheduledInput = forwardRef(
  ({
     data, setData, _scheduleTypes, scheduleTypesDefault, scheduleTypes
   }, ref
  ) => {
    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          !(data.schedule_type === _scheduleTypes.ScheduledImport && (!data.job_name || !data.schedule))
        )
      }
    }));
    /**
     * Switch time type
     */
    const switchTo = (type) => {
      data.schedule_type = type
      switch (type) {
        case _scheduleTypes.SingleImport: {
          delete data.schedule
          delete data.job_name
          break
        }
        case _scheduleTypes.ScheduledImport: {
          break
        }
      }
      setData({ ...data })
    }

    // Set default data
    useEffect(
      () => {
        if (!data.schedule_type) {
          switchTo(_scheduleTypes.SingleImport)
        }
      }, [data]
    )

    return (
      <Fragment>
        <FormControl className="BasicFormSection">
          <label className="form-label required">
            Import schedule
          </label>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <RadioGroup
                name="schedule_type"
                value={data.schedule_type}
                onChange={evt => {
                  switchTo(evt.target.value)
                }}
              >
                <Grid container spacing={2}>
                  {
                    scheduleTypesDefault.map(type => (
                      <Grid item xs={4} key={type}>
                        <FormControlLabel
                          disabled={!scheduleTypes.includes(type)}
                          value={type} control={<Radio/>}
                          label={type}/>
                      </Grid>
                    ))
                  }
                </Grid>
              </RadioGroup>
            </Grid>
          </Grid>
        </FormControl>
        {
          data.schedule_type === _scheduleTypes.ScheduledImport ?
            <FormControl className="BasicFormSection">
              <label className="form-label required">
                Job Name
              </label>
              <div>
                <FormControl
                  className="BasicFormSection InputControl">
                  <input
                    placeholder='Job Name'
                    type='text'
                    value={data.job_name}
                    onChange={evt => {
                      data.job_name = evt.target.value
                      setData({ ...data })
                    }}
                    style={{ cursor: "text" }}
                  />
                </FormControl>
              </div>
              <label className="form-label required">
                Job Schedule
              </label>
              <div>
                <FormControl
                  className="BasicFormSection InputControl">
                  <CronInput data={data} setData={setData}/>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={data.run_on_create ? data.run_on_create : false}
                      onChange={evt => {
                        data.run_on_create = evt.target.checked
                        setData({ ...data })
                      }}
                    />
                  }
                  label="Run for the first time after creating/editing the job."
                />
              </div>

              {/* Alerts section */}
              <div className="AlertSection">
                <div className="form-label" style={{ marginLeft: '-18px' }}>
                  <ThemeButton
                    className="Reverse"
                    onClick={() => {
                      if (!data.alerts) {
                        data.alerts = []
                      }
                      data.alerts.push({
                        email: '',
                        on_start: true,
                        on_success: true,
                        on_failure: true,
                      })
                      setData({ ...data })
                    }}
                  >
                    <AddCircleIcon/> Add new Alert
                  </ThemeButton>
                </div>
                <table>
                  <tbody>
                  {
                    data.alerts ?
                      data.alerts.map((alert, idx) => {
                        return <tr key={idx}>
                          <th>
                            <FormControl>
                              <input
                                placeholder={'Email'}
                                value={alert.email}
                                onChange={evt => {
                                  alert.email = evt.target.value
                                  setData({ ...data })
                                }}
                              />
                            </FormControl>

                          </th>
                          <th>
                            <FormGroup>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={alert.on_start}
                                    onChange={evt => {
                                      alert.on_start = evt.target.checked
                                      setData({ ...data })
                                    }}/>
                                }
                                label="On Start"/>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={alert.on_success}
                                    onChange={evt => {
                                      alert.on_success = evt.target.checked
                                      setData({ ...data })
                                    }}/>
                                }
                                label="On Success"/>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={alert.on_failure}
                                    onChange={evt => {
                                      alert.on_failure = evt.target.checked
                                      setData({ ...data })
                                    }}/>
                                }
                                label="On Failure"/>
                            </FormGroup>
                          </th>
                          <th>
                            <ThemeButton
                              className={"RemoveButton"}
                              variant="Error Basic Reverse"
                              onClick={() => {
                                data.alerts.splice(idx, 1); // 2nd parameter means remove one item only
                                setData({ ...data })
                              }}
                            >
                              <RemoveCircleIcon/>
                            </ThemeButton>
                          </th>
                        </tr>
                      }) : null
                  }
                  </tbody>
                </table>
              </div>
            </FormControl> : null
        }
      </Fragment>
    )
      ;
  }
)