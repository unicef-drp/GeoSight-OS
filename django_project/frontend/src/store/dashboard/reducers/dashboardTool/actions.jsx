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
 * __date__ = '30/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import {
  DASHBOARD_TOOL_ACTION_NAME,
  DASHBOARD_TOOL_ACTION_TYPE_UPDATE
} from './index'

/**
 * Update dashboard tool data.
 * @param {object} payload Dashboard data.
 */
export function update(payload) {
  return {
    name: DASHBOARD_TOOL_ACTION_NAME,
    type: DASHBOARD_TOOL_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

export default { update }