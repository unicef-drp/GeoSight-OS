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

/**
 * RELATED TABLE reducer
 */


export const DASHBOARD_TOOL_ACTION_NAME = 'DASHBOARD_TOOL';
export const DASHBOARD_TOOL_ACTION_TYPE_UPDATE = 'DASHBOARD_TOOL/UPDATE';

const initialState = []
export default function dashboardToolReducer(state = initialState, action) {
  if (action.name === DASHBOARD_TOOL_ACTION_NAME) {
    switch (action.type) {
      case DASHBOARD_TOOL_ACTION_TYPE_UPDATE: {
        const dashboardTools = []
        state.forEach(function (dashboardTool) {
          if (dashboardTool.id === action.payload.id) {
            dashboardTools.push(action.payload)
          } else {
            dashboardTools.push(dashboardTool)
          }
        })
        return dashboardTools
      }
      default:
        return state
    }
  }
}