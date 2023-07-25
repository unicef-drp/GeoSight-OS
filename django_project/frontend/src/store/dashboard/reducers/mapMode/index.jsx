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
 * MAP_MODE reducer
 */

export const MAP_MODE_ACTION_NAME = 'MAP_MODE';
export const MAP_MODE_ACTION_TYPE_COMPARE_CHANGE = 'MAP_MODE/COMPARE_CHANGE';

const initialState = {
  compareMode: false
}
export default function mapCompareModeReducer(state = initialState, action) {
  if (action.name === MAP_MODE_ACTION_NAME) {
    switch (action.type) {
      case MAP_MODE_ACTION_TYPE_COMPARE_CHANGE: {
        return {
          ...state,
          compareMode: !state.compareMode
        }
      }
    }
  }
  return state
}