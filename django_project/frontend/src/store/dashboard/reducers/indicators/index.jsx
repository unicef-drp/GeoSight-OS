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
 * INDICATOR reducer
 */

export const INDICATOR_ACTION_NAME = 'INDICATOR';
export const INDICATOR_ACTION_TYPE_ADD = 'INDICATOR/ADD';
export const INDICATOR_ACTION_TYPE_REMOVE = 'INDICATOR/REMOVE';
export const INDICATOR_ACTION_TYPE_BATCH_REMOVE = 'INDICATOR/BATCH_REMOVE';
export const INDICATOR_ACTION_TYPE_UPDATE = 'INDICATOR/UPDATE';
export const INDICATOR_ACTION_TYPE_REARRANGE = 'INDICATOR/REARRANGE';
// export const INDICATOR_ACTION_TYPE_REARRANGE_TREE = 'INDICATOR/REARRANGE_UPDATE_TREE';

const initialState = []
export default function indicatorReducer(state = initialState, action) {
  switch (action.type) {
    case INDICATOR_ACTION_TYPE_ADD: {
      if (state.length === 0) {
        action.payload.visible_by_default = true
      }
      return [
        ...state,
        action.payload
      ]
    }

    case INDICATOR_ACTION_TYPE_REMOVE: {
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

    case INDICATOR_ACTION_TYPE_BATCH_REMOVE: {
      const newState = []
      let ids = action.payload;
      let foundVisibleByDefault = false;
      state.forEach(function (indicator) {
        if (!ids.includes(indicator.id)) {
          newState.push(indicator)
          if (indicator.visible_by_default) {
            foundVisibleByDefault = true
          }
        }
      })
      if (!foundVisibleByDefault && newState[0]) {
        newState[0].visible_by_default = true
      }
      return newState
    }
    case INDICATOR_ACTION_TYPE_UPDATE: {
      const newState = []
      state.forEach(function (indicator) {
        if (indicator.id === action.payload.id) {
          newState.push(action.payload)
        } else if (indicator.id !== action.payload.id) {
          if (action.payload.visible_by_default) {
            indicator.visible_by_default = false
          }
          newState.push(indicator)
        }
      })
      return newState
    }
    case INDICATOR_ACTION_TYPE_REARRANGE: {
      let newState = []
      for (const [groupName, groupValue] of Object.entries(action.payload)) {
        for (const value of groupValue) {
          state.forEach(function (indicator) {
            if (indicator.id === value.data.id) {
              indicator.order = value.data.order;
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