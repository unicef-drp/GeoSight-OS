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

export const CONTEXT_LAYER_ACTION_NAME = 'CONTEXT_LAYER';
export const CONTEXT_LAYER_ACTION_TYPE_ADD = 'CONTEXT_LAYER/ADD';
export const CONTEXT_LAYER_ACTION_TYPE_REMOVE = 'CONTEXT_LAYER/REMOVE';
export const CONTEXT_LAYER_ACTION_TYPE_UPDATE = 'CONTEXT_LAYER/UPDATE';
export const CONTEXT_LAYER_ACTION_TYPE_UPDATE_JSON = 'CONTEXT_LAYER/UPDATE_JSON';
export const CONTEXT_LAYER_ACTION_TYPE_REARRANGE = 'CONTEXT_LAYER/REARRANGE';
export const CONTEXT_LAYER_ACTION_TYPE_STYLE = 'CONTEXT_LAYER/STYLE';

const initialState = []
export default function contextLayersReducer(state = initialState, action, dashboardState) {
  if (action.name === CONTEXT_LAYER_ACTION_NAME) {
    switch (action.type) {
      case CONTEXT_LAYER_ACTION_TYPE_ADD: {
        addChildToGroupInStructure(
          action.payload.group, action.payload.id, dashboardState.contextLayersStructure
        )
        return [
          ...state,
          action.payload
        ]
      }
      case CONTEXT_LAYER_ACTION_TYPE_REMOVE: {
        const contextLayers = []
        state.forEach(function (contextLayer) {
          if (contextLayer.id !== action.payload.id) {
            contextLayers.push(contextLayer)
          }
        })
        const layer = action.payload
        removeChildInGroupInStructure(
          layer.group, layer.id, dashboardState.contextLayersStructure
        )
        return contextLayers
      }
      case CONTEXT_LAYER_ACTION_TYPE_UPDATE: {
        const contextLayers = []
        state.forEach(function (contextLayer) {
          if (contextLayer.id === action.payload.id) {
            contextLayers.push(action.payload)
          } else {
            contextLayers.push(contextLayer)
          }
        })
        return contextLayers
      }
      case CONTEXT_LAYER_ACTION_TYPE_UPDATE_JSON: {
        let newState = state
        state.forEach(function (layer) {
          const { id, data } = action.payload;
          if (layer.id === id) {
            for (const [key, value] of Object.entries(data)) {
              layer[key] = value
            }
            newState = [...state]
            return
          }
        })
        return newState
      }

      case CONTEXT_LAYER_ACTION_TYPE_REARRANGE: {
        const contextLayers = []
        let order = 0
        for (const [groupName, groupValue] of Object.entries(action.payload)) {
          for (const value of groupValue) {
            state.forEach(function (indicator) {
              if (indicator.id === value.data.id) {
                indicator.order = value.data.order;
                indicator.group = value.group;
                indicator.group_parent = value.group_parent;
                contextLayers.push(indicator)
              }
            })
          }
        }
        return contextLayers
      }
      case CONTEXT_LAYER_ACTION_TYPE_STYLE: {
        const contextLayers = []
        state.forEach(function (contextLayer) {
          if (contextLayer.id === action.payload.id) {
            if (action.payload.data_fields) {
              contextLayer.data_fields = action.payload.data_fields
            }
            if (action.payload.styles) {
              contextLayer.styles = action.payload.styles
            }
            if (action.payload.label_styles) {
              contextLayer.label_styles = action.payload.label_styles
            }
            contextLayer.override_style = action.payload.override_style
            contextLayer.override_label = action.payload.override_label
            contextLayer.override_field = action.payload.override_field
          }
          contextLayers.push(contextLayer)
        })
        return contextLayers
      }
      default:
        return state
    }
  }
}