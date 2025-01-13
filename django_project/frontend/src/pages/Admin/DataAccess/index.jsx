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
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { render } from '../../../app';
import {
  GroupFilterSelector,
  IndicatorFilterSelector,
  SelectFilter,
  UserFilterSelector
} from "../ModalSelector/ModalFilterSelector";
import { store } from '../../../store/admin';
import Admin, { pageNames } from '../index';
import { AddButton, SaveButton } from "../../../components/Elements/Button";
import { splitParams, urlParams } from "../../../utils/main";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../components/Modal";
import PublicDataAccess from "./Public";
import { UsersDataAccess } from "./Users";
import { GroupsDataAccess } from "./Groups";
import {
  DatasetFilterSelector
} from "../../../components/ResourceSelector/DatasetViewSelector";

import '../../Admin/Components/List/style.scss';
import './style.scss';


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
  { tab, open, setOpen, tableRef }
) {
  const [indicators, setIndicators] = useState([])
  const [datasets, setDatasets] = useState([])
  const [objects, setObjects] = useState([])
  const [permission, setPermission] = useState(PERMISSIONS[1][0])
  const [creating, setCreating] = useState(false)

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
    }}>
      Add permission
      <div className='helptext'>
        Automatically create multiple dataset.<br/>
        {tab === UserTab ? 'Users' : 'Groups'} and permission is required.<br/>
        You can put indicators or datasets empty to auto assign to all of the
        empty one.<br/>
        Example: We select indicator A and B, and dataset is empty, <br/>
        it will auto assign data access all of dataset for indicator A and
        B.<br/>
        This just create new data access, not updating existing one.<br/>
      </div>
    </ModalHeader>
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
            PERMISSIONS.map(choice => {
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
          disabled={creating || !tableRef?.current || !permission || !objects.length || !(indicators.length || datasets.length)}
          variant="primary"
          text={"Apply Changes"}
          onClick={() => {
            setCreating(true)
            tableRef?.current.createData(
              {
                indicators: indicators.map(row => row.id),
                datasets: datasets.map(row => row.identifier),
                objects: objects.map(row => row.id),
                permission: permission,
              },
              () => {
                setOpen(false)
                setCreating(false)
              },
              () => {
                setCreating(false)
              }
            )
          }}
        />
      </div>
    </ModalFooter>
  </Modal>
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
  const usersRef = useRef(null);
  const groupsRef = useRef(null);

  let paramTab = window.location.hash.replace('#', '').replaceAll('%20', ' ').toLowerCase()
  if (![UserTab, GroupTab, GeneralTab].includes(paramTab)) {
    paramTab = UserTab
  }

  const [tab, setTab] = useState(paramTab ? paramTab : UserTab)

  const [filters, setFilters] = useState({
    indicators: splitParams(indicators),
    datasets: splitParams(datasets, false),
    permissions: splitParams(permissions),
    users: splitParams(users),
    groups: splitParams(groups),
  })
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);

  /** When tab changes **/
  useEffect(() => {
    window.location.hash = tab
  }, [tab]);

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
                  tab={tab}
                  tableRef={tab === UserTab ? usersRef : groupsRef}
                />
              </Fragment> : null
          }
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
            <UsersDataAccess filters={filters} ref={usersRef}/> :
            tab === GroupTab ?
              <GroupsDataAccess filters={filters} ref={groupsRef}/> : null
      }
    </Admin>
  );
}

render(DataAccessAdmin, store)