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

import { REFERENCE_LAYER_DATA_ACTION_NAME } from './index'
import { axiosGet, headers } from "../../../../utils/georepo";
import $ from "jquery";

const REQUEST_REFERENCE_LAYER_DATA = 'REQUEST/' + REFERENCE_LAYER_DATA_ACTION_NAME;
const RECEIVE_REFERENCE_LAYER_DATA = 'RECEIVE/' + REFERENCE_LAYER_DATA_ACTION_NAME;

function request(id) {
  return {
    id: id,
    name: REFERENCE_LAYER_DATA_ACTION_NAME,
    type: REQUEST_REFERENCE_LAYER_DATA
  };
}

function receive(data, error, id) {
  return {
    id: id,
    name: REFERENCE_LAYER_DATA_ACTION_NAME,
    type: RECEIVE_REFERENCE_LAYER_DATA,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function fetch(dispatch, id, url) {
  axiosGet(url).then(response => {
    dispatch(
      receive(response.data, null, id)
    )
  }).catch(err => {
    headers.headers = preferences.georepo_api.public_headers
    preferences.georepo_api.headers = preferences.georepo_api.public_headers
    preferences.georepo_api.api_key = preferences.georepo_api.api_key_public.api_key
    preferences.georepo_api.api_key_email = preferences.georepo_api.api_key_public.email
    preferences.georepo_api.api_key_not_working = true
    $('#GeorepoApiKeyBtnUpdate').removeClass('Hidden')
    // We use public key
    axiosGet(url).then(response => {
      dispatch(
        receive(response.data, null, id)
      )
    }).catch(err => {
      dispatch(
        receive(null, err, id)
      )
    });
  });
  return request(id);
}

export default { request, receive, fetch }