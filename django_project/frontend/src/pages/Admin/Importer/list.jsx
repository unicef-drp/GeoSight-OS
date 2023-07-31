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
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { render } from '../../../app';
import { store } from '../../../store/admin';
import { COLUMNS_ACTION } from "../Components/List";
import { AdminListContent } from "../AdminList";
import { MultipleAdminContent } from "../MultipleAdminContent";
import { pageNames } from "../index";

import {
  Notification,
  NotificationStatus
} from "../../../components/Notification";
import { urlParams } from "../../../utils/main";
import { COLUMNS } from "./utils";
import { ThemeButton } from "../../../components/Elements/Button";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import UploadIcon from "../../../components/Icons/UploadIcon";

const { search } = urlParams()

/**
 * Indicator List App
 */
export function ImporterLogs() {
  const columns = [
    COLUMNS.ID,
    Object.assign({}, COLUMNS.IMPORTER_BY, {
      renderCell: (params) => {
        return <a
          className='MuiButtonLike CellLink'
          href={urls.api.logs.detailView.replace('/0', `/${params.id}`)}>
          {params.value}
        </a>
      }
    }),
    COLUMNS.START_AT,
    COLUMNS.IMPORT_TYPE,
    COLUMNS.INPUT_FORMAT,
    COLUMNS.JOB_NAME,
    COLUMNS.REFERENCE_DATASET,
    Object.assign({}, COLUMNS.LAST_RUN_RESULT, {
        field: 'status', headerName: 'Status'
      }
    ),
    Object.assign({}, COLUMNS.LAST_RUN_RESULT, {
        field: 'saved_data', headerName: 'Data saved',
        renderCell: (params) => {
          return `${params.row.saved_data} / ${params.row.count_data}`
        }
      }
    ),
    Object.assign({}, COLUMNS.ACTIONS, {
        getActions: (params) => {
          const actions = [].concat(
            COLUMNS_ACTION(
              params, urls.admin.importerLogs, urls.api.logs.edit, urls.api.logs.detail
            )
          );
          if (params.row.count_data) {
            actions.unshift(
              <GridActionsCellItem
                className='TextButton'
                icon={
                  <a
                    href={urls.api.logs.dataView.replace('/0', `/${params.id}`)}>
                    <div
                      className='MuiButton-Div MuiButtonBase-root MuiButton-secondary ThemeButton'>
                      <DataUsageIcon/> Data
                    </div>
                  </a>
                }
                label="Value List"
              />
            )
          }
          return actions
        },
      }
    )
  ]
  return columns
}

/**
 * Schedule jobs
 */
export function ScheduledJobs({ ...props }) {
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
                  variant="secondary Basic"
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

/**
 * Data management list
 */
export default function DataManagementList({ defaultTab }) {
  return <MultipleAdminContent
    pageName={pageNames.DataManagement}
    defaultTab={defaultTab}
    contents={{
      'Logs': <AdminListContent
        columns={ImporterLogs()}
        listUrl={urls.api.logs.list}
        searchDefault={search}
        sortingDefault={[{ field: 'start_time', sort: 'desc' }]}
        multipleDelete={true}
        rightHeader={
          <a
            href={urls.admin.importer}>
            <ThemeButton variant="primary">
              <UploadIcon/> Import Data
            </ThemeButton>
          </a>
        }
      />,
      'Scheduled Jobs': <ScheduledJobs/>,
    }}
  />
}

render(DataManagementList, store)