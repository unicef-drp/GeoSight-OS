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

import axios from "axios";

/**
 * Perform Fetching Data
 *
 * @param {string} url Url to query
 * @param {object} options Options of request
 * @param {object} params Params
 * @param {Function} receiveAction Function on receiving data
 * @param {boolean} useCache Force to use cache or not
 */
export const fetchingData = async function (
  url, params, options,
  receiveAction, useCache = true
) {
  if (params && Object.keys(params).length) {
    const paramsUrl = [];
    for (const [key, value] of Object.entries(params)) {
      paramsUrl.push(`${key}=${value}`)
    }
    url += '?' + paramsUrl.join('&')
  }
  try {
    const response = await fetchJSON(url, options, useCache);
    receiveAction(response, null);
  } catch (error) {
    receiveAction(null, error);
  }
};

/**
 * Perform request to fetch json
 *
 * @param {string} url Url to query
 * @param {object} options Options for fetch
 */
// TODO:
//  Make cache in elegant way
const responseCaches = {}

export function deleteUrlCache(url) {
  delete responseCaches[url]
}

export async function fetchJSON(url, options, useCache = true) {
  if (!useCache) {
    responseCaches[url] = null
  }
  if (!responseCaches[url]) {
    try {
      const response = await fetch(url, options);
      let json = null;
      try {
        json = await response.json();
      } catch (error) {
        json = {
          message: response.status + ' ' + response.statusText,
          detail: response.status + ' ' + response.statusText
        }
      }
      if (response.status >= 400) {
        const err = new Error(json.message ? json.message : json.detail);
        err.data = json;
        throw err;
      }
      responseCaches[url] = json;
      return json;
    } catch (error) {
      throw error;
    }
  } else {
    return responseCaches[url]
  }
}

/**
 * Perform Pushing Data
 *
 * @param {string} url Url to query
 * @param {object} data Data to be pushed
 * @param {Function} receiveAction Function on receiving data
 */
export const postData = async function (
  url, data, receiveAction
) {
  try {
    const response = await postJSON(url, data);
    receiveAction(response, null);
  } catch (error) {
    receiveAction(null, error);
  }
};

/**
 * Post JSON Data
 *
 * @param {string} url Url to query
 * @param {object} data Data to be pushed
 */
export async function postJSON(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfmiddlewaretoken
      },
      body: data
    }).then(function (response) {
      if (response < 400) {
        return response;
      } else {
        if (response.status === 400) {
          return response.text();
        } else {
          return response
        }
      }
    }).then(function (response) {
      return response
    });

    if (!response.status) {
      const err = new Error(response);
      err.data = response;
      throw err;
    }

    if (response.status >= 400) {
      const err = new Error(response.statusText);
      err.data = response;
      throw err;
    }
    return response;
  } catch (error) {
    throw error;
  }
}

/***
 * Request using cache
 */
export const CacheRequests = {

  /*** Get request */
  async get(url, data, config) {
    if (!responseCaches[url]) {
      const response = await axios.get(url, data, config)
      const responseData = response.data
      responseCaches[url] = responseData
      return responseData
    } else {
      return responseCaches[url];
    }
  },

  /*** POST request */
  async post(url, data, config) {
    return axios.post(url, data, config)
  }
}