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

import React from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { AdminList } from "../../AdminList";
import { COLUMNS } from "../../Importer/utils";

import './style.scss';


/**
 * ReferenceLayerView App
 */
export default function ImporterEntityList() {
  const pageName = pageNames.referenceDatesetImporter
  const LOG_COLUMNS = [
    COLUMNS.ID,
    {
      field: 'created_by',
      headerName: 'Imported By',
      flex: 0.5,
      renderCell: (params) => {
        const urlDetail = params.row.urls.detail
        if (urlDetail) {
          return <a
            className='MuiButtonLike CellLink'
            href={urlDetail.replace('00000000-0000-0000-0000-000000000000', 'test')}>
            {params.value}
          </a>
        }
        return params.value
      }
    },
    COLUMNS.START_AT,
    COLUMNS.REFERENCE_DATASET,
    COLUMNS.STATUS,
  ]
  return <AdminList
    columns={LOG_COLUMNS}
    pageName={pageName}
    listUrl={urls.api.list}
    hideSearch={true}
  />
}

render(ImporterEntityList, store)