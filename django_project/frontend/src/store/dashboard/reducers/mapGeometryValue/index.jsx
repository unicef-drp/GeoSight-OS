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
 * MAP_GEOMETRY_VALUE reducer
 */

export const MAP_GEOMETRY_VALUE_ACTION_NAME = 'MAP_GEOMETRY_VALUE';
export const MAP_GEOMETRY_VALUE_ACTION_UPDATE = 'MAP_GEOMETRY_VALUE/UPDATE';

const initialState = {}
export default function mapGeometryValueReducer(state = initialState, action) {
  if (action.name === MAP_GEOMETRY_VALUE_ACTION_NAME) {
    switch (action.type) {
      case MAP_GEOMETRY_VALUE_ACTION_UPDATE: {
        return { ...action.values }
      }
    }
  }
  return state
}