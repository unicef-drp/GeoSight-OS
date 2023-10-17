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
 * __date__ = '17/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import {
  INDICATORS_ALL_DATA_ACTION_NAME,
  INDICATORS_ALL_DATA_TYPE_ADD_COUNT,
  INDICATORS_ALL_DATA_TYPE_ADD_DATA
} from './index'

/**
 * Add count of indicator data
 */
function addCount(id, count) {
  return {
    name: INDICATORS_ALL_DATA_ACTION_NAME,
    type: INDICATORS_ALL_DATA_TYPE_ADD_COUNT,
    payload: {
      id: id,
      count: count
    }
  };
}

/**
 * Add data of indicator data
 */
function addData(id, data) {
  return {
    name: INDICATORS_ALL_DATA_ACTION_NAME,
    type: INDICATORS_ALL_DATA_TYPE_ADD_DATA,
    payload: {
      id: id,
      data: data
    }
  };
}

export default {
  addCount, addData
}