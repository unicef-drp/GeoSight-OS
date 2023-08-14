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
import { MainDataGrid } from "../../../../components/MainDataGrid";

import './style.scss';

/**
 * Admin Table
 * @param {Array} rows List of data.
 * @param {Array} columns Columns for the table.
 * @param {function} selectionChanged Function when selection changed.
 * @param {function} sortingDefault The sorting default.
 * @param {boolean} selectable Is selectable.
 */
export function AdminTable(
  {
    rows,
    columns,
    selectionModel,
    setSelectionModel,
    sortingDefault = null,
    selectable = true,
    ...props
  }
) {
  const [pageSize, setPageSize] = useState(25);

  // When selection model show
  useEffect(() => {
    if (setSelectionModel) {
      if (props.selectedFullData) {
        if (rows) {
          setSelectionModel(rows.filter(row => selectionModel.includes(row.id)))
        } else {
          setSelectionModel([])
        }
      }
    }
  }, [selectionModel, rows]);

  let sorting = {
    sortModel: [{ field: 'name', sort: 'asc' }],
  }
  if (sortingDefault) {
    sorting = {
      sortModel: sortingDefault
    }
  }
  let filter = {}
  if (props.filterDefault) {
    filter = {
      filterModel: {
        items: props.filterDefault
      }
    }
  }

  // Is loading if rows are undefined or null
  const isLoading = [undefined, null].includes(rows)
  return (
    <Fragment>
      {
        selectionModel === undefined ? null :
          <div className='AdminListHeader'>
            <div
              className={'AdminListHeader-Count ' + (!selectionModel.length ? 'Empty' : '')}>
              {selectionModel.length + ' item' + (selectionModel.length > 1 ? 's' : '') + ' on this list ' + (selectionModel.length > 1 ? 'are' : 'is') + ' selected.'}
            </div>
            <div className='Separator'/>
            <div className='AdminListHeader-Right'>
              {props.header}
            </div>
          </div>
      }
      <div className='AdminTable'>
        <MainDataGrid
          getRowClassName={(params) => {
            return !params.row.permission || params.row.permission.read ? 'ResourceRow Readable' : 'ResourceRow'
          }}
          columnVisibilityModel={{
            id: false
          }}
          rows={isLoading ? [] : rows}
          columns={columns}
          pagination
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[25, 50, 100]}
          error={props.error}
          initialState={{
            sorting: sorting,
            filter: filter
          }}
          localeText={{
            noRowsLabel: props.noRowsLabel ? props.noRowsLabel : 'No results found',
            errorOverlayDefaultLabel: <div
              className='error'>{props.error}</div>
          }}
          disableSelectionOnClick

          checkboxSelection={columns?.length && !!setSelectionModel}
          onSelectionModelChange={(newSelectionModel) => {
            setSelectionModel(newSelectionModel);
          }}
          selectionModel={selectionModel ? selectionModel : []}
          isRowSelectable={(params) => {
            if (typeof selectable === 'function') {
              return selectable(params)
            } else {
              return selectable
            }
          }}
          loading={!props.error && isLoading}
          {...props}
        />
      </div>
    </Fragment>
  )
}