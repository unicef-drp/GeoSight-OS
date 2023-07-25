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

import {
  SELECTED_ADMIN_LEVEL_ACTION_TYPE_CHANGE,
  SELECTED_ADMIN_LEVEL_NAME,
} from './index'

/**
 * Change admin level.
 * @param {object} payload Admin level data.
 */
export function change(payload) {
  return {
    name: SELECTED_ADMIN_LEVEL_NAME,
    type: SELECTED_ADMIN_LEVEL_ACTION_TYPE_CHANGE,
    payload: payload
  };
}

export default {
  change
}