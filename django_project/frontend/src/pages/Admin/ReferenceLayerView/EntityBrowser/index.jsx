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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from "@mui/material/utils";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import {
  MultipleCreatableFilter
} from "../../ModalSelector/ModalFilterSelector/MultipleCreatableFilter";
import { splitParams, urlParams } from "../../../../utils/main";
import { AdminListPagination } from "../../AdminListPagination";
import { AdminPage, pageNames } from "../../index";
import { IconTextField } from "../../../../components/Elements/Input";
import { MagnifyIcon } from "../../../../components/Icons";


import './style.scss';

/*** Entity Browser admin */
export default function EntityBrowserAdmin() {
  const tableRef = useRef(null);
  const [searchName, setSearchName] = useState('')

  // Other attributes
  const defaultFilters = urlParams()
  const [filters, setFilters] = useState({
    name: defaultFilters.name ? splitParams(defaultFilters.name) : '',
    levels: defaultFilters.levels ? splitParams(defaultFilters.levels) : [],
    geographies: defaultFilters.geographies ? splitParams(defaultFilters.geographies) : []
  })
  const [disabled, setDisabled] = useState(false)
  const [isInit, setIsInit] = useState(true)

  // When filter changed
  useEffect((prev) => {
    if (!isInit) {
      tableRef?.current?.refresh()
    }
    setIsInit(false)
  }, [filters])

  /** Name value changed, debouce **/
  const nameValueUpdate = useMemo(
    () =>
      debounce(
        (newValue) => {
          setFilters({
            ...filters,
            name: newValue
          })
        },
        400
      ),
    []
  )

  /** Search name value changed **/
  useEffect(() => {
    nameValueUpdate(searchName)
  }, [searchName]);

  // COLUMNS
  const COLUMNS = [
    { field: 'id', headerName: 'id', hide: true },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'admin_level', headerName: 'Level', width: 80, },
    { field: 'ucode', headerName: 'Geo Code', flex: 1 }
  ]

  /***
   * Parameters Changed
   */
  const getParameters = (parameters) => {
    if (filters.levels.length) {
      parameters['admin_level__in'] = filters.levels.join(',')
    } else {
      delete parameters['admin_level__in']
    }
    if (filters.geographies.length) {
      parameters['geom_id__icontains'] = filters.geographies.join(',')
    } else {
      delete parameters['geom_id__icontains']
    }
    if (filters.name) {
      parameters['name__icontains'] = filters.name
    } else {
      delete parameters['name__icontains']
    }
    return parameters
  }

  return <AdminPage pageName={pageNames.ReferenceLayerView}>
    <AdminListPagination
      ref={tableRef}
      urlData={urls.api.browserApi}
      COLUMNS={COLUMNS}
      disabled={disabled}
      setDisabled={setDisabled}
      rightHeader={
        <div>
          <IconTextField
            placeholder={"Search name"}
            defaultValue={filters.name}
            iconEnd={<MagnifyIcon/>}
            onChange={evt => {
              setSearchName(evt.target.value)
            }}
          />
        </div>
      }
      otherFilters={
        <div className='ListAdminFilters'>
          <MultipleCreatableFilter
            title={'Filter by Level(s)'}
            data={filters.levels}
            setData={
              newFilter => setFilters({
                ...filters,
                levels: newFilter
              })
            }/>
          <MultipleCreatableFilter
            title={'Filter by Geo Code(s)'}
            data={filters.geographies}
            setData={newFilter => setFilters({
              ...filters,
              geographies: !newFilter.length ? [] : [newFilter[newFilter.length - 1]]
            })}/>
        </div>
      }
      getParameters={getParameters}
      hideSearch={true}
      deselectWhenParameterChanged={true}
      disabledCheckboxSelection={true}
    />
  </AdminPage>
}

render(EntityBrowserAdmin, store)