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
 * __date__ = '29/07/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import {
  MAP_GEOMETRY_VALUE_ACTION_NAME,
  MAP_GEOMETRY_VALUE_ACTION_UPDATE
} from './index'

/**
 * Change values.
 */
export function update(values) {
  return {
    name: MAP_GEOMETRY_VALUE_ACTION_NAME,
    type: MAP_GEOMETRY_VALUE_ACTION_UPDATE,
    values: values
  };
}

export default {
  update
}