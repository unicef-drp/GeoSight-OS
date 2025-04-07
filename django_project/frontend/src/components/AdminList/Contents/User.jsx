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
 * __date__ = '15/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React from 'react';
import { AdminListContent } from "../Content";
import { COLUMNS_ACTION } from "../../../pages/Admin/Components/List";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export const userUrl = {
  list: '/api/v1/users/?fields=__all__',
  detail: '/api/v1/users/0/?fields=__all__',
  edit: '/admin/user/0/edit',
  create: '/admin/user/create/',
}

export function resourceActions(params) {
  return COLUMNS_ACTION(params, urls.admin.userAndGroupList + '#Users', userUrl.edit, userUrl.detail)
}

export function COLUMNS() {
  const columns = [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    {
      field: 'username', headerName: 'Username', flex: 1,
      renderCell: (params) => {
        if (userUrl.edit) {
          return <a
            className='MuiButtonLike CellLink'
            href={userUrl.edit.replace('/0', `/${params.row.username}`)}
          >
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
    { field: 'role', headerName: 'Role', flex: 1, sortable: false },
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
      sortable: false,
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

/** User List App */
export function UserList({ ...props }) {
  return <AdminListContent
    url={userUrl}
    title={'Users'}
    columns={COLUMNS()}
    pageName={'Users'}
    multipleDelete={true}
    defaults={{
      sort: [
        { field: 'username', sort: 'asc' }
      ]
    }}
    searchKey={'username__icontains'}
    {...props}
  />
}

export default UserList;