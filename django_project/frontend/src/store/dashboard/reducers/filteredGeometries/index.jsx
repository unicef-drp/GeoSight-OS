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
 * FILTERED_GEOMETRIES_ACTION_NAME reducer
 */

export const FILTERED_GEOMETRIES_ACTION_NAME = 'FILTERED_GEOMETRIES';
export const FILTERED_GEOMETRIES_ACTION_TYPE_UPDATE = 'FILTERED_GEOMETRIES/UPDATE';

const initialState = null
export default function filteredGeometriesReducer(state = initialState, action) {
  if (action.name === FILTERED_GEOMETRIES_ACTION_NAME) {
    switch (action.type) {
      case FILTERED_GEOMETRIES_ACTION_TYPE_UPDATE: {
        if (action.payload) {
          try {
            if (JSON.stringify(state) !== JSON.stringify(action.payload)) {
              return action.payload
            } else {
              return state
            }
          } catch (err) {
            return action.payload
          }
        } else {
          return null
        }
      }
    }
  }
  return state
}