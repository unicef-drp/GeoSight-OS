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
import { AdminList } from "../../AdminList";
import PermissionModal from "../../Permission";

import './style.scss';

export function resourceActions(params) {
  return COLUMNS_ACTION(params, urls.admin.contextLayerList)
}

/**
 * Indicator List App
 */
export default function ContextLayerList() {
  const pageName = pageNames.ContextLayer
  const columns = COLUMNS(pageName, urls.admin.contextLayerList);
  columns[4] = { field: 'layer_type', headerName: 'Layer type', flex: 0.5 };
  columns[5] = {
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
    columns={columns}
    pageName={pageName}
    listUrl={urls.api.list}
    multipleDelete={true}
  />
}

render(ContextLayerList, store)