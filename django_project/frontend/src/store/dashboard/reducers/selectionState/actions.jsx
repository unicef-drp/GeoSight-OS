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
 * __date__ = '22/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import {
  SELECTION_STATE,
  SELECTION_STATE_FILTER_ADD_INDICATOR,
  SELECTION_STATE_FILTER_ADD_INDICATOR_LAYER,
  SELECTION_STATE_FILTER_ADD_RELATED_TABLE,
  SELECTION_STATE_FILTER_REMOVE_INDICATOR,
  SELECTION_STATE_FILTER_REMOVE_INDICATOR_LAYER,
  SELECTION_STATE_FILTER_REMOVE_RELATED_TABLE
} from './index'

/** Add indicator of filter.
 * @param {number} payload id.
 */
export function filterAddIndicator(payload) {
  return {
    name: SELECTION_STATE,
    type: SELECTION_STATE_FILTER_ADD_INDICATOR,
    payload: payload
  };
}

/** Remove indicator of filter.
 * @param {number} payload id.
 */
export function filterRemoveIndicator(payload) {
  return {
    name: SELECTION_STATE,
    type: SELECTION_STATE_FILTER_REMOVE_INDICATOR,
    payload: payload
  };
}

/** Add indicator layer of filter.
 * @param {number} payload id.
 */
export function filterAddIndicatorLayer(payload) {
  return {
    name: SELECTION_STATE,
    type: SELECTION_STATE_FILTER_ADD_INDICATOR_LAYER,
    payload: payload
  };
}

/** Remove indicator layer of filter.
 * @param {number} payload id.
 */
export function filterRemoveIndicatorLayer(payload) {
  return {
    name: SELECTION_STATE,
    type: SELECTION_STATE_FILTER_REMOVE_INDICATOR_LAYER,
    payload: payload
  };
}

/** Add related table of filter.
 * @param {number} payload id.
 */
export function filterAddRelatedTable(payload) {
  return {
    name: SELECTION_STATE,
    type: SELECTION_STATE_FILTER_ADD_RELATED_TABLE,
    payload: payload
  };
}

/** Remove related table of filter.
 * @param {number} payload id.
 */
export function filterRemoveRelatedTable(payload) {
  return {
    name: SELECTION_STATE,
    type: SELECTION_STATE_FILTER_REMOVE_RELATED_TABLE,
    payload: payload
  };
}

export default {
  filterAddIndicator,
  filterRemoveIndicator,
  filterAddIndicatorLayer,
  filterRemoveIndicatorLayer,
  filterAddRelatedTable,
  filterRemoveRelatedTable
}