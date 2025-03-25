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
 * __date__ = '25/03/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React, { useEffect, useState } from 'react';
import { fetchReferenceLayerList } from "../../utils/georepo";
import { ModalInputSelector } from "./ModalInputSelector";
import { ModalFilterSelectorProps, ModalInputSelectorProps } from "./types";
import { DatasetView } from "../../types/DatasetView";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import { SelectWithList } from "../Input/SelectWithList";
import { URLS } from "../../utils/urls";
import { DatasetCountry } from "../../types/DatasetCountry";


const VALUE_REMOTE = 'Remote'
const VALUE_LOCAL = 'Local'

const columns = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'ucode', headerName: 'Ucode', flex: 1 },
  {
    field: 'codes', headerName: 'Codes', flex: 1,
    renderCell: (params: { row: DatasetCountry }) => {
      return Object.entries(params.row.codes).map(([key, value]) => {
        return <span
          style={{
            padding: '0.5rem',
            backgroundColor: '#EEE',
            marginRight: '2px'
          }}>{key} : {value}</span>
      });
    }
  },
]

/** For Georepo Country selection. */
export default function DatasetCountrySelector(
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
  }: ModalInputSelectorProps
) {
  const [datasets, setDatasets] = useState([])
  const [dataset, setDataset] = useState(null)

  // @ts-ignore
  const isLocalEnabled = localReferenceDatasetEnabled
  const [sourceType, setSourceType] = useState(isLocalEnabled ? VALUE_LOCAL : VALUE_REMOTE)
  const url = dataset ? URLS.ReferenceLayer.VIEW.List('' + dataset, sourceType === VALUE_LOCAL) : null

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
    opener={opener}

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
      !data ? [] : data.map((row: any) => {
        return {
          identifier: row,
          uuid: row
        }
      })
    }
    dataSelected={(data) => {
      setData(data.map((row: any) => row.identifier))
    }}
    multipleSelection={true}
    showSelected={showSelected}
    disabled={disabled}
    placeholder={'Filter by View(s)'}
    mode={'filter'}
  />
}