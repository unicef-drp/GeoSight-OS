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
  WIDGET_ACTION_NAME,
  WIDGET_ACTION_TYPE_ADD,
  WIDGET_ACTION_TYPE_REARRANGE,
  WIDGET_ACTION_TYPE_REMOVE,
  WIDGET_ACTION_TYPE_UPDATE
} from './index'

/**
 * Add new Widget.
 * @param {object} payload New widget data.
 */
export function add(payload) {
  return {
    name: WIDGET_ACTION_NAME,
    type: WIDGET_ACTION_TYPE_ADD,
    payload: payload
  };
}

/**
 * Remove widget on an index.
 * @param {int} payload Widget that will be removed.
 */
export function remove(payload) {
  return {
    name: WIDGET_ACTION_NAME,
    type: WIDGET_ACTION_TYPE_REMOVE,
    payload: payload
  };
}

/**
 * Update specific widget data on an index.
 * @param {object} payload Widget that will be updated.
 */
export function update(payload) {
  return {
    name: WIDGET_ACTION_NAME,
    type: WIDGET_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

/**
 * Rearrange specific widget data on an index.
 * @param {object} payload Widget that will be updated.
 */
export function rearrange(payload) {
  return {
    name: WIDGET_ACTION_NAME,
    type: WIDGET_ACTION_TYPE_REARRANGE,
    payload: payload
  };
}

export default {
  add, remove, update, rearrange
}