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


import {
  STATE,
  STATE_ADD,
  STATE_APPLY_CHECKPOINT,
  STATE_APPLY_HISTORY
} from "./index";

/** Add history */
export function addHistory(page: string, history: any) {
  return {
    name: STATE,
    type: STATE_ADD,
    page: page,
    history: history
  };
}

/** Apply history */
export function applyHistory(index: number) {
  return {
    name: STATE,
    type: STATE_APPLY_HISTORY,
    index: index
  };
}

/** Apply checkpoint */
export function applyCheckpoint() {
  return {
    name: STATE,
    type: STATE_APPLY_CHECKPOINT
  };
}

export default {
  addHistory, applyHistory, applyCheckpoint
}