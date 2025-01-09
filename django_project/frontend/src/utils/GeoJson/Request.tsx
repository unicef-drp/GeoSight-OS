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
 * __date__ = '06/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   GeoJson Request
   ========================================================================== */

import axiosRequest from "../Request";

export default class GeoJsonRequest {
  private url: string;

  constructor(url: string) {
    this.url = url
  }

  /** Get metadata **/
  getMetadata = () => {
    return new Promise((resolve, reject) => {
      axiosRequest.get(this.url).then(response => {
        let fields: string[] = []
        // @ts-ignore
        response.data.features.map(feature => {
          fields = fields.concat(Object.keys(feature.properties))
        })
        resolve(Array.from(new Set(fields)))
      }).catch(error => {
        reject(error)
      })
    });
  }
}