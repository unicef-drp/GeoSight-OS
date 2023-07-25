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
  MAP_ACTION_NAME,
  MAP_ADD_CONTEXTLAYERS,
  MAP_CENTER,
  MAP_CHANGE_BASEMAP,
  MAP_CONTEXTLAYERS_SHOW,
  MAP_EXTENT,
  MAP_INDICATOR_SHOW,
  MAP_IS_3D_MODE,
  MAP_POSITION,
  MAP_REFERENCE_LAYER_CHANGED,
  MAP_REMOVE_CONTEXTLAYERS,
  MAP_UPDATE_CONFIG,
  MAP_ZOOM
} from '../map'


/**
 * Change basemap.
 * @param {object} payload Basemap data.
 */
function changeBasemap(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CHANGE_BASEMAP,
    payload: payload
  };
}

/**
 * Change reference layer.
 * @param {object} payload Reference layer data.
 */
function changeReferenceLayer(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_REFERENCE_LAYER_CHANGED,
    payload: payload
  };
}

/**
 * Add context layer.
 * @param {int} id ID of Context Layer.
 * @param {object} payload Context Layer data.
 */
function addContextLayer(id, payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_ADD_CONTEXTLAYERS,
    id: id,
    payload: payload,
  };
}

/**
 * Remove context layer.
 * @param {int} id ID of Context Layer.
 */
function removeContextLayer(id) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_REMOVE_CONTEXTLAYERS,
    id: id
  };
}

/**
 * Update center of map.
 */
function updateCenter(center) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CENTER,
    payload: center
  };
}

/**
 * Update extent of map.
 */
function updateExtent(center) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_EXTENT,
    payload: center
  };
}

/**
 * Show/Hide Indicator
 */
function showHideIndicator(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_INDICATOR_SHOW,
    payload: payload
  };
}

/**
 * Show/Hide ContextLayer
 */
function showHideContextLayer(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CONTEXTLAYERS_SHOW,
    payload: payload
  };
}

/**
 * Show/Hide ContextLayer
 */
function changeZoom(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_ZOOM,
    payload: payload
  };
}

/**
 * Position location
 */
function changePosition(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_POSITION,
    payload: payload
  };
}

/**
 * Position location
 */
function change3DMode(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_IS_3D_MODE,
    payload: payload
  };
}

/**
 * Position location
 */
function update(payload) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_UPDATE_CONFIG,
    payload: payload
  };
}

export default {
  updateCenter,
  changeBasemap,
  addContextLayer,
  removeContextLayer,
  changeReferenceLayer,
  updateExtent,
  showHideIndicator,
  showHideContextLayer,
  changeZoom,
  changePosition,
  change3DMode,
  update
}