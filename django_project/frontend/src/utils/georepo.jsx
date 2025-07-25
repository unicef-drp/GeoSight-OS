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

import { fetchJSON } from "../Requests";
import axios from "axios";
import { referenceDatasetUrlBase } from "./urls";

export const LocalReferenceDatasetIdentifier = "Internal reference datasets";

/** Georepo URL */
export function updateToken(url) {
  if (preferences.georepo_api.api_key) {
    const urls = url.split("?");
    let parameters = urls[1] ? urls[1].split("&") : [];
    parameters.unshift("token=" + preferences.georepo_api.api_key);
    parameters.unshift(
      "georepo_user_key=" + preferences.georepo_api.api_key_email,
    );
    urls[1] = parameters.join("&");
    url = urls.join("?");
  }
  return url;
}

/** Headers georepo **/
export const headers = {
  headers: preferences.georepo_api.headers,
};

export const GeorepoUrls = {
  WithDomain: function (url, useToken = true) {
    return preferences.georepo_api.api + url;
  },
  WithoutDomain: function (url) {
    return url;
  },
  ViewDetail: function (identifier) {
    return preferences.georepo_api.view_detail.replace(
      "<identifier>",
      identifier,
    );
  },
  ViewList: function (dataset) {
    return GeorepoUrls.WithDomain(
      `/search/dataset/${dataset}/view/list/`,
      true,
    );
  },
  Centroid: function (identifier) {
    return GeorepoUrls.WithDomain(`/search/view/${identifier}/centroid/`, true);
  },
  CountryList: function (dataset) {
    return GeorepoUrls.WithDomain(
      `/search/dataset/${dataset}/entity/level/0/`,
      true,
    );
  },
};

/**
 * Return reference layer List
 */
export const fetchReferenceLayerList = async function () {
  let data = [];
  const modules = await fetchFeatureList(
    GeorepoUrls.WithDomain("/search/module/list/", false),
    true,
  );
  for (const module of modules) {
    const referenceLayers = await fetchFeatureList(
      GeorepoUrls.WithDomain(
        `/search/module/${module.uuid}/dataset/list/`,
        false,
      ),
      true,
    );
    data = data.concat(referenceLayers);
  }
  data.map((row) => {
    row.identifier = row.uuid;
  });
  return [].concat(
    data.filter((row) => row.is_favorite),
    data.filter((row) => !row.is_favorite),
  );
};

/***
 * Return geojson
 */
export const fetchGeojson = async function (url, useCache = true) {
  let data = {
    type: "FeatureCollection",
    features: [],
  };
  const _fetchGeojson = async function (page = 1) {
    try {
      var newUrl = new URL(url);
      newUrl.searchParams.append("format", "geojson");
      newUrl.searchParams.append("page", page);
      const response = await fetchJSON(newUrl.toString(), headers, useCache);
      if (response?.features?.length) {
        data.features = data.features.concat(response.features);
        await _fetchGeojson((page += 1));
      }
    } catch (error) {}
  };
  await _fetchGeojson();
  return data;
};

/***
 * Return feature list paginated
 */
export const fetchFeatureList = async function (url, useCache = true) {
  let data = [];
  const _fetchJson = async function (page = 1) {
    try {
      let usedUrl = url + "?geom=centroid&cache=false&page=" + page;

      // TODO : INTERNAL REFERENCE DATASETS
      //  This is for local
      if (url.includes(referenceDatasetUrlBase)) {
        if (url.includes("?")) {
          usedUrl = url + "&page=" + page;
        } else {
          usedUrl = url + "?page=" + page;
        }
      }

      const response = await fetchJSON(usedUrl, headers, useCache);
      if (response.results) {
        data = data.concat(response.results);
        if (response.page && response.page >= response.total_page) {
          return;
        }
        if (response.results.length) {
          await _fetchJson((page += 1));
        }
      } else if (Array.isArray(response)) {
        // This if the return is array
        data = data.concat(response);
      }
    } catch (error) {}
  };
  await _fetchJson();
  return data;
};

/*** Axios georepo request */
export const axiosGet = function (url, params = null, signal = null) {
  if (params) {
    return axios.get(url, { ...headers, params, signal: signal });
  } else {
    return axios.get(url, headers);
  }
};

/***
 * Change code to ucode
 */
export const toUcode = (code) => {
  return code ? code : null;
};

/***
 * Extracting ucode
 */
export const extractCode = (properties, geoField = "concept_uuid") => {
  const geomFieldOnVectorTile =
    geoField === "geometry_code" ? "ucode" : geoField;
  return toUcode(
    properties[geoField]
      ? properties[geoField]
      : properties[geomFieldOnVectorTile],
  );
};
