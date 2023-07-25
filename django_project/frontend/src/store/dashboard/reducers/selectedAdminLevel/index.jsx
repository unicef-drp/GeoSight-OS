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
 * SELECTED_ADMIN_LEVEL reducer
 */

export const SELECTED_ADMIN_LEVEL_NAME = 'SELECTED_ADMIN_LEVEL';
export const SELECTED_ADMIN_LEVEL_ACTION_TYPE_CHANGE = 'SELECTED_ADMIN_LEVEL/ADD';

const initialState = {}
export default function selectedAdminLevelReducer(state = initialState, action) {
  if (action.name === SELECTED_ADMIN_LEVEL_NAME) {
    switch (action.type) {
      case SELECTED_ADMIN_LEVEL_ACTION_TYPE_CHANGE: {
        return {
          ...action.payload
        }
      }
    }
  }
  return state
}