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

import React, { useRef } from 'react';
import { COLUMNS_ACTION } from "../../Components/List";
import { GridActionsCellItem } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import { AdminListContent } from "../../AdminList";
import { DataAccessActiveIcon } from "../../../../components/Icons";
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { BatchUserForm } from "./BatchUserForm";

export function resourceActions(params) {
  const batchFormRef = useRef(null);
  const actions = COLUMNS_ACTION(params, urls.admin.userAndGroupList + '#Groups', urls.api.group.edit, urls.api.group.detail)

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
    />,
    <GridActionsCellItem
      icon={
        <Tooltip title={`Go to data access.`}>
          <a
            href={urls.api.permissionAdmin + '?groups=' + params.id + '#Groups'}>
            <div className='ButtonIcon'>
              <DataAccessActiveIcon/>
            </div>
          </a>
        </Tooltip>
      }
      label="Go to data access."
    />
  )
  return actions;
}

export function GROUP_COLUMNS() {
  const editUrl = '/admin/group/0/edit';
  const detailUrl = '/admin/group/0';
  return [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    {
      field: 'name', headerName: 'Name', flex: 1,
      renderCell: (params) => {
        if (editUrl) {
          return <a className='MuiButtonLike CellLink'
                    href={editUrl.replace('/0', `/${params.id}`)}>
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

/**
 * Indicator List App
 */
export default function GroupList({ ...props }) {
  return <AdminListContent
    columns={GROUP_COLUMNS()}
    listUrl={urls.api.group.list}
    apiCreate={urls.api.group.create}
    apiBatch={urls.api.group.batch}
    multipleDelete={true}
    {...props}
  />
}