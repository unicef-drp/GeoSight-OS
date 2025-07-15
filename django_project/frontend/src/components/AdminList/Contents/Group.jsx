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

import React, { useRef } from 'react';
import { GridActionsCellItem } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { AdminListContent } from "../Content";
import { COLUMNS_ACTION } from "../../../pages/Admin/Components/List";
import {
  BatchUserForm
} from "../../../pages/Admin/UserAndGroup/Group/BatchUserForm";
import { DataAccessActiveIcon } from "../../Icons";

export const groupUrl = {
  list: '/api/v1/groups/?fields=__all__',
  detail: '/api/v1/groups/0/?fields=__all__',
  edit: '/admin/group/0/edit',
  create: '/admin/group/create/',
}

export function resourceActions(params) {
  const batchFormRef = useRef(null);
  const actions = COLUMNS_ACTION(params, urls.admin.userAndGroupList + '#Users', groupUrl.edit, groupUrl.detail)

  // Unshift before more & edit action
  actions.unshift(
    <BatchUserForm ref={batchFormRef} data={params.row}/>,
    <GridActionsCellItem
      icon={
        <Tooltip title={`Update user in batch.`}>
          <a onClick={() => {
            batchFormRef.current.open(params.row)
          }}>
            <div className='ButtonIcon'>
              <SystemUpdateAltIcon/>
            </div>
          </a>
        </Tooltip>
      }
      label="Update user in batch."
    />
  )
  return actions;
}

export function COLUMNS() {
  return [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    {
      field: 'name', headerName: 'Name', flex: 1,
      renderCell: (params) => {
        if (groupUrl.edit) {
          return <a className='MuiButtonLike CellLink'
                    href={groupUrl.edit.replace('/0', `/${params.id}`)}>
            {params.value}
          </a>
        } else {
          return params.value
        }
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
}

/** Group List App */
export function GroupList({ ...props }) {
  return <AdminListContent
    url={groupUrl}
    title={'Groups'}
    columns={COLUMNS()}
    pageName={'Groups'}
    multipleDelete={true}
    defaults={{
      sort: [
        { field: 'name', sort: 'asc' }
      ]
    }}
    searchKey={'name__icontains'}
    {...props}
  />
}

export default GroupList;