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
  EXTENT_DEFAULT_ACTION_NAME,
  EXTENT_DEFAULT_ACTION_TYPE_CHANGE
} from './index'


/**
 * Change default of extent.
 * @param {object} payload New extent data.
 */
export function changeDefault(payload) {
  return {
    name: EXTENT_DEFAULT_ACTION_NAME,
    type: EXTENT_DEFAULT_ACTION_TYPE_CHANGE,
    payload: payload
  };
}

export default {
  changeDefault
}