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
  INDICATOR_LAYERS_ACTION_NAME,
  INDICATOR_LAYERS_ACTION_TYPE_ADD,
  INDICATOR_LAYERS_ACTION_TYPE_REARRANGE,
  INDICATOR_LAYERS_ACTION_TYPE_REMOVE,
  INDICATOR_LAYERS_ACTION_TYPE_UPDATE,
  INDICATOR_LAYERS_ACTION_TYPE_UPDATE_JSON
} from './index'


/**
 * Add new indicator data.
 * @param {object} payload New indicator data.
 */
export function add(payload) {
  return {
    name: INDICATOR_LAYERS_ACTION_NAME,
    type: INDICATOR_LAYERS_ACTION_TYPE_ADD,
    payload: payload
  };
}


/**
 * Remove indicator.
 * @param {object} payload Indicator indicator.
 */
export function remove(payload) {
  return {
    name: INDICATOR_LAYERS_ACTION_NAME,
    type: INDICATOR_LAYERS_ACTION_TYPE_REMOVE,
    payload: payload
  };
}

/**
 * Update indicator.
 * @param {object} payload Indicator indicator.
 */
export function update(payload) {
  return {
    name: INDICATOR_LAYERS_ACTION_NAME,
    type: INDICATOR_LAYERS_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

/**
 * Update indicator layer with specific data.
 * @param {int} id ID of indicator layer.
 * @param {object} data Data that will be updated.
 */
export function updateJson(id, data) {
  return {
    name: INDICATOR_LAYERS_ACTION_NAME,
    type: INDICATOR_LAYERS_ACTION_TYPE_UPDATE_JSON,
    payload: {
      id,
      data
    }
  };
}

/**
 * Rearrange indicator.
 * @param {object} payload Indicator indicator.
 */
export function rearrange(payload) {
  return {
    name: INDICATOR_LAYERS_ACTION_NAME,
    type: INDICATOR_LAYERS_ACTION_TYPE_REARRANGE,
    payload: payload
  };
}

export default {
  add, remove, update, updateJson, rearrange
}