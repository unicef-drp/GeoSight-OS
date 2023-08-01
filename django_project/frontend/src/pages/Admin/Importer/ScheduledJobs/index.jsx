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

import React, { Fragment, useRef, useState } from 'react';
import $ from "jquery";
import axios from "axios";
import { GridActionsCellItem } from "@mui/x-data-grid";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";
import { pageNames } from "../../index";
import { COLUMNS } from "../utils";
import { COLUMNS_ACTION } from "../../Components/List";
import { ThemeButton } from "../../../../components/Elements/Button";
import { AdminListContent } from "../../AdminList";
import UploadIcon from "../../../../components/Icons/UploadIcon";
import { urlParams } from "../../../../utils/main";

import './style.scss';

const { search } = urlParams()

/**
 * Indicator List App
 */
export default function ScheduledJobs({ ...props }) {
  const [selectionModel, setSelectionModel] = useState([]);
  const listRef = useRef(null);
  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  const pageName = pageNames.ScheduleJobs
  const columns = [
    COLUMNS.ID,
    Object.assign({}, COLUMNS.JOB_NAME, {
      renderCell: (params) => {
        return <a
          className='MuiButtonLike CellLink'
          href={urls.api.scheduledJobs.detailView.replace('/0', `/${params.id}`)}>
          {params.value}
        </a>
      }
    }),
    COLUMNS.IMPORT_TYPE,
    COLUMNS.INPUT_FORMAT,
    COLUMNS.REFERENCE_DATASET,
    COLUMNS.LAST_RUN,
    COLUMNS.LAST_RUN_RESULT,
    COLUMNS.JOB_ACTIVE,
    Object.assign({}, COLUMNS.ACTIONS, {
      width: 200,
      getActions: (params) => {
        const data = params.row
        const actions = [].concat(
          COLUMNS_ACTION(
            params, urls.admin.scheduledJobs, urls.api.scheduledJobs.edit, urls.api.scheduledJobs.detail
          )
        );
        actions.unshift(
          <GridActionsCellItem
            className='TextButton'
            icon={
              user.is_admin || params.row.creator === user.id ?
                <ThemeButton
                  variant="primary Reverse Basic"
                  onClick={() => {
                    axios.post(data.job_active ? data.urls.pause : data.urls.resume, {}, {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRFToken': csrfmiddlewaretoken
                      }
                    }).then(response => {
                      params.row.state?.data.find(row => {
                        if (row.id === data.id) {
                          row.job_active = !params.row.job_active
                          params.row.state.setData([...params.row.state.data])
                        }
                      })
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
                      <Fragment><PauseIcon/></Fragment> :
                      <Fragment><PlayArrowIcon/></Fragment>
                  }
                </ThemeButton> : <></>
            }
            label="Value List"
          />
        )
        return actions
      },
    })
  ];
  return <Fragment>
    <AdminListContent
      columns={columns}
      pageName={pageName}
      listUrl={urls.api.scheduledJobs.list}
      searchDefault={search}
      sortingDefault={[{ field: 'job_name', sort: 'asc' }]}
      selectionChanged={setSelectionModel}
      multipleDelete={true}
      rightHeader={
        <Fragment>
          <ThemeButton
            variant="secondary Basic"
            disabled={!selectionModel.length}
            onClick={() => {
              $.ajax({
                url: urls.api.scheduledJobs.list,
                method: 'PUT',
                data: {
                  'ids': JSON.stringify(selectionModel),
                  'state': 'pause'
                },
                success: function () {
                  listRef.current.refresh()
                },
                error: function (error) {
                  if (error?.response?.data) {
                    notify(error.response.data, NotificationStatus.ERROR)
                  } else {
                    notify(error.message, NotificationStatus.ERROR)
                  }
                },
                beforeSend: beforeAjaxSend
              });
            }}>
            <PauseIcon/> Pause Selected
          </ThemeButton>
          <ThemeButton
            variant="secondary Basic"
            disabled={!selectionModel.length}
            onClick={() => {
              $.ajax({
                url: urls.api.scheduledJobs.list,
                method: 'PUT',
                data: {
                  'ids': JSON.stringify(selectionModel),
                  'state': 'resume'
                },
                success: function () {
                  listRef.current.refresh()
                },
                error: function (error) {
                  if (error?.response?.data) {
                    notify(error.response.data, NotificationStatus.ERROR)
                  } else {
                    notify(error.message, NotificationStatus.ERROR)
                  }
                },
                beforeSend: beforeAjaxSend
              });
            }}>
            <PlayArrowIcon/> Resume Selected
          </ThemeButton>
          <a
            href={urls.admin.importer}>
            <ThemeButton variant="primary">
              <UploadIcon/> Import Data
            </ThemeButton>
          </a>
        </Fragment>
      }
      ref={listRef}
      {...props}
    />
    <Notification ref={notificationRef}/>
  </Fragment>
}