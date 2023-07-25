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
 * __date__ = '28/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import {
  INDICATOR_LAYER_DATES_ACTION_NAME,
  INDICATOR_LAYER_DATES_ACTION_TYPE_ADD
} from './index'

/**
 * Add dates.
 * @param {object} id indicator ID.
 * @param {object} dates List of dates.
 */
export function add(id, dates) {
  return {
    name: INDICATOR_LAYER_DATES_ACTION_NAME,
    type: INDICATOR_LAYER_DATES_ACTION_TYPE_ADD,
    id: id,
    dates: dates
  };
}

export default {
  add
}