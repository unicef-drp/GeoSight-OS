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
import { dictDeepCopy } from "../utils/main";

export class Indicator {
  id: number;
  indicator: IndicatorType;
  metadataKey: string;
  url: string;

  constructor(indicator: IndicatorType) {
    this.indicator = indicator;
    this.id = indicator.id;
    this.metadataKey = 'indicator-' + indicator.id
    this.url = `/api/v1/indicators/${indicator.id}/data/`
  }

  getParamAndData(params: any) {
    params = dictDeepCopy(params)
    const data = {}
    for (const [key, value] of Object.entries(params)) {
      if (key.includes('country_geom')) {
        if (Array.isArray(value)) {
          // @ts-ignore
          data[key] = value.join(',')
        } else {
          // @ts-ignore
          data[key] = value
        }
        // @ts-ignore
        delete params[key]

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
    [params, data] = this.getParamAndData(params);
    return await DjangoRequestPagination.post(this.url, data, {}, params, onProgress)
  }

  /** Return statistic of data **/
  async statistic(params: any) {
    let data: any = {};
    [params, data] = this.getParamAndData(params);
    const response = await DjangoRequests.post(
      this.url + "statistic/", data, {}, params
    );
    return response.data;
  }

  /** Return values of data **/
  async values(params: any): Promise<any> {
    let data: any = {};
    [params, data] = this.getParamAndData(params);
    const response = await DjangoRequests.post(
      this.url + "values/", data, {}, params
    );
    return response.data;
  }
}
