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
import ModalSelector from './Modal'
import './style.scss';

export const USER_COLUMNS = [
  { field: 'id', headerName: 'id', hide: true },
  { field: 'username', headerName: 'Username', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'role', headerName: 'Role', flex: 1 },
]
if (USE_AZURE) {
  USER_COLUMNS[1].headerName = 'Email'
  USER_COLUMNS[1].field = 'email'
  USER_COLUMNS.splice(2, 1)
}

/**
 * For user data selection.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Array} selectedData Selected user.
 * @param {Function} selectedDataChanged Function of Selected user changed.
 * */
export default function UserSelector(
  {
    open,
    setOpen,
    selectedData,
    selectedDataChanged
  }
) {

  return <ModalSelector
    title={"User(s)"}
    api={urls.api.users}
    columns={USER_COLUMNS}
    open={open}
    setOpen={setOpen}
    selectedData={selectedData}
    selectedDataChanged={selectedDataChanged}
    defaultSorting={[{ field: 'username', sort: 'asc' }]}
  />

}