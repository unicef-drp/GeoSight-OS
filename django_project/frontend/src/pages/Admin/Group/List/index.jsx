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

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { COLUMNS_ACTION } from "../../Components/List";
import { AdminList } from "../../AdminList";

import './style.scss';
import { GridActionsCellItem } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import StorageIcon from "@mui/icons-material/Storage";

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
            params, redirectUrl, editUrl, detailUrl
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
export default function GroupList() {
  const pageName = pageNames.Groups
  return <AdminList
    columns={COLUMNS(pageName, urls.admin.groupList)}
    pageName={pageName}
    listUrl={urls.api.list}
    multipleDelete={true}
  />
}

render(GroupList, store)