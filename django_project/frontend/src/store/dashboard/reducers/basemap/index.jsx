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

/**
 * WIDGETS reducer
 */
import {
  addChildToGroupInStructure,
  removeChildInGroupInStructure
} from "../../../../components/SortableTreeForm/utilities";


export const BASEMAP_ACTION_NAME = 'BASEMAP';
export const BASEMAP_ACTION_TYPE_ADD = 'BASEMAP/ADD';
export const BASEMAP_ACTION_TYPE_UPDATE = 'BASEMAP/UPDATE';
export const BASEMAP_ACTION_TYPE_REMOVE = 'BASEMAP/REMOVE';
export const BASEMAP_ACTION_TYPE_REARRANGE = 'BASEMAP/REARRANGE';

const initialState = []
export default function basemapsReducer(state = initialState, action, dashboardState) {
  if (action.name === BASEMAP_ACTION_NAME) {
    switch (action.type) {
      case BASEMAP_ACTION_TYPE_ADD: {
        if (state.length === 0) {
          action.payload.visible_by_default = true
        }
        addChildToGroupInStructure(action.payload.group, action.payload.id, dashboardState.basemapsLayersStructure)
        return [
          ...state,
          action.payload
        ]
      }
      case BASEMAP_ACTION_TYPE_REMOVE: {
        const basemapLayers = []
        let noVisiblePayload = action.payload.visible_by_default;
        state.forEach(function (basemapLayer) {
          if (basemapLayer.id !== action.payload.id) {
            if (noVisiblePayload) {
              basemapLayer.visible_by_default = true
              noVisiblePayload = false;
            }
            basemapLayers.push(basemapLayer)
          }
        })
        const layer = action.payload
        removeChildInGroupInStructure(layer.group, layer.id, dashboardState.basemapsLayersStructure)
        return basemapLayers
      }
      case BASEMAP_ACTION_TYPE_UPDATE: {
        const basemapLayers = []
        state.forEach(function (basemapLayer) {
          if (basemapLayer.id === action.payload.id) {
            basemapLayers.push(action.payload)
          } else {
            if (action.payload.visible_by_default) {
              basemapLayer.visible_by_default = false
            }
            basemapLayers.push(basemapLayer)
          }
        })
        return basemapLayers
      }
      case BASEMAP_ACTION_TYPE_REARRANGE: {
        const basemapLayers = []
        for (const [groupName, groupValue] of Object.entries(action.payload)) {
          for (const value of groupValue) {
            state.forEach(function (indicator) {
              if (indicator.id === value.data.id) {
                indicator.order = value.data.order;
                indicator.group = value.group;
                indicator.group_parent = value.group_parent;
                basemapLayers.push(indicator)
              }
            })
          }
        }
        return basemapLayers
      }
      default:
        return state
    }
  }
}