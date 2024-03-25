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

import React, { useEffect, useRef, useState } from 'react';
import $ from "jquery";
import { GridActionsCellItem } from "@mui/x-data-grid";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import Tooltip from "@mui/material/Tooltip";
import Switch from "@mui/material/Switch";
import { FormControlLabel, FormGroup } from "@mui/material";

import { DataBrowserActiveIcon } from "../../../components/Icons";
import { render } from '../../../app';
import { store } from '../../../store/admin';
import {
  DatasetFilterSelector,
  IndicatorFilterSelector,
} from "../ModalSelector/ModalFilterSelector";
import {
  MultipleCreatableFilter
} from "../ModalSelector/ModalFilterSelector/MultipleCreatableFilter";
import { splitParams, urlParams } from "../../../utils/main";
import {
  Notification,
  NotificationStatus
} from "../../../components/Notification";
import { AdminListPagination } from "../AdminListPagination";
import { AdminPage, pageNames } from "../index";
import PermissionModal from "../Permission";


import './style.scss';

/*** Dataset admin */
const deleteWarning = "WARNING! Do you want to delete the selected data? This will apply directly to database."

export default function DatasetAdmin() {
  const tableRef = useRef(null);
  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  // Other attributes
  const defaultFilters = urlParams()
  const [filters, setFilters] = useState({
    groupAdminLevel: defaultFilters.groupAdminLevel === 'true',
    indicators: defaultFilters.indicators ? splitParams(defaultFilters.indicators) : [],
    datasets: defaultFilters.datasets ? splitParams(defaultFilters.datasets, false) : [],
    levels: defaultFilters.levels ? splitParams(defaultFilters.levels) : [],
  })
  const [disabled, setDisabled] = useState(false)
  const [isInit, setIsInit] = useState(true)

  // When filter changed
  useEffect((prev) => {
    if (!isInit) {
      tableRef?.current?.refresh()
    }
    setIsInit(false)
  }, [filters])

  // COLUMNS
  const COLUMNS = [
    { field: 'id', headerName: 'id', hide: true },
    { field: 'indicator_name', headerName: 'Indicator', flex: 1 },
    { field: 'reference_layer_name', headerName: 'View', flex: 0.5 },
    { field: 'admin_level', headerName: 'Level', width: 80 },
    { field: 'start_date', headerName: 'Start date', width: 130 },
    { field: 'end_date', headerName: 'End date', width: 130 },
    { field: 'data_count', headerName: 'Data count', width: 80 },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      cellClassName: 'MuiDataGrid-ActionsColumn',
      getActions: (params) => {
        const permission = params.row.permission
        const actions = [
          <GridActionsCellItem
            icon={
              <Tooltip title={`Browse data`}>
                <a href={params.row.browse_url}>
                  <div className='ButtonIcon'>
                    <DataBrowserActiveIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Browse data"
          />
        ]
        // Unshift before more & edit action
        if (permission.share && params.row.reference_layer_id) {
          actions.unshift(
            <GridActionsCellItem
              icon={
                <a>
                  <PermissionModal
                    name={params.row.indicator_name + ' - ' + params.row.reference_layer_name}
                    help='This permission is applied to all of admin level.'
                    urlData={`/api/permission/dataset/${params.row.indicator_id}/${params.row.reference_layer_id}`}/>
                </a>
              }
              label="Change Share Configuration."
            />)
        }
        if (permission.delete) {
          actions.push(
            <GridActionsCellItem
              icon={
                <DoDisturbOnIcon
                  className='DeleteButton'/>
              }
              onClick={() => {
                if (confirm(deleteWarning) === true) {
                  $.ajax({
                    url: urls.api.datasetApi,
                    method: 'DELETE',
                    data: {
                      'ids': JSON.stringify([params.row.id])
                    },
                    success: function () {
                      tableRef?.current?.refresh()
                    },
                    error: function (error) {
                      notify(error, NotificationStatus.ERROR)
                    },
                    beforeSend: beforeAjaxSend
                  });
                  return false;
                }
              }}
              label="Delete"
            />
          )
        }
        return actions
      }
    }
  ]

  /***
   * Parameters Changed
   */
  const getParameters = (parameters) => {
    if (filters.indicators.length) {
      parameters['indicator_id__in'] = filters.indicators.join(',')
    } else {
      delete parameters['indicator_id__in']
    }
    if (filters.groupAdminLevel) {
      parameters['group_admin_level'] = true
    } else {
      delete parameters['group_admin_level']
    }
    if (filters.datasets.length) {
      parameters['reference_layer_id__in'] = filters.datasets.join(',')
    } else {
      delete parameters['reference_layer_id__in']
    }
    if (filters.levels.length) {
      parameters['admin_level__in'] = filters.levels.join(',')
    } else {
      delete parameters['admin_level__in']
    }
    return parameters
  }

  return <AdminPage pageName={pageNames.Dataset}>
    <AdminListPagination
      ref={tableRef}
      urlData={urls.api.datasetApi}
      COLUMNS={COLUMNS}
      disabled={disabled}
      setDisabled={setDisabled}
      selectAllUrl={urls.api.datasetApi + '/ids'}
      otherFilters={
        <div className='ListAdminFilters'>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={filters.groupAdminLevel}/>}
              label="Group all admin levels"
              onChange={(evt) => {
                setFilters({
                  ...filters,
                  groupAdminLevel: evt.target.checked
                })
              }}
            />
          </FormGroup>
          <div className='Separator'/>
          <IndicatorFilterSelector
            data={filters.indicators}
            setData={newFilter => setFilters({
              ...filters,
              indicators: newFilter
            })}/>
          <DatasetFilterSelector
            data={filters.datasets}
            setData={newFilter => setFilters({
              ...filters,
              datasets: newFilter
            })}/>
          <MultipleCreatableFilter
            title={'Filter by Level(s)'}
            data={filters.levels}
            setData={newFilter => setFilters({
              ...filters,
              levels: newFilter
            })}/>
        </div>
      }
      getParameters={getParameters}
      hideSearch={true}
      deselectWhenParameterChanged={true}
    />
    <Notification ref={notificationRef}/>
  </AdminPage>
}

render(DatasetAdmin, store)