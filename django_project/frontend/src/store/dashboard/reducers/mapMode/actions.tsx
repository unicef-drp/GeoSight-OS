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

import {
  MAP_MODE_ACTION_NAME,
  MAP_MODE_ACTION_TYPE_COMPARE,
  MAP_MODE_ACTION_TYPE_COMPOSITE,
} from "./index";

/**
 * Change compare mode.
 */
export function changeCompareMode() {
  return {
    name: MAP_MODE_ACTION_NAME,
    type: MAP_MODE_ACTION_TYPE_COMPARE,
  };
}

/**
 * Change compare mode.
 */
export function activateCompare() {
  return {
    name: MAP_MODE_ACTION_NAME,
    type: MAP_MODE_ACTION_TYPE_COMPARE,
    value: true,
  };
}

/**
 * Change compare mode.
 */
export function deactivateCompare() {
  return {
    name: MAP_MODE_ACTION_NAME,
    type: MAP_MODE_ACTION_TYPE_COMPARE,
    value: false,
  };
}

/**Toggle composite mode.*/
export function toggleCompositeMode() {
  return {
    name: MAP_MODE_ACTION_NAME,
    type: MAP_MODE_ACTION_TYPE_COMPOSITE,
  };
}

export default {
  changeCompareMode,
  activateCompare,
  deactivateCompare,
  toggleCompositeMode,
};
