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
  MAP_REFERENCE_LAYER_CHANGED,
  MAP_CHANGE_BASEMAP,
  MAP_UPDATE_INDICATOR_LAYERS,
  MAP_ADD_INDICATOR_LAYERS,
  MAP_REMOVE_INDICATOR_LAYERS,
  MAP_ADD_CONTEXTLAYERS,
  MAP_REMOVE_CONTEXTLAYERS,
  MAP_ZOOM,
  MAP_POSITION,
  MAP_IS_3D_MODE,
  MAP_CENTER,
  MAP_EXTENT,
  MAP_INDICATOR_SHOW,
  MAP_CONTEXTLAYERS_SHOW,
  MAP_UPDATE_TRANSPARENCY,
  MapPosition,
} from "./index";
import { IndicatorLayer } from "../../../../types/IndicatorLayer";

// Reference layers
function changeReferenceLayers(payload: any[]) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_REFERENCE_LAYER_CHANGED,
    payload,
  };
}

// Basemap
function changeBasemap(payload: any) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_CHANGE_BASEMAP,
    payload,
  };
}

// Indicator layers
function updateIndicatorLayers(payload: IndicatorLayer[]) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_UPDATE_INDICATOR_LAYERS,
    payload,
  };
}

function addIndicatorLayer(payload: IndicatorLayer) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_ADD_INDICATOR_LAYERS,
    payload,
  };
}

function removeIndicatorLayer(id: number) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_REMOVE_INDICATOR_LAYERS,
    id,
  };
}

// Context layers
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

// Map positions
function changeZoom(payload: number) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_ZOOM,
    payload,
  };
}

function changePosition(payload: Partial<MapPosition>, triggeredBy?: number) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_POSITION,
    payload,
    triggeredBy,
  };
}

function change3DMode(payload: boolean) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_IS_3D_MODE,
    payload,
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
  triggeredBy?: number,
) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_EXTENT,
    payload: extent,
    triggeredBy: triggeredBy,
  };
}

// Layer visibility
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

// Layer transparency
function updateTransparency(key: string, value: number) {
  return {
    name: MAP_ACTION_NAME,
    type: MAP_UPDATE_TRANSPARENCY,
    payload: { key, value },
  };
}

export default {
  changeReferenceLayers,
  changeBasemap,
  updateIndicatorLayers,
  addIndicatorLayer,
  removeIndicatorLayer,
  addContextLayer,
  removeContextLayer,
  changeZoom,
  changePosition,
  change3DMode,
  updateCenter,
  updateExtent,
  showHideIndicator,
  showHideContextLayer,
  updateTransparency,
};
