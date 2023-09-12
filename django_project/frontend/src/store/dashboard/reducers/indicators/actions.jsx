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
  INDICATOR_ACTION_NAME,
  INDICATOR_ACTION_TYPE_ADD,
  INDICATOR_ACTION_TYPE_BATCH_REMOVE,
  INDICATOR_ACTION_TYPE_REARRANGE,
  INDICATOR_ACTION_TYPE_REMOVE,
  INDICATOR_ACTION_TYPE_UPDATE,
} from './index'


/**
 * Add new indicator data.
 * @param {object} payload New indicator data.
 */
export function add(payload) {
  return {
    name: INDICATOR_ACTION_NAME,
    type: INDICATOR_ACTION_TYPE_ADD,
    payload: payload
  };
}


/**
 * Remove indicator.
 * @param {object} payload Indicator indicator.
 */
export function remove(payload) {
  return {
    name: INDICATOR_ACTION_NAME,
    type: INDICATOR_ACTION_TYPE_REMOVE,
    payload: payload
  };
}

/**
 * Remove batch by ids.
 * @param {object} payload ids of data.
 */
export function batchRemove(payload) {
  return {
    name: INDICATOR_ACTION_NAME,
    type: INDICATOR_ACTION_TYPE_BATCH_REMOVE,
    payload: payload
  };
}

/**
 * Update indicator.
 * @param {object} payload Indicator indicator.
 */
export function update(payload) {
  return {
    name: INDICATOR_ACTION_NAME,
    type: INDICATOR_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

/**
 * Rearrange indicator.
 * @param {object} payload Indicator indicator.
 */
export function rearrange(payload) {
  return {
    name: INDICATOR_ACTION_NAME,
    type: INDICATOR_ACTION_TYPE_REARRANGE,
    payload: payload
  };
}

export default {
  add, remove, batchRemove, update, rearrange
}