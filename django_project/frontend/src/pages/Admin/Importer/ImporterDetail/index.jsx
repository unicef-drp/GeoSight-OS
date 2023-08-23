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
import { formatDateTime } from "../../../../utils/main";
import { ThemeButton } from "../../../../components/Elements/Button";
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";
import { DeleteIcon, EditIcon } from "../../../../components/Icons";
import { ImporterDetailSection } from "../LogDetail/index";

import './style.scss';

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
          <ImporterDetailSection inputData={data}/>
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