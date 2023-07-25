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

/**
 * Base reducer for an api request.
 *
 * @param {object} state The state.
 * @param {object} action The action.
 * @param {string} actionName The action name to use as suffix.
 * @param defaultData Default data.
 */
export function APIReducer(state, action, actionName, defaultData) {
  switch (action.type) {
    case `REQUEST/${actionName}`:
      return {
        fetching: true,
        fetched: false,
        data: defaultData ? defaultData : {},
        error: null
      };
    case `RECEIVE/${actionName}`:
      let newState = {
        fetching: false,
        fetched: true,
        receivedAt: action.receivedAt,
        data: null,
        error: null
      };

      if (action.error) {
        newState.error = action.error;
      } else {
        newState.data = action.data;
      }
      return newState;
  }
  return state;
}
