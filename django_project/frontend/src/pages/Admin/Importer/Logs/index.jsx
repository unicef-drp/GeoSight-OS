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

import React, { useRef, useState } from 'react';
import { GridActionsCellItem } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";

import { COLUMNS_ACTION } from "../../Components/List";
import { ThemeButton } from "../../../../components/Elements/Button";
import {
  DataBrowserActiveIcon,
  UploadIcon
} from "../../../../components/Icons";
import { urlParams } from "../../../../utils/main";
import { COLUMNS } from "../utils";

import { AdminListPagination } from "../../AdminListPagination";
import AdminList from "../../../../components/AdminList";

import './style.scss';
import {pageNames} from "../../index";

const { search } = urlParams()

export function resourceActions(params) {
  const actions = COLUMNS_ACTION(
    params, urls.admin.dataManagement + '#Logs', urls.api.logs.edit, urls.api.logs.detail
  )

  if (params.row.count_data) {
    actions.unshift(
      <GridActionsCellItem
        icon={
          <Tooltip title={`Browse data`}>
            <a href={params.row.browse_url}>
              <div className='ButtonIcon'>
                <DataBrowserActiveIcon/>
              </div>
            </a>
          </Tooltip>
        }
        label="Value List"
      />
    )
  }
  return actions;
}

/**
 * Indicator List App
 */
const LOG_COLUMNS = [
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
      field: 'status', headerName: 'Status',
      flex: 0.3
    }
  ),
  Object.assign({}, COLUMNS.LAST_RUN_RESULT, {
      field: 'saved_data', headerName: 'Data saved',
      renderCell: (params) => {
        return `${params.row.saved_data} / ${params.row.count_data}`
      },
      flex: 0.3
    }
  ),
  Object.assign({}, COLUMNS.ACTIONS, {
      getActions: (params) => {
        return resourceActions(params);
      },
    }
  )
]

/** Importer logs */
export default function ImporterLogs({ ...props }) {
  return <AdminList
    columns={LOG_COLUMNS}
    pageName={pageNames.DataManagement}
    title={pageNames.Logs}
    url={{
      list: urls.api.logs.list
    }}
    defaults={{
      sort: [
        { field: 'start_time', sort: 'desc' }
      ],
      search: search
    }}
    multipleDelete={true}
    enableFilter={false}
    useSearch={false}
    rightHeader={
      <a
        href={urls.admin.importer}>
        <ThemeButton variant="primary">
          <UploadIcon/> Import Data
        </ThemeButton>
      </a>
    }
    {...props}
  />
}