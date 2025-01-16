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

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { COLUMNS, COLUMNS_ACTION } from "../../Components/List";
import PermissionModal from "../../Permission";
import AdminList from "../../../../components/AdminList";

import './style.scss';

export function resourceActions(params) {
  return COLUMNS_ACTION(params, urls.admin.list)
}

/**
 * Style List App
 */
export default function StyleList() {
  const pageName = pageNames.Styles
  let columns = COLUMNS(pageName, urls.admin.list);
  // pop action
  const action = columns.pop();
  // pop category
  columns.pop();
  columns = columns.concat([
    { field: 'category', headerName: 'Category', flex: 0.5, sortField: 'group' },
    { field: 'style_type', headerName: 'Style type', flex: 0.5 },
    { field: 'created_at', headerName: 'Created At', flex: 0.5 },
    { field: 'created_by', headerName: 'Created By', flex: 0.5, sortField: 'creator__username' },
    { field: 'modified_at', headerName: 'Modified At', flex: 0.5 },
    { field: 'modified_by', headerName: 'Modified By', flex: 0.5 },
    action
  ])
  columns[columns.length - 1] = {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 100,
    getActions: (params) => {
      const permission = params.row.permission
      const actions = resourceActions(params);

      // Unshift before more & edit action
      if (permission.share) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <a>
                <PermissionModal
                  name={params.row.name}
                  urlData={urls.api.permission.replace('/0', `/${params.id}`)}/>
              </a>
            }
            label="Change Share Configuration."
          />)
      }
      return actions
    },
  }
  return <AdminList
    url={{
      list: urls.api.list,
      batch: urls.api.batch,
      detail: urls.api.detail,
      edit: urls.api.edit,
      create: urls.api.create,
    }}
    title={contentTitle}
    columns={columns}
    pageName={pageName}
    multipleDelete={true}
    defaults={{
      sort: [
        { field: 'name', sort: 'asc' }
      ]
    }}
  />
}

render(StyleList, store)