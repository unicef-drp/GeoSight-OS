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

import React, { Fragment, useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

import { IconTextField } from '../Elements/Input'
import { fetchJSON } from "../../Requests";
import { MainDataGrid } from "../MainDataGrid";

import './style.scss';

/**
 * Resource List With API
 * @param {String} title Title.
 * @param {String} url Url for list row.
 * @param {Array} columns Columns setup.
 * @param {Array} selectedData Selection model.
 * @param {Function} selectedDataChanged Function of Selected data changed.
 * @param {dict} sortingDefault Soring default.
 * @param {boolean} isMultiple Is multiple selection.
 * @param {Array} initData Init Data.
 */
export default function List(
  {
    title, url, columns,
    sortingDefault,
    selectedData,
    selectedDataChanged,
    isMultiple = true,
    initData = null
  }
) {
  const [data, setData] = useState(initData)
  const [search, setSearch] = useState(null)

  /** Fetch list of data */
  const fetchData = (url) => {
    if (!data) {
      fetchJSON(url).then(data => {
        setData(data)
      })
    }
  }

  /**
   * Fetch data when list created
   */
  useEffect(() => {
    fetchData(url)
  }, [])

  /** Search on change */
  const searchOnChange = (evt) => {
    setSearch(evt.target.value.toLowerCase())
  }

  /** Filter by search input */
  const fields = columns.map(column => column.field).filter(column => column !== 'id')
  let rows = data;
  if (search && rows) {
    rows = rows.filter(row => {
      let found = false
      fields.map(field => {
        if (row[field]?.toLowerCase().includes(search.toLowerCase())) {
          found = true;
        }
      })
      return found
    })
  }

  // Init sorting
  let sorting = {
    sortModel: sortingDefault ? sortingDefault : [{
      field: 'name',
      sort: 'asc'
    }],
  }

  /** Render **/
  return (
    <Fragment>
      <div className='ResourceList'>
        <div className='ResourceInput'>
          <IconTextField
            placeholder={"Search " + title}
            iconStart={<SearchIcon/>}
            onChange={searchOnChange}
          />
        </div>

        <div className='ResourceTable'>
          <MainDataGrid
            getRowClassName={(params) => {
              return (!params.row.permission || params.row.permission?.read)
                ? 'ResourceRow Readable' : 'ResourceRow'
            }}
            rows={rows ? rows : []}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[20]}
            initialState={{
              sorting: sorting,
            }}
            disableSelectionOnClick
            checkboxSelection={!!selectedDataChanged}
            selectionModel={selectedData.map(row => row.id)}
            loading={!rows}

            onSelectionModelChange={(newSelectionModel) => {
              if (data) {
                let newData = newSelectionModel.map(id => {
                  return data.find(row => row.id === id)
                })
                if (!isMultiple) {
                  newData = newData[newData.length - 1] ? [newData[newData.length - 1]] : []
                }
                selectedDataChanged(newData);
              }
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}