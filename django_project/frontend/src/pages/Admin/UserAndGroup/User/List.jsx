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

import React from 'react';
import { COLUMNS_ACTION } from "../../Components/List";
import { GridActionsCellItem } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import { AdminListContent } from "../../AdminList";
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DataAccessActiveIcon } from "../../../../components/Icons";


export function resourceActions(params) {
  const actions = COLUMNS_ACTION(params, urls.admin.userAndGroupList + '#Users', urls.api.user.edit, urls.api.user.detail)
  // Unshift before more & edit action
  actions.unshift(
    <GridActionsCellItem
      icon={
        <Tooltip title={`Go to data access.`}>
          <a
            href={urls.api.permissionAdmin + '?users=' + params.id}>
            <div className='ButtonIcon'>
              <DataAccessActiveIcon/>
            </div>
          </a>
        </Tooltip>
      }
      label="Go to data access."
    />)
  return actions;
}

export function USER_COLUMNS() {
  const editUrl = '/admin/user/0/edit';
  const detailUrl = '/admin/user/0';
  const columns = [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    {
      field: 'username', headerName: 'Username', flex: 1,
      renderCell: (params) => {
        if (editUrl) {
          return <a className='MuiButtonLike CellLink'
                    href={editUrl.replace('/0', `/${params.row.username}`)}>
            {params.value}
          </a>
        } else {
          return params.value
        }
      }
    },
    { field: 'email', headerName: 'Email address', flex: 1 },
    { field: 'first_name', headerName: 'First name', flex: 1 },
    { field: 'last_name', headerName: 'Last name', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'is_staff',
      headerName: 'Is django staff',
      width: 100,
      renderCell: (params) => {
        return ['true', true].includes(params.value) ?
          <CheckCircleIcon className={'success'}/> :
          <CancelIcon className='error'/>
      }
    },
    {
      field: 'receive_notification',
      headerName: 'Receive notification',
      width: 120,
      renderCell: (params) => {
        return ['true', true].includes(params.value) ?
          <CheckCircleIcon className={'success'}/> :
          <CancelIcon className='error'/>
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 120,
      getActions: (params) => {
        return resourceActions(params)
      },
    }
  ]
  if (USE_AZURE) {
    columns[1].headerName = 'Email'
    columns[1].field = 'email'
    columns.splice(2, 1)
  }
  return columns
}

/**
 * Indicator List App
 */
export default function UserList({ ...props }) {
  return <AdminListContent
    columns={USER_COLUMNS()}
    listUrl={urls.api.user.list}
    apiCreate={urls.api.user.create}
    apiBatch={urls.api.user.batch}
    multipleDelete={true}
    {...props}
  />
}