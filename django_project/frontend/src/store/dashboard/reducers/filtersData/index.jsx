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
 * FILTERS reducer
 */

export const FILTERS_QUERY_ACTION_NAME = 'FILTERS_QUERY';
export const FILTERS_QUERY_ACTION_UPDATE = 'FILTERS_QUERY/UPDATE';

const initialState = null
export default function filtersDataReducer(state = initialState, action) {
  if (action.name === FILTERS_QUERY_ACTION_NAME) {
    switch (action.type) {
      case FILTERS_QUERY_ACTION_UPDATE:
        if (action.payload) {
          return {...action.payload}
        }
        break;
      default:
        return state
    }
  }
  return state
}