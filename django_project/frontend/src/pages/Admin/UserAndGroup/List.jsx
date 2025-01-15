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

import { render } from '../../../app';
import { store } from '../../../store/admin';
import { pageNames } from "../index";
import MultipleAdminContent
  from "../../../components/Admin/MultipleAdminContent";
import GroupList from "../../../components/AdminList/Contents/Group";


/**
 * Indicator List App
 */
export default function UserAndGroupList({ defaultTab }) {
  return <MultipleAdminContent
    pageName={pageNames.UsersAndGroups}
    defaultTab={defaultTab}
    contents={
      [
        { name: 'Group', content: <GroupList/> }
      ]
    }
  />
}

render(UserAndGroupList, store)