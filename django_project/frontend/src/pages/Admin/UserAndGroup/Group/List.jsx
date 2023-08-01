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
import StorageIcon from "@mui/icons-material/Storage";
import { AdminListContent } from "../../AdminList";

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
        // Create actions
        const actions = [].concat(
          COLUMNS_ACTION(
            params, urls.admin.groupList, editUrl, detailUrl
          )
        );

        // Unshift before more & edit action
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Go to data access.`}>
                <a
                  href={urls.api.permissionAdmin + '?groups=' + params.id + '&tab=Groups'}>
                  <StorageIcon/>
                </a>
              </Tooltip>
            }
            label="Go to data access."
          />,)
        return actions
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