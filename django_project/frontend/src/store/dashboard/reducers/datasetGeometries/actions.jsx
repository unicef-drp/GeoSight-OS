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

import {
  DATASET_GEOMETRIES_ACTION_NAME,
  DATASET_GEOMETRIES_ACTION_TYPE_ADD_LEVEL_DATA
} from './index';


/**
 * Add level data.
 * @param {str} datasetIdentifier Dataset identifier.
 * @param {int} level Level of data.
 * @param {object} data Value data.
 */
export function addLevelData(datasetIdentifier, level, data) {
  return {
    name: DATASET_GEOMETRIES_ACTION_NAME,
    type: DATASET_GEOMETRIES_ACTION_TYPE_ADD_LEVEL_DATA,
    datasetIdentifier: datasetIdentifier,
    level: level,
    data: data
  };
}


export default {
  addLevelData
}