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
  GEOMETRIES_VT_ACTION_NAME,
  GEOMETRIES_VT_ACTION_TYPE_ADD,
  GEOMETRIES_VT_ACTION_TYPE_ADD_LEVEL_DATA,
  GEOMETRIES_VT_ACTION_TYPE_DELETE_ALL,
  GEOMETRIES_VT_ACTION_TYPE_UPDATE
} from './index';

/**
 * Change data of filter.
 * @param {object} key Key data.
 * @param {object} value Value data.
 */
export function add(key, value) {
  return {
    name: GEOMETRIES_VT_ACTION_NAME,
    type: GEOMETRIES_VT_ACTION_TYPE_ADD,
    key: key,
    value: value
  };
}

/**
 * Add level data.
 * @param {int} level Level of data.
 * @param {object} data Value data.
 */
export function addLevelData(level, data) {
  return {
    name: GEOMETRIES_VT_ACTION_NAME,
    type: GEOMETRIES_VT_ACTION_TYPE_ADD_LEVEL_DATA,
    level: level,
    data: data
  };
}

/**
 * Delete all data.
 */
export function deleteAll() {
  return {
    name: GEOMETRIES_VT_ACTION_NAME,
    type: GEOMETRIES_VT_ACTION_TYPE_DELETE_ALL
  };
}

/**
 * Update all data.
 */
export function update() {
  return {
    name: GEOMETRIES_VT_ACTION_NAME,
    type: GEOMETRIES_VT_ACTION_TYPE_UPDATE
  };
}


export default {
  add, addLevelData, deleteAll, update
}