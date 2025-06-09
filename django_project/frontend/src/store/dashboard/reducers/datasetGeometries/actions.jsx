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
  DATASET_GEOMETRIES_ACTION_TYPE_REPLACE_DATA
} from './index';

/**
 * Replace data.
 * @param {str} datasetIdentifier Dataset identifier.
 * @param {object} data Data by level
 */
export function replaceData(datasetIdentifier, data) {
  return {
    name: DATASET_GEOMETRIES_ACTION_NAME,
    type: DATASET_GEOMETRIES_ACTION_TYPE_REPLACE_DATA,
    datasetIdentifier: datasetIdentifier,
    data: data
  };
}


export default {
  replaceData
}