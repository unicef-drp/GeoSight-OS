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

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { DataAccessTable } from "./DataAccessTable";

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

const COLUMNS = [
  { field: 'id', headerName: 'id', hide: true },
  {
    field: 'indicator_name', headerName: 'Indicator', flex: 1,
    serverKey: 'obj__obj__indicator__name'
  },
  {
    field: 'dataset_name', headerName: 'View', flex: 0.5,
    serverKey: 'obj__obj__reference_layer__name'
  },
  {
    field: 'group_name', headerName: 'Group', flex: 0.5,
    serverKey: 'group__name'
  }
]

/**
 * Render public data access table
 */
/**
 * Render public data access table
 */
export const GroupsDataAccess = forwardRef(
  ({ filters }, ref
  ) => {
    const tableRef = useRef(null);

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      createData(data, success, failed) {
        return tableRef?.current?.createData(data, success, failed)
      },
    }));
    return <DataAccessTable
      urlData={urls.api.data.groups}
      filters={filters}
      COLUMNS={COLUMNS}
      ableToDelete={true}
      PERMISSIONS={PERMISSIONS}
      dataName='group data access'
      ref={tableRef}
    />
  }
)
