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
 * __date__ = '25/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { AdminList } from "../../AdminList";
import { formatDateTime } from "../../../../utils/main";

/**
 * Access Request List
 */
export default function AccessRequestUserList() {
  const pageName = pageNames.AccessRequestUser
  return <AdminList
    columns={[
      { field: 'id', headerName: 'id', hide: true },
      { field: 'name', headerName: 'Name', flex: 1 },
      { field: 'requester_email', headerName: 'Requester Email', flex: 1 },
      { field: 'status', headerName: 'Status', flex: 1 },
      {
        field: 'submitted_date', headerName: 'Submitted Date', flex: 1,
        renderCell: (params) => {
          return formatDateTime(new Date(params.value))
        }
      },
    ]}
    pageName={pageName}
    listUrl={urls.api.list}
  />
}

render(AccessRequestUserList, store)