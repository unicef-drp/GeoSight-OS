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
 * INDICATOR reducer
 */

export const GEOMETRIES_VT_ACTION_NAME = 'GEOMETRIES_VT';
export const GEOMETRIES_VT_ACTION_TYPE_ADD = 'GEOMETRIES_VT/ADD';
export const GEOMETRIES_VT_ACTION_TYPE_UPDATE = 'GEOMETRIES_VT/UPDATE';
export const GEOMETRIES_VT_ACTION_TYPE_ADD_LEVEL_DATA = 'GEOMETRIES_VT/ADD_LEVEL_DATA';
export const GEOMETRIES_VT_ACTION_TYPE_DELETE_ALL = 'GEOMETRIES_VT/DELETE_ALL';

const initialState = {}
export default function geometriesVTReducer(state = initialState, action) {
  if (action.name === GEOMETRIES_VT_ACTION_NAME) {
    switch (action.type) {
      case GEOMETRIES_VT_ACTION_TYPE_ADD: {
        const { key, value } = action
        const level = value.level
        if (!state[level] || !state[level][key]) {
          const newState = Object.assign({}, state)
          if (!state[level]) {
            newState[level] = {}
          }
          newState[level][key] = value
          return newState
        }
        return state
      }
      case GEOMETRIES_VT_ACTION_TYPE_ADD_LEVEL_DATA: {
        const { level, data } = action
        if (!state[level]) {
          state[level] = {}
        }
        let updated = false
        for (const [code, geom] of Object.entries(data)) {
          if (!state[level][code]) {
            geom.name = geom.label
            state[level][code] = geom
            updated = true
          }
        }
        if (updated) {
          return Object.assign({}, state)
        }
        return state
      }
      case GEOMETRIES_VT_ACTION_TYPE_UPDATE: {
        const { data } = action
        return { ...data }
      }
      case GEOMETRIES_VT_ACTION_TYPE_DELETE_ALL: {
        return {}
      }
    }
  }
  return state
}