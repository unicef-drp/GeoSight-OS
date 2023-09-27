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

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { AdminList } from "../../AdminList";
import { COLUMNS_ACTION } from "../../Components/List";
import { dictDeepCopy } from "../../../../utils/main";
import { relatedTableColumns } from "./Attributes";
import PermissionModal from "../../Permission";
import {
  DataBrowserActiveIcon,
  DataManagementActiveIcon
} from "../../../../components/Icons";

import './style.scss';

export function resourceActions(params) {
  const permission = params.row.permission
  const actions = COLUMNS_ACTION(
    params, urls.admin.relatedTableList, urls.api.edit, urls.api.detail
  )
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
  if (permission.edit_data) {
    actions.unshift(
      <GridActionsCellItem
        icon={
          <Tooltip title={`Replace data`}>
            <a
              href={`${urls.admin.importer}?import_type=Related Tables&input_format=Excel Wide Format&related_table_uuid=${params.row.unique_id}&related_table_name=${params.row.name}&related_table_id=${params.row.id}`}>
              <div className='ButtonIcon'>
                <DataManagementActiveIcon/>
              </div>
            </a>
          </Tooltip>
        }
        label="Replace data"
      />
    )
  }
  if (permission.read_data) {
    actions.unshift(
      <GridActionsCellItem
        icon={
          <Tooltip title={`Browse data`}>
            <a href={urls.api.dataView.replace('/0', `/${params.id}`)}>
              <div className='ButtonIcon'>
                <DataBrowserActiveIcon/>
              </div>
            </a>
          </Tooltip>
        }
        label="Value List"
      />
    )
  }
  return actions
}

/**
 * Related Table List App
 */
export default function RelatedTableList() {
  const pageName = pageNames.RelatedTables
  const columns = dictDeepCopy(relatedTableColumns, false)
  columns[5] = {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 350,
    getActions: (params) => {
      return resourceActions(params)
    },
  }

  return <AdminList
    columns={columns}
    pageName={pageName}
    listUrl={urls.api.list}
    multipleDelete={true}
  />
}
render(RelatedTableList, store)