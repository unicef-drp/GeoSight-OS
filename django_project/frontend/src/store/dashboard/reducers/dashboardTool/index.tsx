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
  ZonalAnalysisDashboardConfiguration
} from "../../../../components/ZonalAnalysisTool/index.d";

/**
 * Dashboard tools reducer
 */


export const DASHBOARD_TOOL_ACTION_NAME = 'DASHBOARD_TOOL';
export const DASHBOARD_TOOL_ACTION_TYPE_UPDATE = 'DASHBOARD_TOOL/UPDATE';

export interface DashboardTool {
  id: string;
  name: string;
  visible_by_default: boolean;
  config: ZonalAnalysisDashboardConfiguration | null;
}

export type DashboardToolState = DashboardTool[];

export interface DashboardToolAction {
  name: string;
  type: string;
  payload: Partial<DashboardTool>; // Payload should match the structure of a dashboard tool
}

const initialState: DashboardToolState = [];
export default function dashboardToolReducer(
  state: DashboardToolState = initialState,
  action: DashboardToolAction
): DashboardToolState {
  if (action.name === DASHBOARD_TOOL_ACTION_NAME) {
    switch (action.type) {
      case DASHBOARD_TOOL_ACTION_TYPE_UPDATE: {
        const dashboardTools: DashboardToolState = [];
        state.forEach((dashboardTool) => {
          if (dashboardTool.id === action.payload.id) {
            dashboardTools.push({ ...dashboardTool, ...action.payload }); // Update the tool
          } else {
            dashboardTools.push(dashboardTool); // Keep existing tools
          }
        });
        return dashboardTools;
      }
      default:
        return state;
    }
  }
  return state;
}