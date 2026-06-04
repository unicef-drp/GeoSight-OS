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
  MAP_UPDATE_TRANSPARENCY,
  MAP_ZOOM,
} from "./index";

function changeBasemap(payload: any) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CHANGE_BASEMAP,
    payload,
  };
}

function changeReferenceLayers(payload: any[]) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_REFERENCE_LAYER_CHANGED,
    payload,
  };
}

function addContextLayer(id: string | number, payload: any) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_ADD_CONTEXTLAYERS,
    id,
    payload,
  };
}

function removeContextLayer(id: string | number) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_REMOVE_CONTEXTLAYERS,
    id,
  };
}

function updateCenter(center: any) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CENTER,
    payload: center,
  };
}

function updateExtent(
  extent: [number, number, number, number],
  triggeredBy?: string,
) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_EXTENT,
    payload: extent,
    triggeredBy: triggeredBy,
  };
}

function showHideIndicator(payload: boolean) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_INDICATOR_SHOW,
    payload,
  };
}

function showHideContextLayer(payload: boolean) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CONTEXTLAYERS_SHOW,
    payload,
  };
}

function changeZoom(payload: number) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_ZOOM,
    payload,
  };
}

function changePosition(payload: Record<string, any>) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_POSITION,
    payload,
  };
}

function change3DMode(payload: boolean) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_IS_3D_MODE,
    payload,
  };
}

function update(payload: Record<string, any>) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_UPDATE_CONFIG,
    payload,
  };
}

function updateTransparency(key: string, value: number) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_UPDATE_TRANSPARENCY,
    payload: { key, value },
  };
}

export default {
  updateCenter,
  changeBasemap,
  addContextLayer,
  removeContextLayer,
  changeReferenceLayers,
  updateExtent,
  showHideIndicator,
  showHideContextLayer,
  changeZoom,
  changePosition,
  change3DMode,
  update,
  updateTransparency,
};
