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
  CONTEXT_LAYER_ACTION_NAME,
  CONTEXT_LAYER_ACTION_TYPE_ADD,
  CONTEXT_LAYER_ACTION_TYPE_REARRANGE,
  CONTEXT_LAYER_ACTION_TYPE_REMOVE,
  CONTEXT_LAYER_ACTION_TYPE_STYLE,
  CONTEXT_LAYER_ACTION_TYPE_UPDATE
} from './index'


/**
 * Add new context layer.
 * @param {object} payload New context layer data.
 */
export function add(payload) {
  return {
    name: CONTEXT_LAYER_ACTION_NAME,
    type: CONTEXT_LAYER_ACTION_TYPE_ADD,
    payload: payload
  };
}

/**
 * Remove context layer.
 * @param {object} payload Context layer data.
 */
export function remove(payload) {
  return {
    name: CONTEXT_LAYER_ACTION_NAME,
    type: CONTEXT_LAYER_ACTION_TYPE_REMOVE,
    payload: payload
  };
}

/**
 * Update context layer.
 * @param {object} payload Context layer data.
 */
export function update(payload) {
  return {
    name: CONTEXT_LAYER_ACTION_NAME,
    type: CONTEXT_LAYER_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

/**
 * Rearrange context layer.
 * @param {object} payload Context layer data.
 */
export function rearrange(payload) {
  return {
    name: CONTEXT_LAYER_ACTION_NAME,
    type: CONTEXT_LAYER_ACTION_TYPE_REARRANGE,
    payload: payload
  };
}

/**
 * Rearrange context layer.
 * @param {object} payload Context layer data.
 */
export function updateStyle(payload) {
  return {
    name: CONTEXT_LAYER_ACTION_NAME,
    type: CONTEXT_LAYER_ACTION_TYPE_STYLE,
    payload: payload
  };
}

export default {
  add, remove, update, rearrange, updateStyle
}