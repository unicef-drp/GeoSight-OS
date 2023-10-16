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
import {
  LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import TextField from '@mui/material/TextField';
import InfoIcon from "@mui/icons-material/Info";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import Box from "@mui/material/Box";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import {
  DatasetFilterSelector,
  IndicatorFilterSelector,
} from "../../ModalSelector/ModalFilterSelector";
import {
  MultipleCreatableFilter
} from "../../ModalSelector/ModalFilterSelector/MultipleCreatableFilter";
import {
  capitalize,
  parseDateTime,
  splitParams,
  urlParams
} from "../../../../utils/main";
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";
import CustomPopover from "../../../../components/CustomPopover";
import { AdminListPagination } from "../../AdminListPagination";
import { AdminPage, pageNames } from "../../index";
import { fetchJSON } from "../../../../Requests";
import { axiosGet } from "../../../../utils/georepo";


import './style.scss';
import { SaveButton } from "../../../../components/Elements/Button";
import $ from "jquery";
import LinearProgress from "@mui/material/LinearProgress";

let inProgress = false

/*** Importer log data */
export default function ImporterLogData() {
  const tableRef = useRef(null);
  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }
  const isIndicatorValue = impoterType === 'Indicator Value'

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
  const [selectionModel, setSelectionModel] = useState([]);
  const [disabled, setDisabled] = useState(false)
  const [columns, setColumns] = useState([]);
  const [progress, setProgress] = useState(100);

  // When filter changed
  useEffect(() => {
    tableRef?.current?.refresh()
  }, [filters])
  /***
   * Load columns data
   */
  const loadData = async () => {
    const responseData = await fetchJSON(
      urls.api.data + '?page=1&page_size=1', {}, true
    );
    // Construct dict
    const columnsByDict = {
      id: { field: 'id', headerName: 'id', hide: true, width: 0 },
      status: {
        renderCell: (params) => {
          let Button, Text, Color;
          switch (params.value) {
            case 'Error':
              Button = <ClearIcon fontSize={"small"}/>
              Text = 'Error'
              Color = 'error.main'
              break
            case 'Saved':
              Button = <CheckIcon fontSize={"small"} className='Success'/>
              Text = 'Saved to database'
              Color = 'success.main'
              break
            case 'Warning':
              const note = params.row.note
              Button = <PriorityHighIcon fontSize={"small"}/>
              Text = note.warning
              Color = 'warning.main'
              break
            default:
              Button = <QuestionMarkIcon fontSize={"small"}/>
              Text = 'In review, not saved to database'
              Color = 'info.main'
              break
          }
          return <Box sx={{ color: Color }}>
            <CustomPopover
              anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
              transformOrigin={{ vertical: 'center', horizontal: 'left' }}
              Button={Button}
              showOnHover={true}
            >
              <div className='MuiPopover-Info'>
                {Text}
              </div>
            </CustomPopover>
          </Box>
        },
        field: 'status',
        headerName: '',
        width: 40,
        disableColumnSelector: true
      }
    }

    if (isIndicatorValue) {
      columnsByDict['indicator_name'] = {
        field: 'indicator_name', headerName: 'Indicator',
        flex: 1, minWidth: 100
      }
      columnsByDict['reference_layer_name'] = {
        field: 'reference_layer_name', headerName: 'Dataset',
        flex: 0.5, minWidth: 100
      }
      columnsByDict['admin_level'] = {
        field: 'admin_level',
        headerName: 'Level',
        width: 80,
        minWidth: 80
      }
      columnsByDict['geo_code'] = {
        field: 'geo_code', headerName: 'Geo Code', minWidth: 200, flex: 1
      }
      columnsByDict['date_time'] = {
        field: 'date_time', headerName: 'Time', minWidth: 200
      }
      columnsByDict['value'] = {
        field: 'value', headerName: 'Value', minWidth: 100
      }
    }
    responseData.results.map(row => {
      Object.keys(row.data).map(key => {
        if (isIndicatorValue) {
          if (['reference_layer_identifier', 'reference_layer_id', 'indicator_id'].includes(key)) {
            return
          }
        }
        const columnDetail = columnsByDict[key]
        const isDate = (
          key.toLowerCase().replaceAll('_', '').includes('date') ||
          key.toLowerCase().replaceAll('_', '').includes('time')
        )
        columnsByDict[key] = {
          renderCell: (params) => {
            const value = params.row.data[params.field]
            const note = params.row.note
            if (note && note[key]) {
              return <div className='FlexCell'>
                <CustomPopover
                  anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'center', horizontal: 'left' }}
                  Button={<InfoIcon fontSize={"small"}/>}
                  showOnHover={true}
                >
                  <div className='MuiPopover-Info'>
                    {note[key]}
                  </div>
                </CustomPopover>
                &nbsp;
                <div title={value}
                     className='MuiDataGrid-cellContent'>{value}</div>
              </div>
            } else if (note && key === 'value' && note.warning) {
              return <div className='FlexCell'>
                <CustomPopover
                  anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'center', horizontal: 'left' }}
                  Button={<InfoIcon fontSize={"small"}/>}
                  showOnHover={true}
                >
                  <div className='MuiPopover-Info'>
                    {note.warning}
                  </div>
                </CustomPopover>
                &nbsp;
                <div title={value}>{value}</div>
              </div>
            } else {
              if (isDate) {
                return parseDateTime(value)
              }
              return <div
                title={value}
                className='MuiDataGrid-cellContent'>
                {value}
              </div>
            }
          },
          cellClassName: (params) => {
            const note = params.row.note
            return note && note[key] ? 'CellError' : (note && key === 'value' && note.warning) ? 'CellWarning' : null
          },
          field: key,
          headerName: columnDetail ? columnDetail.headerName : capitalize(key),
          minWidth: columnDetail?.minWidth ? columnDetail.minWidth : isDate ? 150 : 100,
          width: columnDetail?.width ? columnDetail.width : null,
          flex: !columnDetail ? 1 : columnDetail?.flex ? columnDetail.flex : null
        }
      })
    })

    const columns = []
    for (const [key, value] of Object.entries(columnsByDict)) {
      columns.push(value)
    }

    return columns
  }
  // On loaded
  useEffect(() => {
    (
      async () => {
        const columns = await loadData()
        setColumns(columns)
      }
    )()
  }, [])

  /** Check progress **/
  const checkProgress = (force) => {
    if (!force && inProgress) {
      return
    }
    inProgress = true
    axiosGet(urls.api.data + '/progress').then(response => {
      setTimeout(function () {
        inProgress = false
        checkProgress()
      }, 1000);
      setProgress(
        (
          response.data.saved_ids.length / response.data.target_ids.length
        ) * 100
      )
    })
  }

  // Check the progress
  useEffect(() => {
    checkProgress()
  }, [])


  /***
   * Parameters Changed
   */
  const getParameters = (parameters) => {
    if (filters.indicators.length) {
      parameters['data__indicator_id__in'] = filters.indicators.join(',')
    } else {
      delete parameters['data__indicator_id__in']
    }
    if (filters.datasets.length) {
      parameters['data__reference_layer_id__in'] = filters.datasets.join(',')
    } else {
      delete parameters['data__reference_layer_id__in']
    }
    if (filters.levels.length) {
      parameters['data__admin_level__in'] = filters.levels.join(',')
    } else {
      delete parameters['data__admin_level__in']
    }
    if (filters.geographies.length) {
      parameters['data__geom_id__in'] = filters.geographies.join(',')
    } else {
      delete parameters['data__geom_id__in']
    }
    if (filters.fromTime) {
      parameters['data__date_time__gte'] = parseInt(filters.toTime.format("X"));
    } else {
      delete parameters['data__date_time__gte']
    }
    if (filters.toTime) {
      parameters['data__date_time__lte'] = parseInt(filters.toTime.format("X"));
    } else {
      delete parameters['data__date_time__lte']
    }
    return parameters
  }

  return <AdminPage pageName={pageNames.Importer}>
    <AdminListPagination
      ref={tableRef}
      disabledDelete={true}
      urlData={urls.api.data}
      COLUMNS={columns}
      disabled={disabled}
      setDisabled={setDisabled}
      rightHeader={
        <div className='SaveButtonOnTable'>
          <SaveButton
            variant="primary Reverse"
            text={"Save"}
            disabled={!selectionModel.length || progress < 100}
            style={{ marginLeft: 0, marginBottom: 0 }}
            onClick={() => {
              setProgress(0)
              $.ajax({
                url: urls.api.data,
                method: 'POST',
                data: {
                  'data': JSON.stringify(selectionModel)
                },
                success: function () {
                  checkProgress(true)
                },
                error: function (error) {
                  notify(error.message, NotificationStatus.ERROR)
                  setProgress(100)
                },
                beforeSend: beforeAjaxSend
              });
            }}
          />
          {
            progress < 100 ?
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                padding: 0,
                border: "none",
                width: "100%",
                boxSizing: "border-box"
              }}>
                <LinearProgress variant="determinate" value={progress}/>
              </div> : null
          }
        </div>
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
            title={'Filter by Geography(s)'}
            data={filters.geographies}
            setData={newFilter => setFilters({
              ...filters,
              geographies: newFilter
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
      selectionModel={selectionModel}
      setSelectionModel={setSelectionModel}
      hideSearch={true}
      enableSelectionOnClick={impoterStatus !== 'Success'}
      selectAllUrl={urls.api.data + '/ids'}
      selectable={(param) => {
        return progress >= 100 && ['Review', 'Warning'].includes(param.row.status)
      }}
    />
    <Notification ref={notificationRef}/>
  </AdminPage>
}

render(ImporterLogData, store)