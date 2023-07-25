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
 * SELECTED_INDICATOR_LAYER_SECOND reducer
 */

export const SELECTED_RELATED_TABLE_LAYER_NAME = 'SELECTED_RELATED_TABLE_LAYER';
export const SELECTED_RELATED_TABLE_LAYER_ACTION_TYPE_CHANGE = 'SELECTED_RELATED_TABLE_LAYER/CHANGE';

const initialState = null
export default function selectedRelatedTableLayerReducer(state = initialState, action) {
  if (action.name === SELECTED_RELATED_TABLE_LAYER_NAME) {
    switch (action.type) {
      case SELECTED_RELATED_TABLE_LAYER_ACTION_TYPE_CHANGE: {
        return action.payload
      }
    }
  }
  return state
}