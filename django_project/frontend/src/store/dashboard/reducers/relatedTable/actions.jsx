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
  RELATED_TABLE_ACTION_NAME,
  RELATED_TABLE_ACTION_TYPE_ADD,
  RELATED_TABLE_ACTION_TYPE_REARRANGE,
  RELATED_TABLE_ACTION_TYPE_REMOVE,
  RELATED_TABLE_ACTION_TYPE_UPDATE
} from './index'


/**
 * Add new related table data.
 * @param {object} payload New related table data.
 */
export function add(payload) {
  return {
    name: RELATED_TABLE_ACTION_NAME,
    type: RELATED_TABLE_ACTION_TYPE_ADD,
    payload: payload
  };
}


/**
 * Remove related table data.
 * @param {object} payload Related table data.
 */
export function remove(payload) {
  return {
    name: RELATED_TABLE_ACTION_NAME,
    type: RELATED_TABLE_ACTION_TYPE_REMOVE,
    payload: payload
  };
}

/**
 * Update related table data.
 * @param {object} payload Related table data.
 */
export function update(payload) {
  return {
    name: RELATED_TABLE_ACTION_NAME,
    type: RELATED_TABLE_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

/**
 * Rearrange related table data.
 * @param {object} payload Related table data.
 */
export function rearrange(payload) {
  return {
    name: RELATED_TABLE_ACTION_NAME,
    type: RELATED_TABLE_ACTION_TYPE_REARRANGE,
    payload: payload
  };
}

export default {
  add, remove, update, rearrange
}