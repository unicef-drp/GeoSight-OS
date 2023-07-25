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

/** MAP reducer */

export const MAP_ACTION_NAME = `MAP`;
export const MAP_CHANGE_BASEMAP = `MAP/CHANGE_BASEMAP`;
export const MAP_REFERENCE_LAYER_CHANGED = `MAP/REFERENCE_LAYER_CHANGED`;
export const MAP_INDICATOR_SHOW = `MAP/INDICATOR_SHOW`;
export const MAP_ADD_CONTEXTLAYERS = `MAP/ADD_CONTEXTLAYERS`;
export const MAP_CONTEXTLAYERS_SHOW = `MAP/CONTEXTLAYERS_SHOW`;
export const MAP_CENTER = `MAP/CENTER`;
export const MAP_EXTENT = `MAP/EXTENT`;
export const MAP_ZOOM = `MAP/ZOOM`;
export const MAP_REMOVE_CONTEXTLAYERS = `MAP/REMOVE_CONTEXTLAYERS`;
export const MAP_REMOVE_CONTEXTLAYERS_ALL = `MAP/REMOVE_CONTEXTLAYERS_ALL`;
export const MAP_POSITION = `MAP/POSITION`;
export const MAP_IS_3D_MODE = `MAP/IS_3D_MODE`;
export const MAP_UPDATE_CONFIG = `MAP/UPDATE_CONFIG`;

const mapInitialState = {
  referenceLayer: null,
  basemapLayer: null,
  contextLayers: {},
  center: null,
  extent: null,
  indicatorShow: true,
  contextLayersShow: true,
  zoom: 0,
  position: {},
  is3dMode: false,
  force: false,
};

export default function mapReducer(state = mapInitialState, action) {
  if (action.name === MAP_ACTION_NAME) {
    switch (action.type) {
      case MAP_CHANGE_BASEMAP: {
        return {
          ...state,
          basemapLayer: action.payload
        }
      }
      case MAP_ADD_CONTEXTLAYERS: {
        const contextLayers = Object.assign({}, state.contextLayers);
        const { layer, layer_type } = action.payload
        contextLayers[action.id] = {
          render: true,
          layer: layer,
          layer_type: layer_type
        }
        return {
          ...state,
          contextLayers: contextLayers
        }
      }
      case MAP_REMOVE_CONTEXTLAYERS: {
        const contextLayers = Object.assign({}, state.contextLayers);
        if (contextLayers[action.id]) {
          delete contextLayers[action.id]
        }
        return {
          ...state,
          contextLayers: contextLayers
        }
      }
      case MAP_REMOVE_CONTEXTLAYERS_ALL: {
        return {
          ...state,
          contextLayers: {}
        }
      }
      case MAP_REFERENCE_LAYER_CHANGED: {
        return {
          ...state,
          referenceLayer: action.payload
        }
      }
      case MAP_CENTER: {
        return {
          ...state,
          center: action.payload
        }
      }
      case MAP_EXTENT: {
        return {
          ...state,
          extent: action.payload
        }
      }
      case MAP_INDICATOR_SHOW: {
        return {
          ...state,
          indicatorShow: action.payload
        }
      }
      case MAP_CONTEXTLAYERS_SHOW: {
        return {
          ...state,
          contextLayersShow: action.payload
        }
      }
      case MAP_ZOOM: {
        return {
          ...state,
          zoom: action.payload
        }
      }
      case MAP_POSITION: {
        return {
          ...state,
          position: action.payload,
          force: false
        }
      }
      case MAP_IS_3D_MODE: {
        return {
          ...state,
          is3dMode: action.payload,
          force: false
        }
      }
      case MAP_UPDATE_CONFIG: {
        return {
          ...state,
          ...action.payload,
          force: true
        }
      }
    }
  }
  return state
}
