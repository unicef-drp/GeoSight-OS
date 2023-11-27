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

export const INDICATOR_METADATA_ACTION_NAME = 'INDICATOR_METADATA';
export const INDICATOR_METADATA_TYPE_PROGRESS = 'INDICATOR_METADATA/PROGRESS';

const initialState = {}
export default function IndicatorsAllDataReducer(state = initialState, action) {
  if (action.name === INDICATOR_METADATA_ACTION_NAME) {
    switch (action.type) {
      case INDICATOR_METADATA_TYPE_PROGRESS: {
        const { id, data } = action
        if (!state[id]) {
          state[id] = {}
        }
        state[id].progress = data
        return { ...state }
      }
      default:
        return state
    }
  }
  return state
}