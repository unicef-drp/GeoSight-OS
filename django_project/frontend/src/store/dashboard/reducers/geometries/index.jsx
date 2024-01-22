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

export const GEOMETRIES_ACTION_NAME = 'GEOMETRIES';
export const GEOMETRIES_ACTION_TYPE_ADD = 'GEOMETRIES/ADD';
export const GEOMETRIES_ACTION_TYPE_UPDATE = 'GEOMETRIES/UPDATE';
export const GEOMETRIES_ACTION_TYPE_ADD_LEVEL_DATA = 'GEOMETRIES/ADD_LEVEL_DATA';
export const GEOMETRIES_ACTION_TYPE_DELETE_ALL = 'GEOMETRIES/DELETE_ALL';

const initialState = {}
export default function geometriesReducer(state = initialState, action) {
  if (action.name === GEOMETRIES_ACTION_NAME) {
    switch (action.type) {
      case GEOMETRIES_ACTION_TYPE_ADD: {
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
      case GEOMETRIES_ACTION_TYPE_ADD_LEVEL_DATA: {
        const { level, data } = action
        if (!state[level]) {
          const newState = Object.assign({}, state)
          newState[level] = data
          for (const [code, geom] of Object.entries(data)) {
            geom.parents.map((parent, geomLevel) => {
              if (state[geomLevel] && state[geomLevel][parent.code]) {
                state[geomLevel][parent.code].members.push({
                  name: geom.name,
                  ucode: geom.ucode,
                  code: code,
                })
              }
            })
          }
          return newState
        }
        return state
      }
      case GEOMETRIES_ACTION_TYPE_UPDATE: {
        const { data } = action
        return { ...data }
      }
      case GEOMETRIES_ACTION_TYPE_DELETE_ALL: {
        return {}
      }
    }
  }
  return state
}