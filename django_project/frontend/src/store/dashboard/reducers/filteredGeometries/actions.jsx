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
  FILTERED_GEOMETRIES_ACTION_NAME,
  FILTERED_GEOMETRIES_ACTION_TYPE_UPDATE
} from './index';

/**
 * Update filtered geometries.
 * @param {object} payload Filtered Geometries.
 */
export function update(payload) {
  return {
    name: FILTERED_GEOMETRIES_ACTION_NAME,
    type: FILTERED_GEOMETRIES_ACTION_TYPE_UPDATE,
    payload: payload
  };
}


export default {
  update
}