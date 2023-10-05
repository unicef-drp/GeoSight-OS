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
import $ from 'jquery';
import { GridActionsCellItem } from "@mui/x-data-grid";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";

import { render } from '../../../app';
import {
  DatasetFilterSelector,
  GroupFilterSelector,
  IndicatorFilterSelector,
  SelectFilter,
  UserFilterSelector
} from "../ModalSelector/ModalFilterSelector";
import { store } from '../../../store/admin';
import Admin, { pageNames } from '../index';
import {
  AddButton,
  DeleteButton,
  SaveButton
} from "../../../components/Elements/Button";
import { fetchJSON } from "../../../Requests";
import { dictDeepCopy, splitParams, urlParams } from "../../../utils/main";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../components/Modal";
import { AdminTable } from "../Components/Table";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import PublicDataAccess from "./Public";

import '../../Admin/Components/List/style.scss';
import './style.scss';
import UsersDataAccess from "./Users";
import GroupsDataAccess from "./Groups";


const PERMISSIONS = [
  [
    "None",
    "None"
  ],
  [
    "Read",
    "Read"
  ],
  [
    "Write",
    "Write"
  ]
]

/***
 * Add new data
 */
export function AddData(
  {
    tab, permissions, open, setOpen, data, updateData
  }
) {
  const [indicators, setIndicators] = useState([])
  const [datasets, setDatasets] = useState([])
  const [objects, setObjects] = useState([])
  const [permission, setPermission] = useState(permissions[0][0])

  useEffect(() => {
    setIndicators([])
    setDatasets([])
    setObjects([])
  }, [open])

  return <Modal
    className='PermissionFormModal PermissionDatasetAddData'
    open={open}
    onClosed={() => {
      setOpen(false)
    }}
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
    }}>Update permission</ModalHeader>
    <ModalContent>
      <FormControl className='BasicForm'>
        <label className="form-label">Indicators</label>
        <IndicatorFilterSelector
          data={indicators}
          setData={setIndicators}
          returnObject={true}/>
      </FormControl>
      <FormControl className='BasicForm'>
        <label className="form-label">Dataset</label>
        <DatasetFilterSelector
          data={datasets}
          setData={setDatasets}
          returnObject={true}
        />
      </FormControl>
      <FormControl className='BasicForm'>
        <label className="form-label">{tab}</label>
        {
          tab === UserTab ?
            <UserFilterSelector data={objects}
                                setData={setObjects}
                                returnObject={true}/>
            : <GroupFilterSelector data={objects}
                                   setData={setObjects}
                                   returnObject={true}/>
        }
      </FormControl>
      <FormControl className='BasicForm'>
        <label className="form-label">Permission</label>
        <Select
          value={permission}
          onChange={(evt) => {
            setPermission(evt.target.value)
          }}
        >
          {
            permissions.map(choice => {
              return <MenuItem
                key={choice[0]}
                value={choice[0]}>{choice[1]}</MenuItem>
            })
          }
        </Select>
      </FormControl>
    </ModalContent>
    <ModalFooter>
      <div className='Save-Button'>
        <SaveButton
          variant="primary"
          text={"Apply Changes"}
          onClick={() => {
            let maxId = data.length ? Math.max(...data.map(row => row.id)) : 0
            indicators.map(indicator => {
              datasets.map(dataset => {
                objects.map(object => {
                  if (tab === UserTab) {
                    const dataFound = data.filter(row => {
                      return row.indicator_id === indicator.id &&
                        row.dataset_id === dataset.id && row.user_id === object.id
                    })[0]
                    if (dataFound) {
                      dataFound.permission = permission
                    } else {
                      maxId += 1
                      data.push({
                        'id': maxId + 1,
                        'dataset_id': dataset.id,
                        'dataset_name': dataset.name,
                        'indicator_id': indicator.id,
                        'indicator_name': indicator.name,
                        'user_id': object.id,
                        'user_name': object.username,
                        'user_role': object.role,
                        'permission': permission
                      })
                    }
                  } else if (tab === GroupTab) {
                    const dataFound = data.filter(row => {
                      return row.indicator_id === indicator.id &&
                        row.dataset_id === dataset.id && row.group_id === object.id
                    })[0]
                    if (dataFound) {
                      dataFound.permission = permission
                    } else {
                      maxId += 1
                      data.push({
                        'id': maxId,
                        'dataset_id': dataset.id,
                        'dataset_name': dataset.name,
                        'indicator_id': indicator.id,
                        'indicator_name': indicator.name,
                        'group_id': object.id,
                        'group_name': object.name,
                        'permission': permission
                      })
                    }
                  }
                })
              })
            })
            updateData(data)
            setOpen(false)
          }}
        />
      </div>
    </ModalFooter>
  </Modal>
}

