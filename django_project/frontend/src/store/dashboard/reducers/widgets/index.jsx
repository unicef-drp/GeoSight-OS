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

export const WIDGET_ACTION_NAME = 'WIDGET';
export const WIDGET_ACTION_TYPE_ADD = 'WIDGET/ADD';
export const WIDGET_ACTION_TYPE_REMOVE = 'WIDGET/REMOVE';
export const WIDGET_ACTION_TYPE_UPDATE = 'WIDGET/UPDATE';
export const WIDGET_ACTION_TYPE_REARRANGE = 'WIDGET/REARRANGE';

const initialState = []
export default function widgetsReducer(state = initialState, action, dashboardState) {
  switch (action.type) {
    case WIDGET_ACTION_TYPE_ADD: {
      action.payload.id = state.length === 0 ? 1 : Math.max(...state.map(layer => layer.id)) + 1
      addChildToGroupInStructure(
        action.payload.group, action.payload.id, dashboardState.widgetsStructure
      )
      return [
        ...state,
        action.payload
      ]
    }
    case WIDGET_ACTION_TYPE_REMOVE: {
      const newState = []
      state.forEach(function (widget) {
        if (widget.id !== action.payload.id) {
          newState.push(widget)
        }
      })
      const layer = action.payload
      removeChildInGroupInStructure(
        layer.group, layer.id, dashboardState.widgetsStructure
      )
      return newState
    }
    case WIDGET_ACTION_TYPE_UPDATE: {
      const newState = []
      state.forEach(function (widget) {
        if (widget.id === action.payload.id) {
          newState.push(action.payload)
        } else if (widget.id !== action.payload.id) {
          newState.push(widget)
        }
      })
      return newState
    }
    case WIDGET_ACTION_TYPE_REARRANGE: {
      const newState = []
      let order = 0
      for (const [groupName, groupValue] of Object.entries(action.payload)) {
        for (const value of groupValue) {
          state.forEach(function (item) {
            if (item.id === value.data.id) {
              item.order = value.data.order;
              item.group = value.group;
              item.group_parent = value.group_parent;
              newState.push(item)
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