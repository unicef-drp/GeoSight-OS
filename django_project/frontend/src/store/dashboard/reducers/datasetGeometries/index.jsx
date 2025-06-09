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
export const DATASET_GEOMETRIES_ACTION_TYPE_REPLACE_DATA = 'DATASET_GEOMETRIES/REPLACE_DATA';

const initialState = {}
export default function datasetGeometriesReducer(state = initialState, action) {
  if (action.name === DATASET_GEOMETRIES_ACTION_NAME) {
    switch (action.type) {
      case DATASET_GEOMETRIES_ACTION_TYPE_REPLACE_DATA: {
        const { datasetIdentifier, data } = action
        if (!state[datasetIdentifier]) {
          state[datasetIdentifier] = {}
        }
        if (
          JSON.stringify(Object.keys(state[datasetIdentifier])) !==
          JSON.stringify(Object.keys(data))
        ) {
          state[datasetIdentifier] = data
          return { ...state }
        }
        return state
      }
    }
  }
  return state
}