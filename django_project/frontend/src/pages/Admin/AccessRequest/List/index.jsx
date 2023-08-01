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
import { MultipleAdminContent } from "../../MultipleAdminContent";
import { pageNames } from "../../index";
import AccessRequestUserList from "./User";
import AccessRequestPermissionList from "./Permission";


/**
 * Access Request List App
 */
export default function AccessRequestList({ defaultTab }) {
  return user.is_staff ?
    <MultipleAdminContent
      pageName={pageNames.AccessRequestList}
      defaultTab={defaultTab}
      contents={{
        'New Users': <AccessRequestUserList/>,
        'Permission Requests': <AccessRequestPermissionList/>
      }}
    /> : <MultipleAdminContent
      pageName={pageNames.AccessRequestList}
      defaultTab={defaultTab}
      contents={{
        'Permission Requests': <AccessRequestPermissionList/>
      }}
    />
}

render(AccessRequestList, store)