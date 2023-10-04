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
 * __date__ = '04/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DataAccessTable from "./DataAccessTable";

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

// Render Cell
const renderCell = (params) => {
  return <FormControl className='BasicForm'>
    <Select
      value={params.value}
      onChange={(evt) => {
      }}
    >
      {
        PERMISSIONS.map(choice => {
          return <MenuItem
            key={choice[0]}
            value={choice[0]}>
            {choice[1]}
          </MenuItem>
        })
      }
    </Select>
  </FormControl>
}

const COLUMNS = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'indicator_name', headerName: 'Indicator', flex: 1 },
  { field: 'dataset_name', headerName: 'Dataset', flex: 0.5 },
  {
    field: 'permission', headerName: 'Public', width: 200,
    renderCell: (params) => {
      return renderCell(params)
    }
  }
]

/**
 * Render public data access table
 */
export default function PublicDataAccess({ filters }) {
  return <DataAccessTable
    urlData={urls.api.data.general}
    filters={filters}
    COLUMNS={COLUMNS}
    PERMISSIONS={PERMISSIONS}/>
}