/**
 * Access data
 */
export function AccessData(
  {
    rows,
    columns,
    selected,
    selectionModel,
    setSelectionModel,
    tab,
    onDelete,
    children
  }) {
  const deleteDialogRef = useRef(null);
  const dataName = tab.replace(/s$/, '');

  return <div className='AdminList DataAccessAdminTable'>
    <AdminTable
      header={
        <Fragment>
          {children}
          <DeleteButton
            disabled={!selectionModel.length}
            variant="Error Reverse"
            text={"Delete"}
            onClick={() => {
              deleteDialogRef?.current?.open()
            }}
          />
          <ConfirmDialog
            onConfirmed={() => {
              onDelete()
            }}
            ref={deleteDialogRef}
          >
            <div>
              Are you sure want to
              delete {selectionModel.length} data access
              for {dataName.toLowerCase() + (selectionModel.length > 1 ? 's' : '')}?
              <br/>
              <br/>
              To apply it to database, please hit "Apply" button.
            </div>
          </ConfirmDialog>
        </Fragment>
      }
      rows={rows} columns={columns}
      setSelectionModel={setSelectionModel}
      initialState={{
        sorting: {
          sortModel: [
            { field: 'indicator_name', sort: 'asc' },
          ],
        },
      }}
      disableSelectionOnClick
      disableColumnFilter
      checkboxSelection={selected}
      selectionModel={selectionModel}
    />
  </div>
}

const UserTab = 'users'
const GroupTab = 'groups'
const GeneralTab = 'generals'
/**
 * Data Access admin
 */
