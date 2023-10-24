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

import { fetchJSON } from '../Requests'
import axios from "axios";

/** Georepo URL */
export function updateToken(url) {
  if (preferences.georepo_api.api_key) {
    const urls = url.split('?')
    let parameters = urls[1] ? urls[1].split('&') : []
    parameters.unshift('token=' + preferences.georepo_api.api_key)
    parameters.unshift('georepo_user_key=' + preferences.georepo_api.api_key_email)
    urls[1] = parameters.join('&')
    url = urls.join('?')
  }
  return url
}

/** Headers georepo **/
export const headers = {
  headers: preferences.georepo_api.headers
}

export const GeorepoUrls = {
  WithDomain: function (url, useToken = true) {
    return preferences.georepo_api.api + url
  },
  WithoutDomain: function (url) {
    return url
  },
  ViewDetail: function (identifier) {
    return preferences.georepo_api.view_detail.replace('<identifier>', identifier)
  }
}

/**
 * Return reference layer List
 */
export const fetchReferenceLayerList = async function () {
  let data = []
  const modules = await fetchFeatureList(
    GeorepoUrls.WithDomain('/search/module/list/', false), true
  );
  for (const module of modules) {
    const referenceLayers = await fetchFeatureList(
      GeorepoUrls.WithDomain(`/search/module/${module.uuid}/dataset/list/`, false), true
    );
    data = data.concat(referenceLayers)
  }
  data.map(row => {
    row.identifier = row.uuid
  })
  data.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  })
  return data
}

/**
 * Return reference layer view List
 */
export const fetchReferenceLayerViewsList = async function (referenceLayerUUID) {
  let data = []
  data = await fetchFeatureList(
    GeorepoUrls.WithDomain(`/search/dataset/${referenceLayerUUID}/view/list/`, false), true
  );
  data.map(row => {
    row.identifier = row.uuid
  })
  data.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  })
  return data
}

/***
 * Return geojson
 */
export const fetchGeojson = async function (url, useCache = true) {
  let data = {
    type: "FeatureCollection",
    features: []
  }
  const _fetchGeojson = async function (page = 1) {
    try {
      const response = await fetchJSON(url + '?format=geojson&page=' + page, headers, useCache);
      if (response?.features?.length) {
        data.features = data.features.concat(response.features)
        await _fetchGeojson(page += 1)
      }
    } catch (error) {
    }
  }
  await _fetchGeojson()
  return data
}

/***
 * Return feature list paginated
 */
export const fetchFeatureList = async function (url, useCache = true) {
  let data = []
  const _fetchJson = async function (page = 1) {
    try {
      const response = await fetchJSON(url + '?geom=centroid&cache=false&page=' + page, headers, useCache);
      if (response.results) {
        data = data.concat(response.results)
        if (response.results.length) {
          await _fetchJson(page += 1)
        }
      } else if (Array.isArray(response)) {
        // This if the return is array
        data = data.concat(response)
      }
    } catch (error) {

    }
  }
  await _fetchJson()
  return data
}

/*** Axios georepo request */
export const axiosGet = function (url) {
  return axios.get(url, headers);
}

/*** Axios georepo request json */
export const fetchJson = async function (url) {
  if (!url.includes('http')) {
    url = preferences.georepo_api.api + url
  }
  return await fetchJSON(url, headers)
}

/*** Axios georepo request with cache */
export const axiosGetCache = function (url) {
  if (!url.includes('http')) {
    url = preferences.georepo_api.api + url
  }
  return new Promise((resolve, reject) => {
    (
      async () => {
        try {
          resolve(await fetchJSON(url, headers));
        } catch (err) {
          reject(err)
        }
      }
    )()
  });
}

/***
 * Change code to ucode
 */
export const toUcode = (code) => {
  return code ? code : null
}

/***
 * Extracting ucode
 */
export const extractCode = (properties, geoField = 'concept_uuid') => {
  return toUcode(properties[geoField])
}

