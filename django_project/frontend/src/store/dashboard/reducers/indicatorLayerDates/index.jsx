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
 * __date__ = '28/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/**
 * INDICATORS_DATA reducer
 */

export const INDICATOR_LAYER_DATES_ACTION_NAME = 'INDICATOR_LAYER_DATES';
export const INDICATOR_LAYER_DATES_ACTION_TYPE_ADD = 'INDICATOR_LAYER_DATES/ADD';
export const INDICATOR_LAYER_DATES_ACTION_TYPE_ADD_BATCH = 'INDICATOR_LAYER_DATES/ADD_BATCH';

const initialState = {}
export default function indicatorLayerDatesReducer(state = initialState, action) {
  if (action.name === INDICATOR_LAYER_DATES_ACTION_NAME) {
    switch (action.type) {
      case INDICATOR_LAYER_DATES_ACTION_TYPE_ADD: {
        const { id, dates } = action
        state[id] = dates
        return { ...state }
      }
      case INDICATOR_LAYER_DATES_ACTION_TYPE_ADD_BATCH: {
        const { data } = action
        return { ...state, ...data }
      }
    }
  }
  return state
}