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

import React, { Fragment, useEffect, useRef, useState } from 'react';
import $ from "jquery";
import axios from 'axios';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Admin from "../../index";
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { capitalize, formatDateTime } from "../../../../utils/main";
import { getScheduleText } from "../../../../utils/cron";
import { ThemeButton } from "../../../../components/Elements/Button";
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";
import { DeleteIcon, EditIcon } from "../../../../components/Icons";

import './style.scss';

function formatData(value) {
  if ([null, undefined].includes(value)) {
    return '-'
  } else {
    try {
      if (value.includes('/media/')) {
        return <a href={value}>{value.split('/').slice(-1)[0]}</a>
      }
    } catch (err) {

    }
    return value
  }
}

/**
 * Importer  Detail
 */
export default function ImporterDetail() {
  const [data, setData] = useState(null);

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  /** Call API
   */
  const callApi = () => {
    axios.get(urls.api.detail).then(response => {
      const detailData = response.data
      setData(detailData)
    }).catch(error => {
      setTimeout(function () {
        callApi()
      }, 5000);
    })
  }
  useEffect(() => {
    callApi()
  }, [])

  // If not data, return empty
  if (!data) {
    return <Admin pageName={' Detail'}>
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
    </Admin>
  }

  let color = 'info.main'
  switch (data.status) {
    case 'Failed':
      color = 'error.main'
      break
    case 'Success':
      color = 'success.main'
      break
  }

  return <Admin
    pageName={' Detail'}
    rightHeader={
      <div>
        <ThemeButton
          variant="primary Basic"
          onClick={() => {
            axios.post(data.job_active ? data.urls.pause : data.urls.resume, {}, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRFToken': csrfmiddlewaretoken
              }
            }).then(response => {
              callApi()
            }).catch(error => {
              if (error?.response?.data) {
                notify(error.response.data, NotificationStatus.ERROR)
              } else {
                notify(error.message, NotificationStatus.ERROR)
              }
            })
          }}>
          {
            data.job_active ?
              <Fragment><PauseIcon/> Pause</Fragment> :
              <Fragment><PlayArrowIcon/> Resume</Fragment>
          }
        </ThemeButton>
        <ThemeButton
          disabled={['Start', 'Running'].includes(data.logs[0]?.status)}
          variant="primary Basic"
          onClick={() => {
            axios.post(data.urls.run, {}, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRFToken': csrfmiddlewaretoken
              }
            }).then(response => {
              if (response.data) {
                window.location = response.data;
                notify('Job has been started!', NotificationStatus.SUCCESS)
              }
            }).catch(error => {
              if (error?.response?.data) {
                notify(error.response.data, NotificationStatus.ERROR)
              } else {
                notify(error.message, NotificationStatus.ERROR)
              }
            })
          }}>
          <PlayArrowIcon/> Run
        </ThemeButton>
        <a
          href={data.urls.edit}>
          <ThemeButton variant="primary Basic">
            <EditIcon/> Edit
          </ThemeButton>
        </a>
        <ThemeButton
          disabled={['Start', 'Running'].includes(data.logs[0]?.status)}
          variant="Error Basic"
          onClick={() => {
            if (confirm(`Are you sure you want to delete : ${data.name}?`)) {
              $.ajax({
                url: data.urls.delete,
                method: 'DELETE',
                success: function () {
                  window.location = urls.admin.scheduledJobs
                },
                beforeSend: beforeAjaxSend
              });
              return false;
            }
          }}>
          <DeleteIcon/> Delete
        </ThemeButton>
      </div>
    }
  >
    <div className='FlexScrollableSection'>
      <Grid container spacing={2}>
        <Grid item xs={9} className={'Detail'}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Import type</div>
                <div>{data.import_type}</div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Input format</div>
                <div>{data.input_format}</div>
              </div>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Schedule Type</div>
                <div>{data.schedule_type}</div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Job Name</div>
                <div>{
                  data.job_name ?
                    <a
                      className='MuiButtonLike CellLink'
                      href={data.urls.detail}>
                      {data.job_name}
                    </a> : null
                }</div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Is Active</div>
                <div>{data.job_active ? 'Active' : 'Paused'}</div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Schedule</div>
                <div>{data.schedule ? getScheduleText(data.schedule) : '-'}</div>
              </div>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Reference Layer</div>
                <div>
                  {formatData(data.reference_layer_name)}
                </div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Type fo Geo Code</div>
                <div>
                  {formatData(data.admin_code_type)}
                </div>
              </div>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Time Settings</div>
                <div>
                  {formatData(data.attributes.date_time_data_type)}
                </div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Field/Column or Time that being used</div>
                {
                  formatData(
                    data.attributes.date_time_data_value ?
                      formatDateTime(new Date(data.attributes.date_time_data_value)) :
                      data.attributes.date_time_data_field
                  )
                }
              </div>
            </Grid>
          </Grid>

          {/* Other Attributes */}
          <Grid container spacing={2}>
            {
              Object.keys(data.attributes).filter(attr => !['indicator_data', 'date_time_data_type', 'date_time_data_value', 'date_time_data_field', 'selected_indicators_data'].includes(attr)).map(attr => {
                return <Grid key={attr} item xs={3}>
                  <div className='DetailSection'>
                    <div>{capitalize(attr)}</div>
                    <div>{formatData(data.attributes[attr])}</div>
                  </div>
                </Grid>
              })
            }
          </Grid>
        </Grid>
        {
          data.logs ?
            <Grid item xs={3} className={'Detail SidePanel'}>
              <div className={'SidePanelTitle'}>Logs</div>
              {
                data.logs.map(log => {
                  return <div className={'SidePanelSection Link'}
                              onClick={() => {
                                window.location.href = '/admin/importer/logs/' + log.id
                              }}>
                    <table>
                      <tr>
                        <td>Status</td>
                        <td>{log.status}</td>
                      </tr>
                      <tr>
                        <td>Start Time</td>
                        <td>{log.start_time ? formatDateTime(new Date(log.start_time)) : '-'}</td>
                      </tr>
                      <tr>
                        <td>End Time</td>
                        <td>{log.end_time ? formatDateTime(new Date(log.end_time)) : '-'}</td>
                      </tr>
                    </table>
                  </div>
                })
              }
            </Grid> : null
        }
      </Grid>
    </div>
    <Notification ref={notificationRef}/>
  </Admin>
}

render(ImporterDetail, store)