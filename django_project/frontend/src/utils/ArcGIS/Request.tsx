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
 * __date__ = '27/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   ARCGIS Request
   ========================================================================== */

import { isArray } from "chart.js/helpers";
import { ArcGISGeometry, Payload } from "./DataType";

export default class ArcGISRequest {
  private url: string;

  constructor(featureServerURL: string) {
    this.url = featureServerURL
  }

  /** Query data of FeatureServer **/
  queryData = (payload: Payload, geometry: ArcGISGeometry) => {
    const newPayload = Object.assign(
      {
        f: "json",
        where: "1=1"
      },
      payload,
      geometry.payload()
    );
    const queryUrl = (this.url + '/query').replaceAll('//query', '/query')
    return this.post(queryUrl, newPayload)
  }

  /** POST request to ArcGIS **/
  private post = (url: string, payload: object) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      let mewValue = value;
      if (isArray(value)) {
        mewValue = value.join(',')
      }
      data.append(key, mewValue);
    }
    return fetch(url, {
      method: "POST",
      body: data,
    });
  }
}