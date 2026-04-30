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

/** Specifically for Cron Input */
import React, { Fragment, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';

import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

import { ScheduledInput } from "./ScheduledInput";
import { AggregationsMultiValueInput } from "./AggregationsMultiValueInput";
import { AdminForm } from "../../Components/AdminForm";
import Admin, { pageNames } from '../../index';
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";
import { SaveButton } from "../../../../components/Elements/Button";
import { urlParams } from "../../../../utils/main";
import { updateDataWithSetState } from "./utils";
import {
  _importTypes,
  _inputFormats,
  _scheduleTypes,
  Forms
} from './FormDefinition'

import { CacheRequests } from "../../../../Requests";
import { AggregationsAdminLevelInput } from "./AggregationsAdminLevelInput";
import './style.scss';

/** ---- Definitions ---- **/
const defaultData = {
  import_type: _importTypes.IndicatorValue,
  input_format: _inputFormats.ExcelLongFormat,
  schedule_type: _scheduleTypes.SingleImport,
  schedule_status: 'Active',
  run_on_create: true
}

const tabs = {
  FormType: 'Form Type',
  Schedule: 'Schedule',
  RefLayerTime: 'Reference_Layer_Time',
  Other: 'Other',
  Aggregations: 'Aggregations',
}
/**
 * Importer Form App
 */
export default function ImporterForm() {
  /** Setup default data **/
  const setupDefaultData = () => {
    return Object.assign({}, defaultData, urlParams(window.location.href))
  }

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  /** Importer attributes **/
  const [indicatorList, setIndicatorList] = useState([])
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState(setupDefaultData());
  const [files, setFiles] = useState({});
  const [ready, setReady] = useState({});

  // Set default data
  useEffect(
    () => {
      updateDataWithSetState(data, setData, {
        'mapping': []
      })
      CacheRequests.get(urls.api.indicatorListAPI + '?fields=id,full_name,shortcode')
        .then(response => {
          setIndicatorList(
            response.map(indicator => {
              return {
                label: indicator.full_name,
                name: indicator.full_name,
                value: indicator.id,
                shortcode: indicator.shortcode,
                id: indicator.id,
              }
            })
          )
        })
        .catch(error => {

        })
    }, []
  )

  /** ----------------------- */
  /** EDIT MODE */
  useEffect(() => {
    if (urls.api.detail && !data.id) {
      axios.get(urls.api.detail).then(response => {
        const detailData = Object.assign({}, response.data, response.data.attributes)
        delete detailData.attributes
        delete detailData.logs
        setData(detailData)
      })
    }
  }, [])

  // Check for default data when changed
  useEffect(
    () => {
      const newAttr = {}
      if (!inputFormats.includes(data.input_format)) {
        newAttr.input_format = inputFormats[0]
      }
      if (!scheduleTypes.includes(data.schedule_type)) {
        newAttr.schedule_type = scheduleTypes[0]
      }
      updateDataWithSetState(data, setData, newAttr)
    }, [data]
  )

  /** ----------------------- */
  /** For rendering extension **/
  const formRef = useRef(null);
  const childRef = useRef(null);
  const scheduledRef = useRef(null);
  const aggregationRef = useRef(null);

  const importTypes = Object.keys(_importTypes).map(key => _importTypes[key])
  const inputFormatsDefault = Object.keys(_inputFormats).map(key => _inputFormats[key])
  const scheduleTypesDefault = Object.keys(_scheduleTypes).map(key => _scheduleTypes[key])

  const formDefinition = Forms[data.import_type][data.input_format]
  const inputFormats = Object.keys(Forms[data.import_type])
  const scheduleTypes = formDefinition?.scheduleTypes ? formDefinition?.scheduleTypes : scheduleTypesDefault

  const renderExtension = () => {
    if (!formDefinition) {
      return null
    }
    return <formDefinition.Form
      key={data.import_type + '-' + data.input_format}
      data={data} setData={setData}
      files={files} setFiles={setFiles}
      ready={ready} setReady={setReady}
      indicatorList={indicatorList}
      ref={childRef}/>
  }

  // Set default data
  useEffect(
    () => {
      if (!inputFormats.includes(data.input_format)) {
        data.input_format = inputFormats[0]
        setData({ ...data })
      }
    }, [data]
  )

  /** Render **/
  const submit = () => {
    const url = window.location.href.split('?')[0]
    var formData = new FormData();
    for (const [key, value] of Object.entries(files)) {
      if (value) {
        formData.append(key, value);
      }
    }
    for (const [key, value] of Object.entries(data)) {
      if ([({}).constructor, [].constructor].includes(value?.constructor)) {
        if (key !== 'mapping') {
          formData.append(key, JSON.stringify(value))
        } else {
          const mapping = {}
          value.map(map => {
            mapping[map.key] = map.value
          })
          formData.append(key, JSON.stringify(mapping))
        }
      } else if (![null, undefined].includes(value)) {
        formData.append(key, value);
      }
    }
    axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrfmiddlewaretoken
      }
    }).then(response => {
      setSubmitted(true)
      notify('Data importer already saved!', NotificationStatus.SUCCESS)
      window.location = response.data;
    }).catch(error => {
      setSubmitted(false)
      if (error?.response?.data) {
        notify(error.response.data, NotificationStatus.ERROR)
      } else {
        notify(error.message, NotificationStatus.ERROR)
      }
    })
    setSubmitted(true)
  }

  // Check readiness
  let disabled = !(indicatorList.length && childRef?.current?.isReady(data) && scheduledRef?.current?.isReady(data))

  // Check disabled tabs
  let disabledTabs = []
  if (data.import_type === _importTypes.RelatedTables) {
    disabledTabs.push('Aggregations')
    disabledTabs.push('Reference Layer & Time')
  }
  if (scheduleTypes.length <= 1) {
    disabledTabs.push('Schedule')
  }
  return (
    <Fragment>
      {
        urls.api.detail && !data.id ?
          <Admin pageName={' Detail'} minifySideNavigation={true}>
            <div className='AdminContentWithLoading'>
              <div className='AdminLoading'>
                <div className='AdminLoadingSection'>
                  <CircularProgress/>
                  <div>
                    Fetching data...
                  </div>
                </div>
              </div>
            </div>
          </Admin> :
          <Admin
            minifySideNavigation={true}
            pageName={pageNames.Importer}
            rightHeader={
              <Fragment>
                <SaveButton
                  variant="primary"
                  text="Submit"
                  onClick={() => {
                    submit()
                  }}
                  disabled={(submitted || disabled)}
                />
              </Fragment>
            }
          >
            {
              indicatorList.length ?
                <AdminForm
                  isWizard={true}
                  disabledTabs={disabledTabs}
                  forms={{
                    'General': (
                      <div>
                        {/* Import type selector */}
                        <FormControl className="BasicFormSection">
                          <label className="form-label required">
                            Import type
                          </label>
                          <RadioGroup
                            name="import_type"
                            value={data.import_type}
                            onChange={evt => {
                              data.import_type = evt.target.value
                              setData({ ...data })
                            }}
                          >
                            <Grid container spacing={2}>
                              {
                                importTypes.map(type => (
                                  <Grid item xs={2} key={type}>
                                    <FormControlLabel
                                      value={type} control={<Radio/>}
                                      label={type}/>
                                  </Grid>
                                ))
                              }
                            </Grid>
                          </RadioGroup>
                        </FormControl>

                        {/* Input format selector */}
                        <FormControl className="BasicFormSection">
                          <label className="form-label required">
                            Input format
                          </label>
                          <RadioGroup
                            name="input_format"
                            value={data.input_format}
                            onChange={evt => {
                              data.input_format = evt.target.value
                              setData({ ...data })
                            }}
                          >
                            <Grid container spacing={2}>
                              {
                                inputFormatsDefault.map(type => (
                                  <Grid item xs={6} key={type}>
                                    <FormControlLabel
                                      disabled={!inputFormats.includes(type)}
                                      value={type} control={<Radio/>}
                                      label={type}/>
                                  </Grid>
                                ))
                              }
                            </Grid>
                          </RadioGroup>
                        </FormControl>
                      </div>
                    ),
                    "Attributes": (
                      <div>
                        {renderExtension()}
                      </div>
                    ),
                    "Reference Layer & Time": <div></div>,
                    "Schedule":
                      <ScheduledInput
                        data={data} setData={setData}
                        _scheduleTypes={_scheduleTypes}
                        scheduleTypesDefault={scheduleTypesDefault}
                        scheduleTypes={scheduleTypes}
                        ref={scheduledRef}
                      />,
                    "Aggregations":
                      <div>
                        <AggregationsMultiValueInput
                          data={data} setData={setData}
                          ref={aggregationRef}
                        />

                        <AggregationsAdminLevelInput
                          data={data} setData={setData}
                          ref={aggregationRef}
                        />
                      </div>,
                  }}
                /> :
                <div className='AdminForm'>
                  <div className='AdminFormLoading'>
                    <div className='AdminFormLoadingSection'>
                      <CircularProgress/>
                      <div>
                        Fetching data...
                      </div>
                    </div>
                  </div>
                </div>
            }
            <Notification ref={notificationRef}/>
          </Admin>
      }
    </Fragment>
  )
}

render(ImporterForm, store)