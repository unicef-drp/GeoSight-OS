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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import $ from "jquery";
import Tooltip from "@mui/material/Tooltip";
import {
  DataBrowserActiveIcon,
  DeleteIcon
} from "../../../../components/Icons";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { COLUMNS } from "../../Components/List";
import { AdminList } from "../../AdminList";
import PermissionModal from "../../Permission";
import MoreAction from "../../../../components/Elements/MoreAction";

import './style.scss';


export function resourceActions(params) {
  const permission = params.row.permission
  const actions = []

  // Unshift before more & edit action
  if (permission.share) {
    actions.unshift(
      <GridActionsCellItem
        icon={
          <a>
            <PermissionModal
              name={params.row.name}
              urlData={urls.api.permission.replace('/identifier', `/${params.row.identifier}`)}
            />
          </a>
        }
        label="Change Share Configuration."
      />)
  }

  if (permission.read_data) {
    actions.unshift(
      <GridActionsCellItem
        icon={
          <Tooltip title={`Browse data`}>
            <a
              href={urls.api.entityBrowser.replace('0', params.row.identifier)}>
              <div className='ButtonIcon'>
                <DataBrowserActiveIcon/>
              </div>
            </a>
          </Tooltip>
        }
        label="Browse entities"
      />
    )
  }
  if (!permission || permission.delete) {
    const detailUrl = urls.api.detail;
    const redirectUrl = urls.admin.boundaryList;
    actions.push(
      <GridActionsCellItem
        icon={
          <MoreAction moreIcon={<MoreVertIcon/>}>
            {
              detailUrl ?
                <div className='error' onClick={
                  () => {
                    const api = detailUrl.replace('/' + DEFAULT_UUID, `/${params.id}`);
                    if (confirm(`Are you sure you want to delete : ${params.row.name ? params.row.name : params.row.id}?`)) {
                      $.ajax({
                        url: api,
                        method: 'DELETE',
                        success: function () {
                          if (window.location.href.replace(window.location.origin, '') === redirectUrl) {
                            location.reload();
                          } else {
                            window.location = redirectUrl;
                          }
                        },
                        beforeSend: beforeAjaxSend
                      });
                      return false;
                    }
                  }
                }>
                  <DeleteIcon/> Delete
                </div> : ''
            }
          </MoreAction>
        }
        label="More"
      />
    )
  }
  return actions
}

/**
 * ReferenceLayerView App
 */
export default function ReferenceLayerViewList() {
  const pageName = pageNames.ReferenceLayerView
  const columns = COLUMNS(pageName, urls.admin.boundaryList);
  const cleanColumns = [
    columns[0], columns[1], columns[2],
    {
      field: 'identifier', headerName: 'Identifier', flex: 0.5
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      cellClassName: 'MuiDataGrid-ActionsColumn',
      getActions: (params) => {
        // Create actions
        const actions = resourceActions(params)
        return actions
      }
    }
  ]
  return <AdminList
    columns={cleanColumns}
    pageName={pageName}
    listUrl={urls.api.list}
    getRowId={(row) => row.identifier}
  />
}

render(ReferenceLayerViewList, store)