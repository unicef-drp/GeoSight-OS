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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { COLUMNS, COLUMNS_ACTION } from "../../Components/List";
import { AdminList } from "../../AdminList";
import PermissionModal from "../../Permission";
import { VisibilityIcon } from "../../../../components/Icons";

import './style.scss';

/**
 * Indicator List App
 */
export default function DashboardList() {
  const pageName = pageNames.Dashboard
  const columns = COLUMNS(pageName, urls.admin.dashboardList);
  columns[2] = { field: 'description', headerName: 'Description', flex: 1 }
  columns[3] = { field: 'category', headerName: 'Category', flex: 0.5 }
  columns[4] = { field: 'modified_at', headerName: 'Last Modified', flex: 0.5 }
  columns[5] = {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 250,
    getActions: (params) => {
      const permission = params.row.permission
      const actions = [].concat(COLUMNS_ACTION(params, urls.admin.dashboardList));
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
      if (permission.read) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <a
                title='Preview dashbaord'
                className={"MuiButtonLike CellLink"}
                href={urls.api.map.replace('/0', `/${params.id}`)}>
                <div className='ButtonIcon'>
                  <VisibilityIcon/>
                </div>
              </a>
            }
            label="Go to map."
          />
        )
      }
      if (!params.row.reference_layer) {
        actions.unshift(
          <GridActionsCellItem
            className='TextButton'
            title={'Need to re-select reference layer.'}
            icon={<ErrorOutlineIcon className='error'/>}
          />
        )
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

render(DashboardList, store)