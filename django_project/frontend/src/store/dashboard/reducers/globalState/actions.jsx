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
  GLOBAL_STATE_ACTION_NAME,
  GLOBAL_STATE_ACTION_TYPE_UPDATE,
} from './index'

/**
 * Update global state
 */
export function update(payload) {
  return {
    name: GLOBAL_STATE_ACTION_NAME,
    type: GLOBAL_STATE_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

export default { update }