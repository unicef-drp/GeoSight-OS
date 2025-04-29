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
 * __date__ = '29/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { isDashboardDataSame } from "../../../../utils/dashboard";

export const STATE = 'DASHBOARD_HISTORY_STATE';
export const STATE_ADD = STATE + '/ADD';
export const STATE_APPLY_HISTORY = STATE + '/APPLY';
export const STATE_APPLY_CHECKPOINT = STATE + '/APPLY_CHECKPOINT';


export interface DashboardHistory {
  page: string;
  history: any;
}

export interface Props {
  checkpoint: number;
  currentIdx: number;
  histories: DashboardHistory[];
}

export interface AddActionProps {
  name: string;
  type: string;
  page: string;
  history: any;
}

export interface ApplyActionProps {
  name: string;
  type: string;
  index: number;
}

const initialState: Props = {
  checkpoint: 0,
  currentIdx: -1,
  histories: []
}
export default function dashboardHistoryReducer(
  state = initialState, action: AddActionProps | ApplyActionProps
) {
  if (action.name === STATE) {
    switch (action.type) {
      case STATE_ADD: {
        const { page, history } = action as AddActionProps;
        const { currentIdx, histories } = state;
        if (histories[currentIdx]) {
          const { history: currentHistory } = histories[currentIdx]
          if (isDashboardDataSame(currentHistory, history)) {
            return state
          }
        }

        const newHistories = histories.slice(0, currentIdx + 1);
        newHistories.push({ page, history })
        return {
          ...state,
          currentIdx: newHistories.length - 1,
          histories: newHistories
        }
      }
      case STATE_APPLY_HISTORY:
        const { index } = action as ApplyActionProps;
        return {
          ...state,
          currentIdx: index
        }
      case STATE_APPLY_CHECKPOINT:
        return {
          ...state,
          checkpoint: state.currentIdx
        }
    }
  }
  return state
}