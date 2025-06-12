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
import {GridActionsCellItem} from "@mui/x-data-grid";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from "@mui/material/Tooltip";
import {render} from '../../../../app';
import {store} from '../../../../store/admin';
import {pageNames} from '../../index';
import {COLUMNS, COLUMNS_ACTION} from "../../Components/List";
import PermissionModal from "../../Permission";
import {VisibilityIcon} from "../../../../components/Icons";
import AdminList from "../../../../components/AdminList";
import {useConfirmDialog} from "../../../../providers/ConfirmDialog";
import {DjangoRequests} from "../../../../Requests";
import {useTranslation} from "react-i18next";

import './style.scss';

export function resourceActions(params) {
  return COLUMNS_ACTION(params, urls.admin.dashboardList)
}

export function resourceActionsList(params) {
  const permission = params.row.permission
  const { openConfirmDialog } = useConfirmDialog();
  return COLUMNS_ACTION(
    params, urls.admin.dashboardList, null, null,
    !permission || permission.delete ? <>
      <div onClick={
        () => {
          openConfirmDialog({
            header: 'Duplication confirmation',
            onConfirmed: async () => {
              const api = `/api/dashboard/${params.id}/duplicate`;
              await DjangoRequests.post(api, {}).then(response => {
                try {
                  params.columns[params.columns.length - 1]?.tableRef.current.refresh()
                } catch (err) {
                  location.reload();
                }
              })
            },
            onRejected: () => {
            },
            children: <div>
              Are you sure you want to duplicate
              : {params.row.name ? params.row.name : params.row.id}?
            </div>,
          })
        }
      }>
        <ContentCopyIcon/> Duplicate
      </div>
    </> : null
  )
}

/**
 * Indicator List App
 */
export default function DashboardList() {
  const { t } = useTranslation();
  const pageName = pageNames.Dashboard
  const columns = COLUMNS(pageName, urls.admin.dashboardList);
  columns[2] = { field: 'description', headerName: t('admin.columns.description'), flex: 1 }
  columns[3] = {
    field: 'category',
    headerName: t('admin.columns.category'), flex: 0.5,
    serverKey: 'group__name'
  }
  columns[4] = {
    field: 'created_by', headerName: t('admin.columns.createdBy'), flex: 0.5,
    serverKey: 'creator__username'
  }
  columns[5] = { field: 'created_at', headerName: t('admin.columns.createdAt'), flex: 0.5, type: 'date' }
  columns[6] = { field: 'modified_at', headerName: t('admin.columns.modifiedAt'), flex: 0.5 , type: 'date' }
  columns[7] = { field: 'modified_by', headerName: t('admin.columns.modifiedBy'), flex: 0.5, serverKey: 'modified_by__username' }
  columns[8] = {
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
            label={t('admin.actions.changeShareConfig')}
          />
        )
      }
      if (permission.read) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={t('admin.actions.changeShareConfig')}>
                <a
                  className={"MuiButtonLike CellLink"}
                  href={urls.api.map.replace('/0', `/${params.id}`)}>
                  <div className='ButtonIcon'>
                    <VisibilityIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label={t('admin.actions.previewDashboard')}
          />
        )
      }
      if (!params.row.reference_layer) {
        actions.unshift(
          <GridActionsCellItem
            className='TextButton'
            title={t('admin.actions.needReselectReferenceLayer')}
            icon={<ErrorOutlineIcon className='error'/>}
          />
        )
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
    enableFilter={true}
    defaults={{
      sort: [
        { field: 'name', sort: 'asc' }
      ]
    }}
  />
}

render(DashboardList, store)
