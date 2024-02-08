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
 * __date__ = '17/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/**
 * INDICATORS_DATA reducer
 */

export const INDICATOR_LAYER_METADATA_ACTION_NAME = 'INDICATOR_LAYER_METADATA';
export const INDICATOR_LAYER_METADATA_TYPE_UPDATE = 'INDICATOR_LAYER_METADATA/UPDATE';
export const INDICATOR_LAYER_METADATA_TYPE_UPDATE_BATCH = 'INDICATOR_LAYER_METADATA/UPDATE_BATCH';
export const INDICATOR_LAYER_METADATA_TYPE_UPDATE_DATES = 'INDICATOR_LAYER_METADATA/UPDATE_DATES';

const initialState = {}
export default function IndicatorsAllDataReducer(state = initialState, action) {
  switch (action.type) {
    case INDICATOR_LAYER_METADATA_TYPE_UPDATE: {
      const { id, data } = action.payload
      if (!state[id] || (state[id] && JSON.stringify(state[id]) !== JSON.stringify(data))) {
        state[id] = data
        return { ...state }
      }
      return state
    }
    case INDICATOR_LAYER_METADATA_TYPE_UPDATE_DATES: {
      const { id, dates } = action.payload
      if (!state[id]) {
        state[id] = {}
      }
      state[id].dates = dates
      return { ...state }
    }
    case INDICATOR_LAYER_METADATA_TYPE_UPDATE_BATCH: {
      const { data } = action
      return { ...state, ...data }
    }
    default:
      return state
  }
}