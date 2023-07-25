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

import { GridActionsCellItem } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import StorageIcon from "@mui/icons-material/Storage";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { COLUMNS_ACTION } from "../../Components/List";
import { AdminList } from "../../AdminList";

import './style.scss';

/**
 *
 * DEFAULT COLUMNS
 * @param {String} pageName Page name.
 * @param {String} redirectUrl Url for redirecting after action done.
 * @param {String} editUrl Url for edit row.
 * @param {String} detailUrl Url for detail of row.
 * @returns {list}
 */
export function COLUMNS(pageName, redirectUrl, editUrl = null, detailUrl = null) {
  editUrl = editUrl ? editUrl : urls.api.edit;
  detailUrl = detailUrl ? detailUrl : urls.api.detail;
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
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'first_name', headerName: 'First Name', flex: 1 },
    { field: 'last_name', headerName: 'Last Name', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    { field: 'is_staff', headerName: 'Is Django Staff', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      width: 120,
      getActions: (params) => {
        const actions = [].concat(
          COLUMNS_ACTION(params, redirectUrl, editUrl, detailUrl)
        );
        // Unshift before more & edit action
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Go to data access.`}>
                <a
                  href={urls.api.permissionAdmin + '?users=' + params.id}>
                  <StorageIcon/>
                </a>
              </Tooltip>
            }
            label="Go to data access."
          />)
        return actions
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
export default function UserList() {
  const pageName = pageNames.Users
  return <AdminList
    columns={COLUMNS(pageName, urls.admin.userList)}
    pageName={pageName}
    listUrl={urls.api.list}
    multipleDelete={true}
  />
}

render(UserList, store)