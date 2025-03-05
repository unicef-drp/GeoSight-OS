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

import React, { Fragment } from 'react';
import Box from "@mui/material/Box";
import { formatDateTime } from "../../../utils/main";
import { SelectWithList } from "../../../components/Input/SelectWithList";

function StatusFilterInput(props) {
  const { item, applyValue } = props;

  const handleFilterChange = (event, newValue) => {
    applyValue({ ...item, value: newValue });
  };

  return (
    <Fragment>
      <label
        className="MuiFormLabel-root MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-standard MuiFormLabel-colorPrimary MuiFormLabel-filled MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-standard css-1c2i806-MuiFormLabel-root-MuiInputLabel-root"
        data-shrink="true" htmlFor=":r9q:" id=":r9r:">
        Status
      </label>
      <div style={{ marginTop: '16px' }}>
        <SelectWithList
          isMulti={true}
          value={item.value}
          list={['Start', 'Running', 'Failed', 'Success']}
          onChange={evt => {
            handleFilterChange(evt, evt.map(value => value.value))
          }}
        />
      </div>
    </Fragment>
  );
}

export const COLUMNS = {
  ID: { field: 'id', headerName: 'id', hide: true, width: 30, },
  JOB_NAME: {
    field: 'job_name',
    headerName: 'Job Name',
    flex: 0.5,
    renderCell: (params) => {
      const urlDetail = params.row.urls.detail
      if (urlDetail) {
        return <a
          className='MuiButtonLike CellLink'
          href={urlDetail}>
          {params.value}
        </a>
      }
      return params.value
    },
  },
  IMPORTER_BY: { field: 'created_by', headerName: 'Imported By', flex: 0.5 },
  START_AT: {
    field: 'start_time', headerName: 'Import Time', flex: 0.5,
    renderCell: (params) => {
      return formatDateTime(new Date(params.value))
    }
  },
  CREATED_AT: {
    field: 'created_at', headerName: 'Created Date', flex: 0.5,
    renderCell: (params) => {
      return formatDateTime(new Date(params.value))
    }
  },
  IMPORT_TYPE: { field: 'import_type', headerName: 'Import type', flex: 0.5 },
  INPUT_FORMAT: {
    field: 'input_format', headerName: 'Input format', flex: 0.5
  },
  REFERENCE_DATASET: {
    field: 'reference_layer_name', headerName: 'View', flex: 1
  },
  ADMIN_LEVEL: {
    field: 'admin_level_value', headerName: 'Admin level', flex: 0.3
  },
  LAST_RUN: { field: 'last_run', headerName: 'Last Run', flex: 0.3 },
  LAST_RUN_RESULT: {
    field: 'last_run_result',
    headerName: 'Last Run Result',
    flex: 0.5,
    renderCell: (params) => {
      let color = 'info.main'
      switch (params.value) {
        case 'Failed':
          color = 'error.main'
          break
        case 'Success':
          color = 'success.main'
          break
      }
      return <Box sx={{ color: color }}>
        {params.value}
      </Box>
    },
    filterOperators: [
      {
        label: 'IS',
        value: 'is',
        getApplyFilterFn: (filterItem) => {
          return (params) => {
            if (filterItem.value?.length) {
              return filterItem.value.includes(params.value);
            } else {
              return true
            }
          }
        },
        InputComponent: StatusFilterInput,
      }
    ]
  },
  JOB_ACTIVE: {
    field: 'job_active', headerName: 'Is active', flex: 0.5,
    renderCell: (params) => {
      return params.value ? 'Active' : 'Paused'
    }
  },
  ACTIONS: {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 150
  },
  STATUS: {
    field: 'status', headerName: 'Status', flex: 0.3
  }
}