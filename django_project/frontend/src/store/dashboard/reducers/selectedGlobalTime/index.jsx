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
 * GLOBAL_TIME reducer
 */

export const SELECTED_GLOBAL_TIME_ACTION_NAME = 'GLOBAL_TIME';
export const SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE_MIN_MAX = 'GLOBAL_TIME/CHANGE_MIN_MAX';

const initialState = {
  min: null,
  max: null
}
export default function selectedGlobalTimeReducer(state = initialState, action) {
  if (action.name === SELECTED_GLOBAL_TIME_ACTION_NAME) {
    switch (action.type) {
      case SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE_MIN_MAX: {
        const { min, max } = action.payload
        return {
          min: min,
          max: max
        }
      }
    }
  }
  return state
}