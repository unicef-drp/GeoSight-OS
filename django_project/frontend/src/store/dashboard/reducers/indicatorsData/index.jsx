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

import { APIReducer } from "../../../reducers_api";

/**
 * INDICATORS_DATA reducer
 */

export const INDICATORS_DATA_ACTION_NAME = 'INDICATORS_DATA';

const initialState = {}
export default function IndicatorsDataReducer(state = initialState, action) {
  if (action.name === INDICATORS_DATA_ACTION_NAME) {
    switch (action.type) {
      default: {
        const data = APIReducer(state, action, INDICATORS_DATA_ACTION_NAME, [])
        const { id } = action
        if (Object.keys(data).length !== 0) {
          data.id = id;
          const newState = {
            ...state,
          }
          newState[id] = data
          return newState
        }
      }
    }
  }
  return state
}