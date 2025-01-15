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
 * __date__ = '14/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React, { useEffect, useState } from 'react';
import { fetchReferenceLayerList } from "../../utils/georepo";
import { ModalInputSelector } from "./ModalInputSelector";
import { ModalFilterSelectorProps, ModalInputSelectorProps } from "./types";


export const columns = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'username', headerName: 'Username', flex: 1 },
  { field: 'email', headerName: 'Email address', flex: 1 },
  { field: 'first_name', headerName: 'First name', flex: 1 },
  { field: 'last_name', headerName: 'Last name', flex: 1 },
  { field: 'role', headerName: 'Role', flex: 1 },
]

/** For User selection. */
export default function UserSelector(
  {
    // Input properties
    placeholder,
    showSelected,
    disabled,
    mode,
    opener,

    // Data properties
    initData,

    // Listeners
    dataSelected,

    // Table properties
    multipleSelection,
    defaults = {},
    topChildren
  }: ModalInputSelectorProps
) {
  const [users, setUsers] = useState([])
  const [user, setUser] = useState(null)
  const url = '/api/v1/users/?fields=__all__'

  /** Get the Users */
  useEffect(
    () => {
      (
        async () => {
          const responseData = await fetchReferenceLayerList()
          const Users = responseData.map((row: any) => {
            row.value = row.identifier
            return row
          })
          setUsers(Users)
        }
      )();
    }, []
  )

  /** On Users loaded */
  useEffect(
    () => {
      if (!user && users[0]) {
        setUser(users[0].value)
      }
    }, [users]
  )


  return <ModalInputSelector
    // Input properties
    placeholder={placeholder}
    showSelected={showSelected}
    disabled={disabled}
    mode={mode}
    dataName={'User'}
    opener={opener}

    // Data properties
    initData={initData}

    // Listeners
    url={url}
    columns={columns}
    dataSelected={(data: any) => {
      if (dataSelected) {
        dataSelected(data)
      }
    }}

    // Table properties
    multipleSelection={multipleSelection}
    defaults={{
      sort: defaults.sort ? defaults.sort : [
        { field: 'username', sort: 'asc' }
      ],
      search: defaults.search,
      filters: defaults.filters
    }}
    topChildren={topChildren}
  />
}

export function UserFilterSelector(
  {
    // Input properties
    showSelected,
    disabled,
    mode = 'filter',
    multipleSelection = true,

    // Data properties
    data,

    // Listeners
    setData,
    opener
  }: ModalFilterSelectorProps
) {
  return <UserSelector
    initData={
      data.map((row: any) => {
        return {
          id: row
        }
      })
    }
    dataSelected={(data) => setData(data.map((row: any) => row.id))}
    multipleSelection={multipleSelection}
    showSelected={showSelected}
    disabled={disabled}
    opener={opener}
    placeholder={'Filter by User(s)'}
    mode={mode}
  />
}