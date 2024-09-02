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
import AddIcon from '@mui/icons-material/Add';

import { DataBrowserActiveIcon } from "../../../components/Icons";
import { render } from '../../../app';
import { store } from '../../../store/admin';
import {
  DatasetFilterSelector,
  IndicatorFilterSelector,
} from "../ModalSelector/ModalFilterSelector";
import { splitParams, urlParams } from "../../../utils/main";
import {
  Notification,
  NotificationStatus
} from "../../../components/Notification";
import { AdminListPagination } from "../AdminListPagination";
import { AdminPage, pageNames } from "../index";
import PermissionModal from "../Permission";
import { ThemeButton } from "../../../components/Elements/Button";
import { removeElement } from "../../../utils/Array";
import {
  MultipleSelectWithSearch
} from "../../../components/Input/SelectWithSearch";


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
    groupAdminLevel: defaultFilters.groupAdminLevel ? defaultFilters.groupAdminLevel === 'true' : true,
    indicators: defaultFilters.indicators ? splitParams(defaultFilters.indicators) : [],
    datasets: defaultFilters.datasets ? splitParams(defaultFilters.datasets, false) : [],
    levels: defaultFilters.levels ? splitParams(defaultFilters.levels) : [],
    detail: true,
  })
  const [disabled, setDisabled] = useState(false)
  const [isInit, setIsInit] = useState(true)
  const [filtersSequences, setFiltersSequences] = useState([])
  const [quickData, setQuickData] = useState({})
  let [selectionModel, setSelectionModel] = useState([]);

  // When filter changed
  useEffect((prev) => {
    if (!isInit) {
      tableRef?.current?.refresh()
    }
    setIsInit(false)

    // Check filter sequences
    for (const [key, value] of Object.entries(filters)) {
      if (key !== 'groupAdminLevel') {
        if (value.length) {
          if (!filtersSequences.includes(key)) {
            filtersSequences.push(key)
            setFiltersSequences([...filtersSequences])
          }
        } else {
          if (filtersSequences.includes(key)) {
            setFiltersSequences(removeElement(filtersSequences, key))
          }
        }
      }
    }
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
    parameters['detail'] = filters.detail
    return parameters
  }

  // This is for selected for add to new project
  let selectedViews = []
  let selectedIndicators = []
  const selectedModelIds = selectionModel.map(row => {
    const ids = row.split('[')[0].split('-')
    selectedViews.push(ids[1])
    selectedIndicators.push(ids[0])
    return ids
  })
  selectedViews = Array.from(new Set(selectedViews));
  selectedIndicators = Array.from(new Set(selectedIndicators));

  return <AdminPage pageName={pageNames.Dataset}>
    <AdminListPagination
      ref={tableRef}
      urlData={urls.api.datasetApi}
      COLUMNS={COLUMNS}
      disabled={disabled}
      setDisabled={setDisabled}
      selectAllUrl={urls.api.datasetApi + 'ids'}
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
          <ThemeButton
            variant='primary'
            disabled={selectedViews.length !== 1}
            onClick={() => {
              let url = `/admin/project/create?dataset_id=${selectedViews[0]}`
              if (selectedModelIds) {
                url += `&indicators=${selectedIndicators.join(',')}`
              }
              window.location.href = url;
            }}
            title={'Enable this by selecting data contain just 1 view.'}
          >
            <AddIcon/> Add to New Project
          </ThemeButton>
          &nbsp;&nbsp;&nbsp;
          <IndicatorFilterSelector
            data={filters.indicators}
            setData={newFilter => setFilters({
              ...filters,
              indicators: newFilter
            })}
            filter={quickData.indicators}
          />
          <DatasetFilterSelector
            data={filters.datasets}
            setData={newFilter => setFilters({
              ...filters,
              datasets: newFilter
            })}
            filter={quickData.datasets}
          />
          <MultipleSelectWithSearch
            placeholder={'Filter by Level(s)'}
            options={!filtersSequences.length || !filtersSequences.indexOf('levels') ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] : quickData.levels ? quickData.levels.map(level => level + '') : []}
            value={filters.levels}
            onChangeFn={evt => {
              setFilters({
                ...filters,
                levels: evt
              })
            }}
            showValues={true}
          />
        </div>
      }
      getParameters={getParameters}
      hideSearch={true}
      deselectWhenParameterChanged={true}
      quickDataChanged={
        (data) => {
          setQuickData(data)
        }
      }
      selectionModel={selectionModel}
      setSelectionModel={setSelectionModel}
    />
    <Notification ref={notificationRef}/>
  </AdminPage>
}

render(DatasetAdmin, store)