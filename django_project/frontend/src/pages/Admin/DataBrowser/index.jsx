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
import {
  LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import TextField from '@mui/material/TextField';
import HistoryIcon from "@mui/icons-material/History";
import { GridActionsCellItem } from "@mui/x-data-grid";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import InfoIcon from "@mui/icons-material/Info";

import { render } from '../../../app';
import { store } from '../../../store/admin';
import {
  DatasetFilterSelector,
  IndicatorFilterSelector,
} from "../ModalSelector/ModalFilterSelector";
import {
  MultipleCreatableFilter
} from "../ModalSelector/ModalFilterSelector/MultipleCreatableFilter";
import { deleteFromArray, splitParams, urlParams } from "../../../utils/main";
import {
  Notification,
  NotificationStatus
} from "../../../components/Notification";
import CustomPopover from "../../../components/CustomPopover";
import { IconTextField } from "../../../components/Elements/Input";
import { AdminListPagination } from "../AdminListPagination";
import { SaveButton } from "../../../components/Elements/Button";
import { AdminPage, pageNames } from "../index";


import './style.scss';

/*** Data Browser admin */
const deleteWarning = "WARNING! Do you want to delete the selected data? This will apply directly to database."

export default function DataBrowserAdmin() {
  const tableRef = useRef(null);
  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  // Other attributes
  const defaultFilters = urlParams()
  const [filters, setFilters] = useState({
    indicators: defaultFilters.indicators ? splitParams(defaultFilters.indicators) : [],
    datasets: defaultFilters.datasets ? splitParams(defaultFilters.datasets, false) : [],
    levels: defaultFilters.levels ? splitParams(defaultFilters.levels) : [],
    geographies: defaultFilters.geographies ? splitParams(defaultFilters.geographies) : [],
    fromTime: defaultFilters.fromTime ? defaultFilters.fromTime : null,
    toTime: defaultFilters.toTime ? defaultFilters.toTime : null,
  })
  const [updatedData, setUpdatedData] = useState([]);
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
    { field: 'indicator', headerName: 'Indicator', flex: 1 },
    {
      field: 'reference_layer_name', headerName: 'View', flex: 0.5,
      renderCell: (params) => {
        const data = Array.from(new Set(params.row.geometries.map(geom => geom.dataset_name))).join(',')
        return <div title={data} className='MuiDataGrid-cellContent'>
          {data}
        </div>
      }
    },
    {
      field: 'admin_level', headerName: 'Level', width: 80,
      renderCell: (params) => {
        const data = Array.from(new Set(params.row.geometries.map(geom => geom.admin_level))).join(',')
        return <div title={data} className='MuiDataGrid-cellContent'>
          {data}
        </div>
      }
    },
    {
      field: 'geom_id', headerName: 'Geo Code', flex: 1,
      renderCell: (params) => {
        if (params.row.original_geom_id_type) {
          return <div className='FlexCell'>
            <div>{params.value}</div>
            <CustomPopover
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'center',
                horizontal: 'left',
              }}
              Button={
                <InfoIcon fontSize={"small"}/>
              }
              showOnHover={true}
            >
              <div className='MuiPopover-Info'>
                {params.row.original_geom_id_type} : {params.row.original_geom_id}
              </div>
            </CustomPopover>
          </div>
        } else {
          return params.value
        }
      }
    },
    { field: 'date', headerName: 'Time', width: 130 },
    {
      field: 'value', headerName: 'Value', width: 150,
      renderCell: (params) => {
        const rowData = updatedData.find(row => row.id === params.row.id)
        const permission = params.row.permission
        if (permission.edit) {
          return <IconTextField
            iconEnd={
              rowData ?
                <HistoryIcon title='Revert to default value' onClick={() => {
                  setUpdatedData([...deleteFromArray(rowData, updatedData)])
                }}/> : ""
            }
            className='ValueInput'
            value={params.value}
            onChange={val => {
              if (rowData?.value !== val.target.value) {
                if (!rowData) {
                  params.row.value = val.target.value
                  updatedData.push(params.row)
                } else {
                  rowData.value = val.target.value
                }
                setUpdatedData([...updatedData])
              } else {
                setUpdatedData([...deleteFromArray(rowData, updatedData)])
              }
            }}/>
        } else {
          return params.value
        }
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 60,
      getActions: (params) => {
        return [
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
        ]
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
    if (filters.geographies.length) {
      parameters['geom_id__icontains'] = filters.geographies.join(',')
    } else {
      delete parameters['geom_id__icontains']
    }
    if (filters.fromTime) {
      parameters['date__gte'] = filters.fromTime.format('YYYY-MM-DD');
    } else {
      delete parameters['date__gte']
    }
    if (filters.toTime) {
      parameters['date__lte'] = filters.toTime.format('YYYY-MM-DD');
    } else {
      delete parameters['date__lte']
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
      selectAllUrl={urls.api.datasetApi + 'ids'}
      rightHeader={
        <SaveButton
          variant="primary"
          text={"Apply " + updatedData.length + " Change(s)"}
          disabled={!updatedData.length || disabled}
          onClick={() => {
            setDisabled(true)
            $.ajax({
              url: urls.api.datasetApi,
              method: 'PUT',
              data: {
                'data': JSON.stringify(updatedData.map(data => {
                  return {
                    id: data.id,
                    value: data.value,
                  }
                }))
              },
              success: function () {
                setDisabled(false)
                setUpdatedData([])
                tableRef?.current?.refresh()
              },
              error: function (error) {
                setDisabled(false)
                notify(error.responseText, NotificationStatus.ERROR)
              },
              beforeSend: beforeAjaxSend
            });
          }}
        />
      }
      otherFilters={
        <div className='ListAdminFilters'>
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
          <MultipleCreatableFilter
            title={'Filter by Geo Code(s)'}
            data={filters.geographies}
            setData={newFilter => setFilters({
              ...filters,
              geographies: !newFilter.length ? [] : [newFilter[newFilter.length - 1]]
            })}/>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopDatePicker
              label="Filter from"
              inputFormat="YYYY-MM-DD"
              maxDate={filters.toTime}
              value={filters.fromTime}
              onChange={newFilter => setFilters({
                ...filters,
                fromTime: newFilter
              })}
              renderInput={(params) => <TextField {...params} />}
            />
            <DesktopDatePicker
              label="Filter to"
              inputFormat="YYYY-MM-DD"
              minDate={filters.fromTime}
              value={filters.toTime}
              onChange={newFilter => setFilters({
                ...filters,
                toTime: newFilter
              })}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>
      }
      getParameters={getParameters}
      updateData={
        usedData => {
          usedData.map(rowData => {
            const foundUpdatedData = updatedData.find(row => row.id === rowData.id)
            if (foundUpdatedData) {
              rowData.value = foundUpdatedData.value
              rowData.updated = true
            }
          })
          return usedData
        }
      }
      hideSearch={true}
      deselectWhenParameterChanged={true}
    />
    <Notification ref={notificationRef}/>
  </AdminPage>
}

render(DataBrowserAdmin, store)