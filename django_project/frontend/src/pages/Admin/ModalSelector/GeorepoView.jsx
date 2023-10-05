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
import { FormControl } from "@mui/material";
import ModalSelector from './Modal'
import { SelectWithList } from "../../../components/Input/SelectWithList";
import {
  fetchReferenceLayerList,
  fetchReferenceLayerViewsList
} from "../../../utils/georepo";

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
 * */
export default function GeorepoViewSelector(
  {
    open,
    setOpen,
    selectedData,
    selectedDataChanged,
    isMultiple = true,
    showSelected = true
  }
) {

  const [references, setReferences] = useState([])
  const [reference, setReference] = useState(null)
  const [inputData, setInputData] = useState(null)

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
          if (!reference) {
            setReference(references[0].value)
          }
          setReferences(references)
        }
      )();
    }, []
  )

  /** On load functions */
  useEffect(
    () => {
      setInputData(null);
      (
        async () => {
          if (reference) {
            const responseData = await fetchReferenceLayerViewsList(reference)
            responseData.map(data => {
              data.id = data.identifier
            })
            setInputData(responseData)
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

  return <ModalSelector
    title={"Reference Dataset(s)"}
    inputData={inputData}
    columns={columns}
    open={open}
    setOpen={setOpen}
    selectedData={selectedData}
    selectedDataChanged={selectedDataChanged}
    defaultSorting={[{ field: 'name', sort: 'asc' }]}
    isMultiple={isMultiple}
    showSelected={showSelected}
    beforeChildren={
      <FormControl className='InputControl'>
        <SelectWithList
          placeholder={references ? 'Select dataset' : 'Loading'}
          list={references}
          value={reference}
          onChange={evt => {
            setReference(evt.value)
          }}
        />
      </FormControl>
    }
  />
}