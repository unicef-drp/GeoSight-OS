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

import { ACTION_NAME } from "./index";
import { axiosGet } from "../../../../utils/georepo";

const REQUEST = "REQUEST/" + ACTION_NAME;
const RECEIVE = "RECEIVE/" + ACTION_NAME;

function request(id) {
  return {
    name: ACTION_NAME,
    type: REQUEST,
  };
}

function receive(data, error) {
  return {
    name: ACTION_NAME,
    type: RECEIVE,
    data,
    error,
    receivedAt: Date.now(),
  };
}

export function fetch(dispatch) {
  axiosGet("/api/color/palette/list")
    .then((response) => {
      dispatch(receive(response.data, null));
    })
    .catch((err) => {
      dispatch(receive(null, err));
    });
  return request();
}

export default { request, receive, fetch };
