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
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import ModalSelector from './Modal'
import { SelectWithList } from "../../../components/Input/SelectWithList";
import {
  fetchReferenceLayerList,
  fetchReferenceLayerViewsList,
  LocalReferenceDatasetIdentifier
} from "../../../utils/georepo";
import { Session } from "../../../utils/Sessions";

import './style.scss';


const columns = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'description', headerName: 'Description', flex: 1 },
  { field: 'last_update', headerName: 'Last Update', flex: 1 },
  { field: 'tags', headerName: 'Tags', flex: 1 },
]
/**
 * For Georepo View selection.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Array} selectedData Selected group.
 * @param {Function} selectedDataChanged Function of Selected group changed.
 * @param {Boolean} isMultiple Is data returned multiple object.
 * @param {Boolean} showSelected Is Showing selected data.
 * @param {array} filter List of id of data that will be used to filter data.
 * @param {React.Component} otherContent other content to be rendered.
 * */
export default function GeorepoViewSelector(
  {
    open,
    setOpen,
    selectedData,
    selectedDataChanged,
    isMultiple = true,
    showSelected = true,
    filter = false,
    otherContent = null
  }
) {
  const [sourceType, setSourceType] = useState(localReferenceDatasetEnabled ? 'local' : 'remote')
  const [inputData, setInputData] = useState(null)

  // This is for remote data
  const [references, setReferences] = useState([])
  const [reference, setReference] = useState(null)

  if (selectedData) {
    selectedData.map(_data => {
      if (_data.constructor === Object && !_data.id) {
        _data.id = _data?.identifier
      }
    })
  }

  /** On load functions */
  useEffect(
    () => {
      (
        async () => {
          const responseData = await fetchReferenceLayerList()
          const references = responseData.map(row => {
            row.value = row.identifier
            return row
          })
          setReferences(references)
        }
      )();
    }, []
  )

  /** On references loaded */
  useEffect(
    () => {
      if (sourceType === 'remote') {
        if (!reference && references[0]) {
          setReference(references[0].value)
        }
      }
    }, [references]
  )

  /** On source type changed */
  useEffect(
    () => {
      // Change to local module
      if (sourceType === 'local') {
        setReference(LocalReferenceDatasetIdentifier)
      } else {
        if (references[0]) {
          setReference(references[0].value)
        }
      }
    }, [sourceType]
  )

  /** On load functions */
  useEffect(
    () => {
      setInputData(null);
      (
        async () => {
          if (reference) {
            const session = new Session('GeorepoViewSelector')
            const responseData = await fetchReferenceLayerViewsList(reference)
            if (session.isValid) {
              responseData.map(data => {
                data.id = data.identifier
              })
              setInputData(responseData)
            }
          }
        }
      )();
    }, [reference]
  )
  columns[4].renderCell = (params) => {
    return params.row.tags.map(tag => {
      return <span
        style={{
          padding: '0.5rem',
          backgroundColor: '#EEE',
          marginRight: '2px'
        }}>{tag}</span>
    })
  }
  let usedInputData = inputData
  if (filter && usedInputData) {
    const newFilter = filter.concat(selectedData)
    usedInputData = usedInputData.filter(data => newFilter.includes(data.identifier))
  }

  return <>
    <ModalSelector
      title={"View(s)"}
      inputData={usedInputData}
      columns={columns}
      open={open}
      setOpen={setOpen}
      selectedData={selectedData}
      selectedDataChanged={selectedDataChanged}
      defaultSorting={[{ field: 'name', sort: 'asc' }]}
      isMultiple={isMultiple}
      showSelected={showSelected}
      beforeChildren={
        <>
          {
            localReferenceDatasetEnabled ?
              <FormControl className='RadioButtonControl'>
                <RadioGroup
                  value={sourceType}
                  onChange={evt => setSourceType(evt.target.value)}
                >
                  <FormControlLabel
                    value="local" control={<Radio/>} label="Local"/>
                  <FormControlLabel
                    value="remote" control={<Radio/>} label="Remote"/>
                </RadioGroup>
              </FormControl> : null
          }
          {
            !localReferenceDatasetEnabled || sourceType === 'remote' ?
              <FormControl className='InputControl'>
                <SelectWithList
                  placeholder={references ? 'Select dataset' : 'Loading'}
                  list={references}
                  value={reference}
                  onChange={evt => {
                    setReference(evt.value)
                  }}
                />
              </FormControl> : null
          }
        </>
      }
    />
    {otherContent ? otherContent : null}
  </>
}