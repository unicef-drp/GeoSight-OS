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

import React from "react";
import { formatDateTime } from "../../../../utils/main";

export const relatedTableColumns = [
  {
    field: 'id',
    headerName: 'id',
    hide: true,
    width: 30,
  },
  {
    field: 'name', headerName: 'Related Table Name', flex: 1,
    renderCell: (params) => {
      const permission = params.row.permission
      const editUrl = urls.api.edit;
      if (editUrl && (!permission || permission.edit)) {
        return <a className='MuiButtonLike CellLink'
                  href={editUrl.replace('/0', `/${params.id}`)}>
          {params.value}
        </a>
      } else {
        return <div className='MuiDataGrid-cellContent'>{params.value}</div>
      }
    }
  },
  { field: 'unique_id', headerName: 'UUID', flex: 1 },
  {
    field: 'created_at', headerName: 'Created at', flex: 0.5,
    renderCell: (params) => {
      return formatDateTime(new Date(params.value))
    }
  },
  {
    field: 'created_by',
    headerName: 'Created by',
    flex: 0.5
  }
]