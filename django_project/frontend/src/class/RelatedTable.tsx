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
 * __date__ = '18/03/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { RelatedTable as RelatedTableType } from "../types/RelatedTable";
import { DjangoRequestPagination, DjangoRequests } from "../Requests";
import { dictDeepCopy, splitByJoinedLength } from "../utils/main";

export class RelatedTable {
  id: number;
  relatedTable: RelatedTableType;
  metadataKey: string;
  url: string;

  constructor(relatedTable: RelatedTableType) {
    this.relatedTable = relatedTable;
    this.id = relatedTable.id;
    this.metadataKey = 'indicator-' + relatedTable.id
    this.url = `/api/v1/related-tables/${relatedTable.id}/geo-data/`
  }

  getParamAndData(params: any) {
    params = dictDeepCopy(params)
    const data = {}
    for (const [key, value] of Object.entries(params)) {
      if (key.includes('country_geom')) {
        let dataValue = '' + value;
        if (Array.isArray(value)) {
          // @ts-ignore
          dataValue = value.join(',')
          params[key] = dataValue
        }
        // @ts-ignore
        if (dataValue.length > 1500) {
          // @ts-ignore
          data[key] = dataValue
          // @ts-ignore
          delete params[key]
        }

      }
    }
    return [params, data]
  }

  /** Return dates of data **/
  async dates(params: any) {
    let data: any = {};
    [params, data] = this.getParamAndData(params);
    const response = await DjangoRequests.post(
      this.url + "dates/", data, {}, params, true
    );
    return response.data;
  }

  /** Return dates of data **/
  async values(params: any, onProgress: (value: any) => void = null) {
    params = dictDeepCopy(params)

    let data: any = {};
    if (params['country_geom_ids']) {
      const newParams = splitByJoinedLength(params['country_geom_ids']);
      let values: any[] = []
      for (let i: number = 0; i < newParams.length; i++) {
        const result = await DjangoRequestPagination.get(
          this.url,
          data,
          {
            ...params,
            country_geom_ids: newParams[i]
          }
        )
        values.push(...result);
      }
      return values
    } else {
      [params, data] = this.getParamAndData(params);
      return await DjangoRequestPagination.post(this.url, data, {}, params, onProgress, true)
    }
  }
}
