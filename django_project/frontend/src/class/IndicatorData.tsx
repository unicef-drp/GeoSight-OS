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
 * __date__ = '05/03/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { Indicator as IndicatorType } from "../types/Indicator";
import { DjangoRequestPagination, DjangoRequests } from "../Requests";
import { dictDeepCopy, splitByJoinedLength } from "../utils/main";
import { apiUrl } from "../utils/urls";

export class IndicatorData {
  url: string;

  constructor() {
    this.url = `${apiUrl()}indicators/data/`
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

  /** Return latest values of data **/
  async valueLatest(params: any, onProgress: (progress: any) => void | null) {
    params = dictDeepCopy(params)
    params['fields'] = 'geometry_code,value,concept_uuid,admin_level,date,time'
    params['distinct'] = 'geom_id'
    params['sort'] = 'geom_id,-date'

    let data: any = {};
    if (params['country_geom_id__in']) {
      const newParams = splitByJoinedLength(params['country_geom_id__in']);
      let values: any[] = []
      for (let i: number = 0; i < newParams.length; i++) {
        const result = await DjangoRequestPagination.get(
          this.url,
          data,
          {
            ...params,
            country_geom_id__in: newParams[i]
          }, onProgress
        )
        values.push(...result);
      }
      return values
    } else {
      [params, data] = this.getParamAndData(params);
      return await DjangoRequestPagination.post(this.url, data, {}, params, onProgress, true)
    }
  }

  /** Return statistic of data **/
  async statistic(params: any) {
    let data: any = {};
    [params, data] = this.getParamAndData(params);
    const response = await DjangoRequests.post(
      this.url + "statistic/", data, {}, params, true
    );
    return response.data;
  }

  /** Return values of data **/
  async values(params: any): Promise<any> {
    let data: any = {};
    [params, data] = this.getParamAndData(params);
    const response = await DjangoRequests.post(
      this.url + "values/", data, {}, params, true
    );
    return response.data;
  }
}
