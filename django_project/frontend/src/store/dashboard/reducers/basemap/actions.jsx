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
  BASEMAP_ACTION_NAME,
  BASEMAP_ACTION_TYPE_ADD,
  BASEMAP_ACTION_TYPE_REARRANGE,
  BASEMAP_ACTION_TYPE_REMOVE,
  BASEMAP_ACTION_TYPE_UPDATE
} from './index'


/**
 * Add new basemap data.
 * @param {object} payload New basemap data.
 */
export function add(payload) {
  return {
    name: BASEMAP_ACTION_NAME,
    type: BASEMAP_ACTION_TYPE_ADD,
    payload: payload
  };
}


/**
 * Remove basemap data.
 * @param {object} payload Basemap data.
 */
export function remove(payload) {
  return {
    name: BASEMAP_ACTION_NAME,
    type: BASEMAP_ACTION_TYPE_REMOVE,
    payload: payload
  };
}

/**
 * Update basemap data.
 * @param {object} payload Basemap data.
 */
export function update(payload) {
  return {
    name: BASEMAP_ACTION_NAME,
    type: BASEMAP_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

/**
 * Rearrange basemap data.
 * @param {object} payload Basemap data.
 */
export function rearrange(payload) {
  return {
    name: BASEMAP_ACTION_NAME,
    type: BASEMAP_ACTION_TYPE_REARRANGE,
    payload: payload
  };
}

export default {
  add, remove, update, rearrange
}