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

import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import TextField from '@mui/material/TextField';
import InfoIcon from "@mui/icons-material/Info";
import Admin from '../index';
import {
  DatasetFilterSelector,
  IndicatorFilterSelector,
} from "../ModalSelector/ModalFilterSelector";
import {
  MultipleCreatableFilter
} from "../ModalSelector/ModalFilterSelector/MultipleCreatableFilter";
import CustomPopover from "../../../components/CustomPopover";

import './style.scss';

export const COLUMNS = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'indicator', headerName: 'Indicator', flex: 1 },
  { field: 'reference_layer_name', headerName: 'Dataset', flex: 0.5 },
  { field: 'admin_level', headerName: 'Level', width: 60 },
  {
    field: 'geom_id', headerName: 'Geo Code', flex: 0.5,
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
  { field: 'date', headerName: 'Time', flex: 0.5 },
  { field: 'value', headerName: 'Value', flex: 0.5 },
  { field: 'actions', type: 'actions', width: 80 }
]

/**
 * Dataset List
 */
export default function DatasetList(
  {
    defaults = {},
    selectionModel, setSelectionModel,
    loadData, pageName, getCellClassName,
    COLUMNS, actionButtons, formatData, checkboxSelection = true,
    disableColumnFilter = true,
    sortingDefault = null,
    selectable = true
  }
) {
  const [isLoading, setIsLoading] = useState(true)
  const [parameters, setParameters] = useState({})
  const [data, setData] = useState([])

  const [filterByIndicators, setFilterByIndicator] = useState(defaults.indicators ? defaults.indicators : [])
  const [filterByDatasets, setFilterByDatasets] = useState(defaults.datasets ? defaults.datasets : [])
  const [filterByLevels, setFilterByLevels] = useState(defaults.dataset_levels ? defaults.dataset_levels : [])
  const [filterByCodes, setFilterByCodes] = useState(defaults.codes ? defaults.codes : [])
  const [filterByFromTime, setFilterByFromTime] = useState(null)
  const [filterByToTime, setFilterByToTime] = useState(null)

  /** Parameters Changed */
  const parametersChanged = () => {
    delete parameters['indicator_id__in']
    delete parameters['reference_layer_id__in']
    delete parameters['admin_level__in']
    delete parameters['geom_id__in']
    delete parameters['date__gte']
    delete parameters['date__lte']

    if (filterByIndicators.length) {
      parameters['indicator_id__in'] = filterByIndicators.join(',')
    }
    if (filterByDatasets.length) {
      parameters['reference_layer_id__in'] = filterByDatasets.join(',')
    }
    if (filterByLevels.length) {
      parameters['admin_level__in'] = filterByLevels.join(',')
    }
    if (filterByCodes.length) {
      parameters['geom_id__in'] = filterByCodes.join(',')
    }
    if (filterByFromTime) {
      parameters['date__gte'] = filterByFromTime.format('YYYY-MM-DD');
    }
    if (filterByToTime) {
      parameters['date__lte'] = filterByToTime.format('YYYY-MM-DD');
    }
    setParameters({ ...parameters })
  }

  /*** Load data */
  useEffect(() => {
    setIsLoading(true);
    (
      async () => {
        const data = await loadData(parameters)
        setData(data)
        setIsLoading(false)
      }
    )()
  }, [parameters])

  /***
   * When filter changed
   */
  useEffect(() => {
      parametersChanged()
    }, [
      filterByIndicators, filterByDatasets, filterByLevels,
      filterByCodes, filterByFromTime, filterByToTime
    ]
  )

  // Update with edited one
  let usedData = data
  if (formatData) {
    usedData = formatData(data)
  }
  let sorting = {
    sortModel: [{ field: 'id', sort: 'asc' }]
  }
  if (sortingDefault) {
    sorting = {
      sortModel: sortingDefault
    }
  }
  return (
    <Admin
      pageName={pageName}
      rightHeader={actionButtons}
    >
      {/* FILTERS */}
      <div className='ListAdminFilters'>
        <IndicatorFilterSelector
          data={filterByIndicators}
          setData={setFilterByIndicator}/>
        <DatasetFilterSelector
          data={filterByDatasets}
          setData={setFilterByDatasets}/>
        <MultipleCreatableFilter
          title={'Filter by Level(s)'}
          data={filterByLevels}
          setData={setFilterByLevels}/>
        <MultipleCreatableFilter
          title={'Filter by Geography(s)'}
          data={filterByCodes}
          setData={setFilterByCodes}/>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DesktopDatePicker
            label="Filter from"
            inputFormat="YYYY-MM-DD"
            maxDate={filterByToTime}
            value={filterByFromTime}
            onChange={value => {
              setFilterByFromTime(value)
            }}
            renderInput={(params) => <TextField {...params} />}
          />
          <DesktopDatePicker
            label="Filter to"
            inputFormat="YYYY-MM-DD"
            minDate={filterByFromTime}
            value={filterByToTime}
            onChange={setFilterByToTime}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </div>
      <div className='AdminList DatasetAdmin'>
        <div className='MuiDataGridTable DatasetAdminTable'>
          {
            COLUMNS.length ?
              <DataGrid
                key={'TableWithData'}
                initialState={{
                  sorting: sorting,
                }}

                rows={usedData}
                loading={isLoading}
                pagination
                page={parameters.page}
                columns={COLUMNS}
                getCellClassName={getCellClassName}

                disableSelectionOnClick
                disableColumnFilter={disableColumnFilter}
                isRowSelectable={(params) => selectable}

                checkboxSelection={checkboxSelection}
                onSelectionModelChange={setSelectionModel}
                selectionModel={selectionModel}
              /> : <DataGrid
                key={'TableWithoutData'} loading={true} rows={[]} columns={[]}/>
          }
        </div>
      </div>
    </Admin>
  );
}