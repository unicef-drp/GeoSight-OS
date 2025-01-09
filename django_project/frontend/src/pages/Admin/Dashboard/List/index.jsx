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
import $ from "jquery";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { COLUMNS, COLUMNS_ACTION } from "../../Components/List";
import { AdminList } from "../../AdminList";
import PermissionModal from "../../Permission";
import { VisibilityIcon } from "../../../../components/Icons";
import { ConfirmDialog } from "../../../../components/ConfirmDialog";

import './style.scss';

export function resourceActions(params) {
  return COLUMNS_ACTION(params, urls.admin.dashboardList)
}

export function resourceActionsList(params) {
  const approveRef = useRef(null);
  const detailUrl = urls.api.detail;
  const permission = params.row.permission
  return COLUMNS_ACTION(
    params, urls.admin.dashboardList, null, null,
    !permission || permission.delete ? <>
      <div onClick={
        () => {
          approveRef?.current?.open()
        }
      }>
        <ContentCopyIcon/> Duplicate
      </div>
      {/* APPROVE */}
      <ConfirmDialog
        header='Approve duplication'
        autoClose={false}
        onConfirmed={() => {
          const api = detailUrl.replace('/0', `/${params.id}`) + 'duplicate';
          $.ajax({
            url: api,
            method: 'POST',
            success: function () {
              location.reload();
            },
            beforeSend: beforeAjaxSend
          });
          debugger
        }}
        ref={approveRef}
      >
        <div>
          Are you sure you want to duplicate
          : {params.row.name ? params.row.name : params.row.id}?
        </div>
        <br/>
      </ConfirmDialog>
    </> : null
  )
}

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
      const actions = resourceActionsList(params);

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