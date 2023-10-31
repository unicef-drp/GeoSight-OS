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
 * __date__ = '17/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import {
  INDICATOR_LAYER_METADATA_ACTION_NAME,
  INDICATOR_LAYER_METADATA_TYPE_UPDATE,
  INDICATOR_LAYER_METADATA_TYPE_UPDATE_BATCH,
  INDICATOR_LAYER_METADATA_TYPE_UPDATE_DATES,
} from './index'

/**
 * Update metadata of indicator layer
 */
function update(id, data) {
  return {
    name: INDICATOR_LAYER_METADATA_ACTION_NAME,
    type: INDICATOR_LAYER_METADATA_TYPE_UPDATE,
    payload: {
      id: id,
      data: data
    }
  };
}

/**
 * Add dates of indicator data
 */
function updateDates(id, dates) {
  return {
    name: INDICATOR_LAYER_METADATA_ACTION_NAME,
    type: INDICATOR_LAYER_METADATA_TYPE_UPDATE_DATES,
    payload: {
      id: id,
      dates: dates
    }
  };
}

/**
 * Add dates.
 * @param {object} data Data.
 */
export function updateBatch(data) {
  return {
    name: INDICATOR_LAYER_METADATA_ACTION_NAME,
    type: INDICATOR_LAYER_METADATA_TYPE_UPDATE_BATCH,
    data: data
  };
}

export default {
  update, updateBatch, updateDates
}