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
 * __date__ = '06/05/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/**
 * INDICATOR reducer
 */

export const DATASET_GEOMETRIES_ACTION_NAME = 'DATASET_GEOMETRIES';
export const DATASET_GEOMETRIES_ACTION_TYPE_ADD_LEVEL_DATA = 'DATASET_GEOMETRIES/ADD_LEVEL_DATA';

const initialState = {}
export default function datasetGeometriesReducer(state = initialState, action) {
  if (action.name === DATASET_GEOMETRIES_ACTION_NAME) {
    switch (action.type) {
      case DATASET_GEOMETRIES_ACTION_TYPE_ADD_LEVEL_DATA: {
        const { datasetIdentifier, level, data } = action
        if (!state[datasetIdentifier]) {
          state[datasetIdentifier] = {}
        }
        if (!state[datasetIdentifier][level]) {
          const newState = Object.assign({}, state[datasetIdentifier])
          newState[level] = data
          for (const [code, geom] of Object.entries(data)) {
            geom.parents.map((parent, geomLevel) => {
              if (newState[geomLevel] && newState[geomLevel][parent.code]) {
                newState[geomLevel][parent.code].members.push({
                  name: geom.name,
                  ucode: geom.ucode,
                  code: code,
                })
              }
            })
          }
          state[datasetIdentifier] = newState
          return { ...state }
        }
        return state
      }
    }
  }
  return state
}