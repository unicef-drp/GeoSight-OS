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
import { Session } from "./utils/Sessions";

/** Check if we use post or get */
const isPost = function (data) {
  try {
    if (data instanceof FormData) {
      return true
    }
    const keys = Object.keys(JSON.parse(JSON.stringify(data)))
    if (!keys.length) {
      return false
    }
  } catch (err) {

  }
  return true
}

export const constructUrl = function (url, params) {
  if (params && Object.keys(params).length) {
    const paramsUrl = [];
    for (const [key, value] of Object.entries(params)) {
      if ([null, undefined].includes(value)) {
        continue
      }
      if (Array.isArray(value) && !value.length) {
        continue
      }
      paramsUrl.push(`${key}=${value}`)
    }
    if (!url) {
      return url
    }
    if (url.includes('?')) {
      url += '&' + paramsUrl.join('&')
    } else {
      url += '?' + paramsUrl.join('&')
    }
  }
  return url
}
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
  url = constructUrl(url, params)
  try {
    let response = await fetchJSON(url, options, useCache);
    try {
      if (Object.keys(response).includes('results')) {
        response = await fetchPaginationAsync(url)
      }
    } catch (err) {

    }
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

/*** Axios georepo request with cache */
export const fetchPaginationAsync = async function (url, onProgress) {
  let data = []
  const _fetchJson = async function (currUrl) {
    // Force to use https
    if (location.protocol === 'https:') {
      currUrl = currUrl.replace('http:', location.protocol)
    }
    const response = await fetchJSON(currUrl, {});
    if (onProgress) {
      onProgress({
        page: response.page,
        total_page: response.total_page,
      })
    }
    if (response.results) {
      data = data.concat(response.results)
    }
    if (response.next) {
      await _fetchJson(response.next)
    }
  }
  await _fetchJson(url)
  return data
}

/*** Axios georepo request with cache */
export const fetchPagination = function (url, params, onProgress) {
  url = constructUrl(url, params)
  return new Promise((resolve, reject) => {
    (
      async () => {
        try {
          resolve(await fetchPaginationAsync(url, onProgress))
        } catch (error) {
          reject(error)
        }
      }
    )()
  });
}

/*** Axios georepo request with cache */
export const fetchPaginationInParallel = async function (url, params, onProgress) {
  url = constructUrl(url, params)
  let data = []
  let doneCount = 0
  // First data
  const response = await fetchJSON(url, {});
  const nextUrl = response.next;
  data = data.concat(response.results)
  doneCount += 1
  if (onProgress) {
    onProgress({
      page: doneCount,
      total_page: response.total_page,
    })
  }
  if (response.next) {
    // Call function for other page
    const call = async (page) => {
      const response = await fetchJSON(nextUrl.replace('page=2', `page=${page}`), {});
      doneCount += 1
      if (onProgress) {
        onProgress({
          page: doneCount,
          total_page: response.total_page,
        })
      }
      data = data.concat(response.results)
    }
    await Promise.all(Array(response.total_page - 1).fill(0).map((_, idx) => call(idx + 2)))
  }
  return data
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
    const response = await postDataBody(url, data);
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
export async function postDataBody(url, data) {
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

/**
 * Post JSON Data
 *
 * @param {string} url Url to query
 * @param {object} data Data to be pushed
 */
export async function postJSON(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfmiddlewaretoken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
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
  return json;
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

/***
 * Request using cache
 */
export const DjangoRequests = {
  get: (url, options = {}, params = null) => {
    if (params) {
      url = constructUrl(url, params)
    }
    return axios.get(url, {
      ...options,
      headers: {
        'X-CSRFToken': csrfmiddlewaretoken
      }
    })
  },
  post: (url, data, options = {}, params = null, alterRequest = false) => {
    let urlRequest = url
    if (params) {
      urlRequest = constructUrl(url, { ...params })
    }
    if (!alterRequest || isPost(data)) {
      return axios.post(
        urlRequest,
        data,
        {
          ...options,
          headers: {
            'X-CSRFToken': csrfmiddlewaretoken
          }
        })
    } else {
      return axios.get(
        urlRequest,
        {
          ...options,
          headers: {
            'X-CSRFToken': csrfmiddlewaretoken
          }
        })
    }
  },
  put: (url, data, options = {}, headers = {}) => {
    return axios.put(url, data, {
      ...options,
      headers: {
        'X-CSRFToken': csrfmiddlewaretoken,
        ...headers
      }
    })
  },
  delete: (url, data, options = {}) => {
    return axios.delete(url, {
      headers: { 'X-CSRFToken': csrfmiddlewaretoken }, data: data
    })
  }
}

export const DjangoRequestPagination = {
  parallel: async (url, requestFunction, onProgress) => {
    let data = []
    let doneCount = 0
    /** Request first data **/
    const response = await requestFunction(1)
    data = data.concat(response.results)
    doneCount += 1
    if (onProgress) {
      onProgress({
        page: doneCount,
        total_page: response.total_page,
      })
    }

    /** Call next request **/
    if (response.next) {
      const call = async (page) => {
        const response = await requestFunction(page)
        doneCount += 1
        if (onProgress) {
          onProgress({
            page: doneCount,
            total_page: response.total_page,
          })
        }
        data = data.concat(response.results)
      }
      await Promise.all(Array(response.total_page - 1).fill(0).map((_, idx) => call(idx + 2)))
    }
    return data
  },
  get: async (url, options = {}, params = null, onProgress = null) => {
    return await DjangoRequestPagination.parallel(
      url,
      async (page) => {
        let urlRequest = url
        if (params) {
          urlRequest = constructUrl(url, { ...params, page: page })
        }
        const response = await axios.get(
          urlRequest,
          {
            ...options,
            headers: {
              'X-CSRFToken': csrfmiddlewaretoken
            }
          }
        )
        return response.data
      },
      onProgress
    )
  },
  post: async (url, data, options = {}, params, onProgress, alterRequest = false) => {
    return await DjangoRequestPagination.parallel(
      url,
      async (page) => {
        let urlRequest = url
        if (params) {
          urlRequest = constructUrl(url, { ...params, page: page })
        }
        if (!alterRequest || isPost(data)) {
          const response = await axios.post(
            urlRequest,
            data,
            {
              ...options,
              headers: {
                'X-CSRFToken': csrfmiddlewaretoken
              }
            }
          )
          return response.data
        } else {
          const response = await axios.get(
            urlRequest,
            {
              ...options,
              headers: {
                'X-CSRFToken': csrfmiddlewaretoken
              }
            }
          )
          return response.data
        }
      },
      onProgress
    )
  },
}

/*** Axios georepo request */
export const axiosPostWithSession = async function (name, url, data) {
  const session = new Session(name)
  return new Promise((resolve, reject) => {
    DjangoRequests.post(url, data, {})
      .then(response => response.data)
      .then(data => {
          if (session.isValid) {
            resolve(data)
          }
        }
      ).catch(err => {
      reject(err)
    });
  })
}