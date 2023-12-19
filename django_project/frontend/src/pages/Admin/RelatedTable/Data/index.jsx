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
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { AdminList } from "../../AdminList";
import { fetchingData } from "../../../../Requests";
import { capitalize, parseDateTime } from "../../../../utils/main";
import { isValueDate } from "../../../../utils/relatedTable";

import './style.scss';

/**
 * Related Table App Data
 */
export default function RelatedTableData() {
  const [columns, setColums] = useState([]);
  const [data, setData] = useState(null);

  // Show modal when url changed
  useEffect(() => {
    fetchingData(urls.api.detail, {}, {}, (detailData) => {
      setColums(
        [
          { field: 'id', headerName: 'id', hide: true, width: 30, }
        ].concat(
          detailData.related_fields.map(field => {
            const isDate = isValueDate(field, null)
            return {
              field: field,
              headerName: capitalize(field),
              flex: 1,
              minWidth: 200,
              renderCell: (params) => {
                if (isDate) {
                  return parseDateTime(params.value)
                }
                return <div
                  title={params.value}
                  className='MuiDataGrid-cellContent'>
                  {params.value}
                </div>
              },
            }
          })
        )
      )
      fetchingData(urls.api.data, {}, {}, (listData) => {
        setData(listData)
      })
    })
  }, [])

  return <AdminList
    columns={columns}
    pageName={pageNames.RelatedTablesData}
    initData={data}
    listUrl={null}
  />
}

render(RelatedTableData, store)