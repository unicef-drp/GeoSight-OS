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


const columns = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'name', headerName: 'Name', flex: 1 },
]

/** For Georepo View selection. */
export default function GroupSelector(
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
    defaults,
    topChildren
  }: ModalInputSelectorProps
) {
  const [groups, setGroups] = useState([])
  const [group, setGroup] = useState(null)
  const url = '/api/v1/groups/?fields=__all__'

  /** Get the Groups */
  useEffect(
    () => {
      (
        async () => {
          const responseData = await fetchReferenceLayerList()
          const Groups = responseData.map((row: any) => {
            row.value = row.identifier
            return row
          })
          setGroups(Groups)
        }
      )();
    }, []
  )

  /** On Groups loaded */
  useEffect(
    () => {
      if (!group && groups[0]) {
        setGroup(groups[0].value)
      }
    }, [groups]
  )


  return <ModalInputSelector
    // Input properties
    placeholder={placeholder}
    showSelected={showSelected}
    disabled={disabled}
    mode={mode}
    dataName={'Group'}
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
    defaults={defaults}
    topChildren={topChildren}
  />
}

export function GroupFilterSelector(
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
  return <GroupSelector
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
    placeholder={'Filter by Group(s)'}
    mode={mode}
  />
}