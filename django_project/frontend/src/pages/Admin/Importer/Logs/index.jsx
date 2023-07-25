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
import { GridActionsCellItem } from "@mui/x-data-grid";
import DataUsageIcon from "@mui/icons-material/DataUsage";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { AdminList } from "../../AdminList";
import { COLUMNS_ACTION } from "../../Components/List";
import { COLUMNS } from "../utils";
import { urlParams } from "../../../../utils/main";

import './style.scss';

/**
 * Indicator List App
 */
export default function ImporterLogs() {
  const { search } = urlParams()
  const pageName = pageNames.ImporterLogs
  const columns = [
    COLUMNS.ID,
    Object.assign({}, COLUMNS.IMPORTER_BY, {
      renderCell: (params) => {
        return <a
          className='MuiButtonLike CellLink'
          href={urls.api.detailView.replace('/0', `/${params.id}`)}>
          {params.value}
        </a>
      }
    }),
    COLUMNS.START_AT,
    COLUMNS.IMPORT_TYPE,
    COLUMNS.INPUT_FORMAT,
    COLUMNS.JOB_NAME,
    COLUMNS.REFERENCE_DATASET,
    Object.assign({}, COLUMNS.LAST_RUN_RESULT, {
        field: 'status', headerName: 'Status'
      }
    ),
    Object.assign({}, COLUMNS.LAST_RUN_RESULT, {
        field: 'saved_data', headerName: 'Data saved',
        renderCell: (params) => {
          return `${params.row.saved_data} / ${params.row.count_data}`
        }
      }
    ),
    Object.assign({}, COLUMNS.ACTIONS, {
        getActions: (params) => {
          const actions = [].concat(
            COLUMNS_ACTION(
              params, urls.admin.importerLogs, urls.api.edit, urls.api.detail
            )
          );
          if (params.row.count_data) {
            actions.unshift(
              <GridActionsCellItem
                className='TextButton'
                icon={
                  <a href={urls.api.dataView.replace('/0', `/${params.id}`)}>
                    <div
                      className='MuiButton-Div MuiButtonBase-root MuiButton-secondary ThemeButton'>
                      <DataUsageIcon/> Data
                    </div>
                  </a>
                }
                label="Value List"
              />
            )
          }
          return actions
        },
      }
    )
  ]

  return <AdminList
    columns={columns}
    pageName={pageName}
    listUrl={urls.api.list}
    searchDefault={search}
    sortingDefault={[{ field: 'start_time', sort: 'desc' }]}
    multipleDelete={true}
  />
}

render(ImporterLogs, store)