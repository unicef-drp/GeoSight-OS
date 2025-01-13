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
import { fetchReferenceLayerList, GeorepoUrls } from "../../utils/georepo";
import { ModalInputSelector } from "./ModalInputSelector";
import { ModalFilterSelectorProps, ModalInputSelectorProps } from "./types";
import { DatasetView } from "../../types";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import { SelectWithList } from "../Input/SelectWithList";


const VALUE_REMOTE = 'Remote'
const VALUE_LOCAL = 'Local'

const columns = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'description', headerName: 'Description', flex: 1 },
  { field: 'last_update', headerName: 'Last Update', flex: 1 },
  {
    field: 'tags', headerName: 'Tags', flex: 1,
    renderCell: (params: any) => {
      return params.row.tags.map((tag: any) => {
        return <span
          style={{
            padding: '0.5rem',
            backgroundColor: '#EEE',
            marginRight: '2px'
          }}>{tag}</span>
      })
    }
  },
]

/** For Georepo View selection. */
export default function DatasetViewSelector(
  {
    // Input properties
    placeholder,
    showSelected,
    disabled,
    mode,

    // Data properties
    initData,

    // Listeners
    dataSelected,

    // Table properties
    multipleSelection,
  }: ModalInputSelectorProps
) {
  const [datasets, setDatasets] = useState([])
  const [dataset, setDataset] = useState(null)

  // @ts-ignore
  const isLocalEnabled = localReferenceDatasetEnabled
  const [sourceType, setSourceType] = useState(isLocalEnabled ? VALUE_LOCAL : VALUE_REMOTE)
  const url = sourceType === VALUE_REMOTE ? GeorepoUrls.WithDomain(`/search/dataset/${dataset}/view/list/`, true) : '/api/v1/reference-datasets/?page=1&page_size=25'

  /** Get the datasets */
  useEffect(
    () => {
      (
        async () => {
          const responseData = await fetchReferenceLayerList()
          const datasets = responseData.map((row: any) => {
            row.value = row.identifier
            return row
          })
          setDatasets(datasets)
        }
      )();
    }, []
  )

  /** On datasets loaded */
  useEffect(
    () => {
      if (!dataset && datasets[0]) {
        setDataset(datasets[0].value)
      }
    }, [datasets]
  )

  /*** Parameters Changed */
  const getParameters = (parameters: any) => {
    if (sourceType === VALUE_REMOTE) {
      if (parameters['name__icontains']) {
        parameters['search'] = parameters['name__icontains']
      } else {
        delete parameters['search']
      }
    } else {
      delete parameters['search']
    }
    return parameters
  }


  return <ModalInputSelector
    // Input properties
    placeholder={placeholder}
    showSelected={showSelected}
    disabled={disabled}
    mode={mode}
    dataName={'View'}

    // Data properties
    initData={initData}

    // Listeners
    url={url}
    columns={columns}
    getParameters={getParameters}
    dataSelected={(data: any) => {
      if (dataSelected) {
        dataSelected(data.map((_row: DatasetView) => {
          return {
            ..._row,
            id: _row.uuid,
            identifier: _row.uuid,
            is_local: sourceType === VALUE_LOCAL
          }
        }))
      }
    }}

    // Table properties
    multipleSelection={multipleSelection}
    rowIdKey={'uuid'}
    topChildren={
      <div
        className={'DatasetLayerSelector ' + (isLocalEnabled ? 'localDatasetDatasetEnabled' : '')}>
        {
          isLocalEnabled ?
            <FormControl className='RadioButtonControl'>
              <RadioGroup
                value={sourceType}
                onChange={evt => setSourceType(evt.target.value)}
                row
              >
                <FormControlLabel
                  control={<Radio/>}
                  value={VALUE_LOCAL}
                  label={VALUE_LOCAL}
                />
                <FormControlLabel
                  control={<Radio/>}
                  value={VALUE_REMOTE}
                  label={VALUE_REMOTE}/>
              </RadioGroup>
            </FormControl> : null
        }
        {
          !isLocalEnabled || sourceType === VALUE_REMOTE ?
            <SelectWithList
              placeholder={datasets ? 'Select dataset' : 'Loading'}
              list={datasets}
              value={dataset}
              onChange={(evt: any) => {
                setDataset(evt.value)
              }}
            /> : null
        }
      </div>
    }
  />
}

export function DatasetFilterSelector(
  {
    // Input properties
    showSelected,
    disabled,

    // Data properties
    data,

    // Listeners
    setData
  }: ModalFilterSelectorProps
) {
  return <DatasetViewSelector
    initData={
      data.map((row: any) => {
        return {
          identifier: row,
          uuid: row
        }
      })
    }
    dataSelected={(data) => {
      console.log(data)
      setData(data.map((row: any) => row.identifier))
    }}
    multipleSelection={true}
    showSelected={showSelected}
    disabled={disabled}
    placeholder={'Filter by View(s)'}
    mode={'filter'}
  />
}