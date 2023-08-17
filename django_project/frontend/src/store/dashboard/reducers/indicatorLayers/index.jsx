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
 * INDICATOR_LAYERS LAYERS reducer
 */
import {
  addChildToGroupInStructure
} from "../../../../components/SortableTreeForm/utilities";
import { dataFieldsDefault } from "../../../../utils/indicatorLayer";

export const INDICATOR_LAYERS_ACTION_NAME = 'INDICATOR_LAYERS';
export const INDICATOR_LAYERS_ACTION_TYPE_ADD = 'INDICATOR_LAYERS/ADD';
export const INDICATOR_LAYERS_ACTION_TYPE_REMOVE = 'INDICATOR_LAYERS/REMOVE';
export const INDICATOR_LAYERS_ACTION_TYPE_UPDATE = 'INDICATOR_LAYERS/UPDATE';
export const INDICATOR_LAYERS_ACTION_TYPE_UPDATE_JSON = 'INDICATOR_LAYERS/UPDATE_JSON';
export const INDICATOR_LAYERS_ACTION_TYPE_REARRANGE = 'INDICATOR_LAYERS/REARRANGE';

const initialState = []
export default function indicatorLayersReducer(state = initialState, action, dashboardState) {
  switch (action.type) {
    case INDICATOR_LAYERS_ACTION_TYPE_ADD: {
      action.payload.id = state.length === 0 ? 1 : Math.max(...state.map(layer => layer.id)) + 1
      if (state.length === 0) {
        action.payload.visible_by_default = true
      }
      if (!action.payload.related_tables) {
        action.payload.related_tables = []
      }
      if (!action.payload.indicators) {
        action.payload.indicators = []
      }
      if (!action.payload.data_fields) {
        action.payload.data_fields = dataFieldsDefault()
      }
      addChildToGroupInStructure(action.payload.group, action.payload.id, dashboardState.indicatorLayersStructure)
      return [
        ...state,
        action.payload
      ]
    }

    case INDICATOR_LAYERS_ACTION_TYPE_REMOVE: {
      const newState = []
      let noVisiblePayload = action.payload.visible_by_default;
      state.forEach(function (indicator) {
        if (indicator.id !== action.payload.id) {
          if (noVisiblePayload) {
            indicator.visible_by_default = true
            noVisiblePayload = false;
          }
          newState.push(indicator)
        }
      })
      return newState
    }
    case INDICATOR_LAYERS_ACTION_TYPE_UPDATE: {
      const newState = []
      const currentVisible = state.find(indicator => indicator.visible_by_default)
      state.forEach(function (indicator) {
        if (indicator.id === action.payload.id) {
          newState.push(action.payload)
          if (!currentVisible || currentVisible?.id === action.payload.id) {
            indicator.visible_by_default = true
          }
        } else if (indicator.id !== action.payload.id) {
          if (action.payload.visible_by_default) {
            indicator.visible_by_default = false
          }
          newState.push(indicator)
        }
      })
      return newState
    }
    case INDICATOR_LAYERS_ACTION_TYPE_UPDATE_JSON: {
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
    case INDICATOR_LAYERS_ACTION_TYPE_REARRANGE: {
      let newState = []
      for (const [groupName, groupValue] of Object.entries(action.payload)) {
        for (const value of groupValue) {
          state.forEach(function (indicator) {
            if (indicator.id === value.data.id) {
              indicator.order = value.data.order;
              indicator.group = value.group;
              indicator.group_parent = value.group_parent;
              newState.push(indicator)
            }
          })
        }
      }
      return newState
    }
    default:
      return state
  }
}