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
 * __date__ = '12/07/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GridActionsCellItem } from "@mui/x-data-grid";
import { debounce } from "@mui/material/utils";
import Tooltip from "@mui/material/Tooltip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { AdminPage, pageNames } from '../../index';
import { COLUMNS, COLUMNS_ACTION } from "../../Components/List";
import PermissionModal from "../../Permission";
import { AdminListPagination } from "../../AdminListPagination";
import { MapIcon } from "../../../../components/Icons";

import './style.scss';

const PAGE_NAME = pageNames.CloudNativeGIS

export function resourceActions(params) {
  const permission = params.row.permission

  // Create actions
  const actions = COLUMNS_ACTION(params, urls.admin.cloudNativeGISLayerList)

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
  if (permission.edit && params.row.maputnik_url) {
    actions.unshift(
      <GridActionsCellItem
        icon={
          <a href={params.row.maputnik_url} target='_blank'>
            <Tooltip title={`Editor`}>
              <div className='ButtonIcon'>
                <MapIcon/>
              </div>
            </Tooltip>
          </a>
        }
        label="Change Share Configuration."
      />)
  }
  return actions
}

export function columns() {
  // Columns for the list
  const columns = COLUMNS(PAGE_NAME, urls.admin.cloudNativeGISLayerList);
  columns[3] = { field: 'created_by', headerName: 'Created by', width: 150 }
  columns[4] = { field: 'layer_type', headerName: 'Layer type', width: 150 }
  columns[5] = {
    field: 'is_ready',
    headerName: 'Is layer ready',
    width: 100,
    renderCell: (params) => {
      return ['true', true].includes(params.value) ?
        <CheckCircleIcon className={'success'}/> :
        <CancelIcon className='error'/>
    }
  }
  columns[6] = {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 150,
    getActions: (params) => {
      return resourceActions(params)
    }
  }
  return columns
}

/**
 * Indicator List App
 */
export default function CloudNativeGISLayerList() {
  const tableRef = useRef(null);
  // Search
  const [search, setSearch] = useState('');
  const [disabled, setDisabled] = useState(false)

  const updateSearch = useMemo(
    () =>
      debounce(
        (newValue) => {
          if (newValue !== search) {
            tableRef.current.refresh()
          }
        },
        400
      ),
    []
  )

  useEffect(() => {
    updateSearch(search)
  }, [search])

  /***
   * Parameters Changed
   */
  const getParameters = (parameters) => {
    if (search) {
      parameters['name__icontains'] = search
    } else {
      delete parameters['name__icontains']
    }
    return parameters
  }

  return <AdminPage pageName={PAGE_NAME}>
    <AdminListPagination
      ref={tableRef}
      urlData={urls.api.list}
      columns={columns()}
      getParameters={getParameters}
      setSearch={setSearch}
      disabled={disabled}
      setDisabled={setDisabled}
    />
  </AdminPage>
}

render(CloudNativeGISLayerList, store)