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
import { useTranslation } from "react-i18next";
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
import { AdminListContent } from "../../../../components/AdminList/Content";
import { UploadIcon } from "../../../../components/Icons";
import { urlParams } from "../../../../utils/main";

import './style.scss';
import Tooltip from "@mui/material/Tooltip";

const { search } = urlParams()

export function resourceActions(params, notify, updateData, t) {
  const data = params.row
  const actions = COLUMNS_ACTION(
    params, urls.admin.dataManagement + '#Scheduled%20Jobs', urls.api.scheduledJobs.edit, urls.api.scheduledJobs.detail
  )
  actions.unshift(
    <GridActionsCellItem
      icon={
        user.is_admin || params.row.creator === user.id ?
          <Tooltip
            title={t ? (data.job_active ? t('admin.importer.scheduledJobs.pauseJob') : t('admin.importer.scheduledJobs.resumeJob')) : (data.job_active ? 'Pause the job' : 'Resume the job')}>
            <a
              onClick={(e) => {
                axios.post(data.job_active ? data.urls.pause : data.urls.resume, {}, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRFToken': csrfmiddlewaretoken
                  }
                }).then(response => {
                  if (updateData) {
                    updateData(response)
                  }
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
                e.preventDefault();
              }}
            >
              <div className='ButtonIcon'>
                {
                  data.job_active ?
                    <PauseIcon/> :
                    <PlayArrowIcon/>
                }
              </div>
            </a>
          </Tooltip> : <div></div>
      }
      label="Value List"
    />
  )
  return actions
}

/**
 * Indicator List App
 */
export default function ScheduledJobs({ ...props }) {
  const { t } = useTranslation();
  const [selectionModel, setSelectionModel] = useState([]);
  const listRef = useRef(null);
  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  const columns = [
    COLUMNS.ID,
    Object.assign({}, COLUMNS.JOB_NAME, {
      headerName: t('admin.importer.columns.jobName'),
      renderCell: (params) => {
        return <a
          className='MuiButtonLike CellLink'
          href={urls.api.scheduledJobs.detailView.replace('/0', `/${params.id}`)}>
          {params.value}
        </a>
      }
    }),
    Object.assign({}, COLUMNS.IMPORT_TYPE, { headerName: t('admin.importer.columns.importType') }),
    Object.assign({}, COLUMNS.INPUT_FORMAT, { headerName: t('admin.importer.columns.inputFormat') }),
    COLUMNS.REFERENCE_DATASET,
    Object.assign({}, COLUMNS.LAST_RUN, { headerName: t('admin.importer.columns.lastRun') }),
    Object.assign({}, COLUMNS.LAST_RUN_RESULT, { headerName: t('admin.importer.columns.lastRunResult') }),
    Object.assign({}, COLUMNS.JOB_ACTIVE, { headerName: t('admin.importer.columns.isActive') }),
    Object.assign({}, COLUMNS.ACTIONS, {
      width: 200,
      getActions: (params) => {
        return resourceActions(params, notify, null, t)
      },
    })
  ];

  return <Fragment>
    <AdminListContent
      columns={columns}
      pageName={pageNames.DataManagement}
      searchKey={'job_name__icontains'}
      title={pageNames.ScheduledJobs}
      url={{
        list: urls.api.scheduledJobs.list
      }}
      defaults={{
        sort: [
          { field: 'job_name', sort: 'asc' }
        ],
        search: search
      }}
      multipleDelete={true}
      rightHeader={
        <Fragment>
          <ThemeButton
            variant="primary Basic"
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
            <PauseIcon/> {t('admin.importer.scheduledJobs.pauseSelected')}
          </ThemeButton>
          <ThemeButton
            variant="primary Basic"
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
            <PlayArrowIcon/> {t('admin.importer.scheduledJobs.resumeSelected')}
          </ThemeButton>
          <a
            href={urls.admin.importer}>
            <ThemeButton variant="primary">
              <UploadIcon/> {t('admin.importer.importData')}
            </ThemeButton>
          </a>
        </Fragment>
      }
      {...props}
    />
    <Notification ref={notificationRef}/>
  </Fragment>
}