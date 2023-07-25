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
 * SELECTED_INDICATOR reducer
 */

export const SELECTED_BOOKMARK_NAME = 'BOOKMARK';
export const SELECTED_BOOKMARK_TYPE_CHANGE = 'BOOKMARK/ADD';

const initialState = {
  id: 0,
  name: 'Default'
}
export default function selectedBookmarkReducer(state = initialState, action) {
  if (action.name === SELECTED_BOOKMARK_NAME) {
    switch (action.type) {
      case SELECTED_BOOKMARK_TYPE_CHANGE: {
        return action.payload
      }
    }
  }
  return state
}