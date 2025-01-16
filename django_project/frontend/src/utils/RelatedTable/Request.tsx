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
 * __date__ = '02/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import axiosRequest from "../Request";

export default class RelatedTableRequest {
  private id: number;

  constructor(id: number) {
    this.id = id
  }

  /** Get metadata **/
  getDetail = () => {
    return new Promise((resolve, reject) => {
      axiosRequest.get(`/api/related-table/${this.id}/`).then(response => {
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    });
  }
  /** Get data **/
  getData = () => {
    return new Promise((resolve, reject) => {
      axiosRequest.get(`/api/related-table/${this.id}/data`).then(response => {
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    });
  }
}