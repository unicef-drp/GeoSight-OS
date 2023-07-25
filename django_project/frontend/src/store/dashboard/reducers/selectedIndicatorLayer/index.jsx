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
 * SELECTED_INDICATOR_LAYER reducer
 */

export const SELECTED_INDICATOR_LAYER_NAME = 'SELECTED_INDICATOR_LAYER';
export const SELECTED_INDICATOR_LAYER_ACTION_TYPE_CHANGE = 'SELECTED_INDICATOR_LAYER/ADD';

const initialState = {}
export default function selectedIndicatorLayerReducer(state = initialState, action) {
  if (action.name === SELECTED_INDICATOR_LAYER_NAME) {
    switch (action.type) {
      case SELECTED_INDICATOR_LAYER_ACTION_TYPE_CHANGE: {
        return {
          ...action.payload
        }
      }
    }
  }
  return state
}