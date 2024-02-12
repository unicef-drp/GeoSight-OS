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
import { COLUMNS } from "../../Components/List";
import { AdminList } from "../../AdminList";

import './style.scss';
import { GridActionsCellItem } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import { DataBrowserActiveIcon } from "../../../../components/Icons";

/**
 * ReferenceLayerView App
 */
export default function ReferenceLayerViewList() {
  const pageName = pageNames.ReferenceLayerView
  const columns = COLUMNS(pageName, urls.admin.boundaryList);
  const cleanColumns = [
    columns[0], columns[1], columns[2],
    {
      field: 'identifier', headerName: 'Identifier', flex: 0.5
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      cellClassName: 'MuiDataGrid-ActionsColumn',
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={
              <Tooltip title={`Browse data`}>
                <a
                  href={urls.api.entityBrowser.replace('0', params.row.identifier)}>
                  <div className='ButtonIcon'>
                    <DataBrowserActiveIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Browse entities"
          />
        ]
        return actions
      }
    }
  ]
  return <AdminList
    columns={cleanColumns}
    pageName={pageName}
    listUrl={urls.api.list}
    multipleDelete={true}
  />
}

render(ReferenceLayerViewList, store)