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

import React, { Fragment, useEffect, useRef, useState } from 'react';
import $ from "jquery";
import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ClearIcon from '@mui/icons-material/Clear';
import Box from "@mui/material/Box";
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LinearProgress from "@mui/material/LinearProgress";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { AdminList } from "../../AdminList";
import { fetchJSON } from "../../../../Requests";
import {
  capitalize,
  dictDeepCopy,
  parseDateTime,
  splitParams,
  urlParams
} from "../../../../utils/main";
import CustomPopover from "../../../../components/CustomPopover";
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import { DatasetList } from "../../Dataset/index";
import { NotificationStatus } from "../../../../components/Notification";
import { axiosGet } from "../../../../utils/georepo";
import { AdminPage, pageNames } from "../../index";
import { SaveButton } from "../../../../components/Elements/Button";
import { InfoIcon } from "../../../../components/Icons";

import './style.scss';

function StatusFilterInput(props) {
  const { item, applyValue } = props;

  const handleFilterChange = (event, newValue) => {
    applyValue({ ...item, value: newValue });
  };

  return (
    <Fragment>
      <label
        className="MuiFormLabel-root MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-standard MuiFormLabel-colorPrimary MuiFormLabel-filled MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-standard css-1c2i806-MuiFormLabel-root-MuiInputLabel-root"
        data-shrink="true" htmlFor=":r9q:" id=":r9r:">
        Status
      </label>
      <div style={{ marginTop: '16px' }}>
        <SelectWithList
          isMulti={true}
          value={item.value}
          list={['Saved', 'Review', 'Error', 'Warning']}
          onChange={evt => {
            handleFilterChange(evt, evt.map(value => value.value))
          }}
        />
      </div>
    </Fragment>
  );
}

const statusFilter = [
  {
    label: 'IS',
    value: 'is',
    getApplyFilterFn: (filterItem) => {
      return (params) => {
        if (filterItem.value?.length) {
          return filterItem.value.includes(params.value);
        } else {
          return true
        }
      }
    },
    InputComponent: StatusFilterInput,
  }
]

const fetchData = async () => {
  return await fetchJSON(urls.api.data, {}, true);
}

let inProgress = false
/**
 * Importer Log Data
 */
export default function ImporterLogData() {
  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  // States
  const [state, setState] = useState({
    columns: [],
    data: null
  });
  const { columns, data } = state;
  const [selectionModel, setSelectionModel] = useState([]);
  const [progress, setProgress] = useState(100);
  const isIndicatorValue = impoterType === 'Indicator Value'

  // Other attributes
  const defaultFilters = urlParams()
  const [filters, setFilters] = useState({
    indicators: defaultFilters.indicators ? splitParams(defaultFilters.indicators) : [],
    datasets: defaultFilters.datasets ? splitParams(defaultFilters.datasets) : [],
    levels: defaultFilters.levels ? splitParams(defaultFilters.levels) : [],
    geographies: defaultFilters.geographies ? splitParams(defaultFilters.geographies) : [],
    fromTime: defaultFilters.fromTime ? defaultFilters.fromTime : null,
    toTime: defaultFilters.toTime ? defaultFilters.toTime : null,
  })

  /***
   * Load data
   */
  const loadData = async () => {
    const responseData = await fetchData()
    // Construct dict
    const columnsByDict = {
      id: { field: 'id', headerName: 'id', hide: true, width: 0 },
      status: {
        filterOperators: statusFilter,
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
              const note = JSON.parse(params.row.note)
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
          if (Button) {
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
          }
          return null
        },
        field: 'status',
        headerName: '',
        width: 40,
        disableColumnSelector: true
      }
    }

    const cleanData = []
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
    responseData.map(row => {
      const rowData = row.data
      const rowNote = Object.keys(row.note).length ? JSON.stringify(row.note) : ''
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
            const note = params.row.note ? JSON.parse(params.row.note) : null
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
                <div title={params.value}>{params.value}</div>
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
                <div title={params.value}>{params.value}</div>
              </div>
            } else {
              if (isDate) {
                return parseDateTime(params.value)
              }
              return <div title={params.value}>{params.value}</div>
            }
          },
          cellClassName: (params) => {
            const note = params.row.note ? JSON.parse(params.row.note) : null
            return note && note[key] ? 'CellError' : (note && key === 'value' && note.warning) ? 'CellWarning' : null
          },
          field: key,
          headerName: columnDetail ? columnDetail.headerName : capitalize(key),
          minWidth: columnDetail?.minWidth ? columnDetail.minWidth : isDate ? 150 : 100,
          width: columnDetail?.width ? columnDetail.width : null,
          flex: !columnDetail ? 1 : columnDetail?.flex ? columnDetail.flex : null
        }
      })
      cleanData.push({
        ...rowData, note: rowNote, id: row.id, status: row.status
      })
    })

    const columns = []
    for (const [key, value] of Object.entries(columnsByDict)) {
      columns.push(value)
    }

    return {
      data: cleanData,
      columns: columns
    }
  }

  // On loaded
  useEffect(() => {
    (
      async () => {
        const state = await loadData()
        setState({ ...state })
      }
    )()
  }, [])

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

      // Saved data
      data.filter(row => response.data.saved_ids.includes(row.id)).map(row => {
        row.status = 'Saved'
      })
      const newSelectionModel = response.data.target_ids.filter(row => !response.data.saved_ids.includes(row))
      setState({ ...state, data: [...data] })
      setSelectionModel(newSelectionModel)
    }).catch(function (error) {
      setProgress(100)
      data.filter(row => selectionModel.includes(row.id)).map(row => {
        row.status = 'Saved'
      })
      setState({ ...state, data: [...data] })
    })
  }

  // Check the progress
  useEffect(() => {
    if (data) {
      checkProgress()
    }
  }, [data])

  let usedData = null
  if (data) {
    usedData = dictDeepCopy(data)
    usedData.map(row => {
      row.selectable = ['Review', 'Warning'].includes(row.status)
    })
    if (filters.indicators?.length) {
      usedData = usedData.filter(row => filters.indicators.includes(row.indicator_id + ''))
    }
    if (filters.datasets?.length) {
      usedData = usedData.filter(row => filters.datasets.includes(row.reference_layer_identifier + ''))
    }
    if (filters.levels?.length) {
      usedData = usedData.filter(row => filters.levels.includes(row.admin_level + ''))
    }
    if (filters.geographies?.length) {
      usedData = usedData.filter(row => filters.geographies.includes(row.geo_code + ''))
    }
    if (filters.fromTime) {
      usedData = usedData.filter(row => row.date_time >= filters.fromTime.unix())
    }
    if (filters.toTime) {
      usedData = usedData.filter(row => row.date_time <= filters.toTime.unix())
    }
  }
  if (isIndicatorValue) {
    return <AdminPage pageName={pageNames.Importer}>
      <DatasetList
        tableHeader={
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
        columns={state.columns}
        initData={usedData}
        filters={filters}
        setFilters={setFilters}
        selectionModel={selectionModel}
        checkboxSelection={impoterStatus === 'Success'}
        disableSelectionOnClick
        selectionChanged={(newSelectionModel) => {
          setSelectionModel(newSelectionModel)
        }}
        disableColumnFilter={false}
        sortingDefault={[{ field: 'status', sort: 'asc' }]}
        selectable={(param) => progress >= 100 && param.row.selectable}
      />
    </AdminPage>
  }
  return <AdminList
    columns={columns}
    pageName={pageNames.Importer}
    initData={usedData}
    listUrl={null}
    rightHeader={<div></div>}
  />
}

render(ImporterLogData, store)