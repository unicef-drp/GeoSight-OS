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
import { formatDateTime } from "../../utils/main";


const columns = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'unique_id', headerName: 'UUID', flex: 1 },
  {
    field: 'created_at', headerName: 'Created at', flex: 0.5,
    renderCell: (params: any) => {
      return formatDateTime(new Date(params.value))
    }
  },
  {
    field: 'creator', headerName: 'Created by', flex: 0.5
  }
]

/** For Georepo View selection. */
export default function RelatedTableSelector(
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
    defaults
  }: ModalInputSelectorProps
) {
  const [relatedTables, setRelatedTables] = useState([])
  const [relatedTable, setRelatedTable] = useState(null)
  const url = '/api/v1/related-tables/?fields=__all__'

  /** Get the RelatedTables */
  useEffect(
    () => {
      (
        async () => {
          const responseData = await fetchReferenceLayerList()
          const RelatedTables = responseData.map((row: any) => {
            row.value = row.identifier
            return row
          })
          setRelatedTables(RelatedTables)
        }
      )();
    }, []
  )

  /** On RelatedTables loaded */
  useEffect(
    () => {
      if (!relatedTable && relatedTables[0]) {
        setRelatedTable(relatedTables[0].value)
      }
    }, [relatedTables]
  )


  return <ModalInputSelector
    // Input properties
    placeholder={placeholder}
    showSelected={showSelected}
    disabled={disabled}
    mode={mode}
    dataName={'Related Table'}
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
  />
}

export function RelatedTableFilterSelector(
  {
    // Input properties
    showSelected,
    disabled,
    mode = 'filter',
    multipleSelection = true,

    // Data properties
    data,

    // Listeners
    setData
  }: ModalFilterSelectorProps
) {
  return <RelatedTableSelector
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
    placeholder={'Filter by Related Table(s)'}
    mode={mode}
  />
}