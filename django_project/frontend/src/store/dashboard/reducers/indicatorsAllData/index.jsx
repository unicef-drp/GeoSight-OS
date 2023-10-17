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

export const INDICATORS_ALL_DATA_ACTION_NAME = 'INDICATORS_ALL_DATA';
export const INDICATORS_ALL_DATA_TYPE_ADD_COUNT = 'INDICATORS_ALL_DATA/ADD_COUNT';
export const INDICATORS_ALL_DATA_TYPE_ADD_DATA = 'INDICATORS_ALL_DATA/ADD_DATA';

const initialState = {}
export default function IndicatorsAllDataReducer(state = initialState, action) {
  switch (action.type) {
    case INDICATORS_ALL_DATA_TYPE_ADD_COUNT: {
      const { id, count } = action.payload
      state[id] = { 'count': count }
      return { ...state }
    }
    case INDICATORS_ALL_DATA_TYPE_ADD_DATA: {
      const { id, data } = action.payload
      state[id].data = data
      return { ...state }
    }
    default:
      return state
  }
}