export default function DataAccessAdmin() {
  const {
    datasets,
    indicators,
    permissions,
    users,
    groups
  } = urlParams()

  let paramTab = window.location.hash.replace('#', '').replaceAll('%20', ' ').toLowerCase()
  if (![UserTab, GroupTab, GeneralTab].includes(paramTab)) {
    paramTab = UserTab
  }

  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab] = useState(paramTab ? paramTab : UserTab)
  const [data, setData] = useState(null)
  const [tableData, setTableData] = useState(null)
  const [defaultTableData, setDefaultTableTableData] = useState(null)

  const [filters, setFilters] = useState({
    indicators: splitParams(indicators),
    datasets: splitParams(datasets, false),
    permissions: splitParams(permissions),
    users: splitParams(users),
    groups: splitParams(groups),
  })

  const [selectionModel, setSelectionModel] = useState([]);
  const [updatePermissionOpen, setUpdatePermissionOpen] = useState(false);
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);

  // for popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [info, setInfo] = useState(null);

  // Render Cell
  const renderCell = (params, key) => {
    return <FormControl className='BasicForm'>
      <Select
        value={params.row[key]}
        onChange={(evt) => {
          tableData[tab][params.row.id][key] = evt.target.value
          setTableData({ ...tableData })
        }}
      >
        {
          data['permission_choices'].map(choice => {
            if (
              (tab !== GeneralTab && choice[0] === 'None') ||
              (tab === GeneralTab && choice[0] === 'Write' && key === 'public')
            ) {
              return
            }
            return <MenuItem
              key={choice[0]}
              value={choice[0]}>{choice[1]}</MenuItem>
          })
        }
      </Select>
    </FormControl>
  }

  const actions = (params) => {
    return [
      <GridActionsCellItem
        icon={
          <DoDisturbOnIcon
            className='DeleteButton'/>
        }
        onClick={() => {
          tableData[tab].map(row => {
            if (row.id === params.row.id) {
              row.is_deleted = true
            }
          })
          setTableData({ ...tableData })
        }}
        label="Delete"
      />
    ]
  }

  // Columns for each tab
  const COLUMNS = {}
  COLUMNS[UserTab] = [
    { field: 'id', headerName: 'id', hide: true },
    { field: 'indicator_name', headerName: 'Indicator', flex: 1 },
    { field: 'dataset_name', headerName: 'Dataset', flex: 0.5 },
    { field: 'user_name', headerName: 'User', flex: 0.5 },
    { field: 'user_role', headerName: 'Role', flex: 0.5 },
    {
      field: 'permission', headerName: 'Permission', width: 200,
      renderCell: (params) => {
        return renderCell(params, 'permission')
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: (params) => {
        return actions(params)
      },
    }
  ]
  COLUMNS[GroupTab] = [
    { field: 'id', headerName: 'id', hide: true },
    { field: 'indicator_name', headerName: 'Indicator', flex: 1 },
    { field: 'dataset_name', headerName: 'Dataset', flex: 0.5 },
    { field: 'group_name', headerName: 'Group', flex: 0.5 },
    {
      field: 'permission', headerName: 'Permission', width: 200,
      renderCell: (params) => {
        return renderCell(params, 'permission')
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: (params) => {
        return actions(params)
      },
    }
  ]
  COLUMNS[GeneralTab] = [
    { field: 'id', headerName: 'id', hide: true },
    { field: 'indicator_name', headerName: 'Indicator', flex: 1 },
    { field: 'dataset_name', headerName: 'Dataset', flex: 0.5 },
    {
      field: 'public', headerName: 'Public', width: 200,
      renderCell: (params) => {
        return renderCell(params, 'public')
      }
    }
  ]

  /** Submit function **/
  const submit = (event) => {
    const target = event.currentTarget
    const permissions = []
    const users = tableData[UserTab].filter(data => {
      return data.permission !== 'None'
    }).map(data => {
      const id = data.dataset_id + '-' + data.indicator_id
      permissions.push(id)
      return {
        d: data.dataset_id,
        i: data.indicator_id,
        o: data.user_id,
        p: data.permission,
        is_del: data.is_deleted,
      }
    })
    const groups = tableData[GroupTab].filter(data => {
      return data.permission !== 'None'
    }).map(data => {
      const id = data.dataset_id + '-' + data.indicator_id
      permissions.push(id)
      return {
        d: data.dataset_id,
        i: data.indicator_id,
        o: data.group_id,
        p: data.permission,
        is_del: data.is_deleted,
      }
    })
    const generals = tableData[GeneralTab].filter(data => {
      const id = data.dataset_id + '-' + data.indicator_id
      return permissions.includes(id) ||
        data.organization !== 'None' ||
        data.public !== 'None'
    }).map(data => {
      return {
        d: data.dataset_id,
        i: data.indicator_id,
        o: data.organization,
        p: data.public,
        is_del: data.is_deleted,
      }
    })
    const payload = {
      'users': users,
      'groups': groups,
      'generals': generals,
    }
    setSubmitted(true)
    $.ajax({
      url: urls.api.permissions,
      data: {
        data: JSON.stringify(payload)
      },
      dataType: 'json',
      type: 'POST',
      success: function () {
        setSubmitted(false)
        setAnchorEl(target)
        setInfo("<div class='FormOk'>Configuration has been saved!</div>")
        setDefaultTableTableData(dictDeepCopy(tableData))
      },
      error: function (error, textStatus, request) {
        setSubmitted(false)
        setAnchorEl(target)
        setInfo("<div class='FormError'>" + textStatus + "</div>")
      },
      beforeSend: beforeAjaxSend
    });
  }

  /** Format data to table data **/
  const formatData = (data) => {
    const users = []
    const groups = []
    const generals = []
    data['permissions'][UserTab].map((obj, idx) => {
      users.push({
        'id': idx,
        'dataset_id': obj.d,
        'dataset_identifier': obj.di,
        'dataset_name': obj.dn,
        'indicator_id': obj.i,
        'indicator_name': obj.in,
        'user_id': obj.o,
        'user_name': obj.on,
        'user_role': obj.or,
        'permission': obj.p
      })
    })
    data['permissions'][GroupTab].map((obj, idx) => {
      groups.push({
        'id': idx,
        'dataset_id': obj.d,
        'dataset_identifier': obj.di,
        'dataset_name': obj.dn,
        'indicator_id': obj.i,
        'indicator_name': obj.in,
        'group_id': obj.o,
        'group_name': obj.on,
        'permission': obj.p
      })
    })
    data['permissions'][GeneralTab].map((obj, idx) => {
      generals.push({
        'id': idx,
        'dataset_id': obj.d,
        'dataset_identifier': obj.di,
        'dataset_name': obj.dn,
        'indicator_id': obj.i,
        'indicator_name': obj.in,
        'organization': obj.o,
        'public': obj.p,
      })
    })
    const tableData = {}
    tableData[UserTab] = users
    tableData[GroupTab] = groups
    tableData[GeneralTab] = generals
    setTableData(tableData)
    setDefaultTableTableData(dictDeepCopy(tableData))
  }

  /** When tab changes **/
  useEffect(() => {
    window.location.hash = tab
  }, [tab]);

  // Check if the data changed
  let changed = false;
  if (tableData) {
    changed = JSON.stringify(tableData) !== JSON.stringify(defaultTableData)
  }

  // For filtered data
  const filteredTableData = dictDeepCopy(tableData)
  if (filteredTableData) {
    filteredTableData[tab] = filteredTableData[tab].filter(data => !data.is_deleted)
    if (filters.indicators.length) {
      filteredTableData[tab] = filteredTableData[tab].filter(data => {
        return filters.indicators.includes(data.indicator_id)
      })
    }
    if (filters.datasets.length) {
      filteredTableData[tab] = filteredTableData[tab].filter(data => {
        return filters.datasets.includes(data.dataset_identifier)
      })
    }
    if (tab === UserTab && filters.users.length) {
      filteredTableData[tab] = filteredTableData[tab].filter(data => {
        return filters.users.includes(data.user_id)
      })
    }
    if (tab === GroupTab && filters.groups.length) {
      filteredTableData[tab] = filteredTableData[tab].filter(data => {
        return filters.groups.includes(data.group_id)
      })
    }
    if (filters.permissions.length) {
      if (tab !== GeneralTab) {
        filteredTableData[tab] = filteredTableData[tab].filter(data => {
          return filters.permissions.includes(data.permission)
        })
      } else {
        filteredTableData[tab] = filteredTableData[tab].filter(data => {
          return filters.permissions.includes(data.organization) || filters.permissions.includes(data.public)
        })
      }
    }
  }

  // For notification
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const buttonID = open ? "Button-Save" : undefined;
  return (
    <Admin
      pageName={pageNames.DataAccess}
      rightHeader={
        <Fragment>
          {
            [UserTab, GroupTab].includes(tab) ?
              <Fragment>
                <AddButton
                  variant="primary"
                  text={"Share to " + tab}
                  onClick={() => {
                    setAddPermissionOpen(true)
                  }}
                />
                <AddData
                  open={addPermissionOpen}
                  setOpen={setAddPermissionOpen}
                  permissions={PERMISSIONS}
                  tab={tab}
                  data={null}
                  updateData={(data) => {
                  }}
                />
              </Fragment> : null
          }
          <Popover
            id={buttonID}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <div className='Popover-Submit'
                 dangerouslySetInnerHTML={{ __html: info }}>
            </div>
          </Popover>
        </Fragment>
      }>
      {/* FILTERS */}
      <div className='ListAdminFilters'>
        {
          tab === UserTab ? (
            <UserFilterSelector
              data={filters.users}
              setData={(data) => {
                setFilters({ ...filters, users: data })
              }}/>
          ) : tab === GroupTab ? (
            <GroupFilterSelector
              data={filters.groups}
              setData={(data) => {
                setFilters({ ...filters, groups: data })
              }}/>
          ) : ""
        }
        <IndicatorFilterSelector
          data={filters.indicators}
          setData={(data) => {
            setFilters({ ...filters, indicators: data })
          }}/>
        <DatasetFilterSelector
          data={filters.datasets}
          setData={(data) => {
            setFilters({ ...filters, datasets: data })
          }}/>
        <SelectFilter
          title={'Filter by Permission'} data={filters.permissions}
          options={PERMISSIONS}
          setData={(data) => {
            setFilters({ ...filters, permissions: data })
          }}/>
      </div>
      <div className='Tab TabPrimary'>
        <div
          className={tab === UserTab ? "Selected" : ""}
          onClick={() => setTab(UserTab)}
        >
          User(s)
        </div>
        <div
          className={tab === GroupTab ? "Selected" : ""}
          onClick={() => setTab(GroupTab)}
        >
          Group(s)
        </div>
        <div
          className={tab === GeneralTab ? "Selected" : ""}
          onClick={() => setTab(GeneralTab)}
        >
          Public
        </div>
      </div>
      {
        tab === GeneralTab ?
          <PublicDataAccess filters={filters}/> :
          tab === UserTab ?
            <UsersDataAccess filters={filters}/> :
            tab === GroupTab ?
              <GroupsDataAccess filters={filters}/> : null
      }
    </Admin>
  );
}

render(DataAccessAdmin, store)