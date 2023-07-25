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
 * REFERENCE LAYER reducer
 */
export const REFERENCE_LAYER_DATA_ACTION_NAME = 'REFERENCE_LAYER_DATA';

const initialState = {}
export default function ReferenceLayerReducer(state = initialState, action) {
  if (action.name === REFERENCE_LAYER_DATA_ACTION_NAME) {
    switch (action.type) {
      default: {
        const data = APIReducer(state, action, REFERENCE_LAYER_DATA_ACTION_NAME)
        const { id } = action
        const newState = {
          ...state,
        }
        newState[id] = data
        return newState
      }
    }
  }
  return state
}