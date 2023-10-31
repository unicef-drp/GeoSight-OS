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
  INDICATORS_DATA_ACTION_NAME,
  INDICATORS_DATA_ACTION_TYPE_PROGRESS
} from './index'
import { fetchingData } from "../../../../Requests";

/**
 * Requests data.
 * @param {object} id indicator ID.
 * @param {object} payload indicator.
 */
export const REQUEST_INDICATOR = 'REQUEST/' + INDICATORS_DATA_ACTION_NAME;
export const RECEIVE_INDICATOR = 'RECEIVE/' + INDICATORS_DATA_ACTION_NAME;

function request(id) {
  return {
    id: id,
    name: INDICATORS_DATA_ACTION_NAME,
    type: REQUEST_INDICATOR
  };
}

function progress(id, progress) {
  return {
    id: id,
    progress: progress,
    name: INDICATORS_DATA_ACTION_NAME,
    type: INDICATORS_DATA_ACTION_TYPE_PROGRESS
  };
}

function receive(data, error, id) {
  return {
    id: id,
    name: INDICATORS_DATA_ACTION_NAME,
    type: RECEIVE_INDICATOR,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function fetch(dispatch, id, url) {
  fetchingData(
    url, {}, {}, function (response, error) {
      dispatch(
        receive(response, error, id)
      )
    }
  )
  return request(id);
}

export default {
  fetch, request, receive, progress
}