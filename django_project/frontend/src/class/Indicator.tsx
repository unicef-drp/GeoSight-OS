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
import { DjangoRequests, fetchPaginationInParallel } from "../Requests";

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

  async valueLatest(params: any, onProgress: (progress: any) => void | null) {
    params['fields'] = 'geometry_code,value,concept_uuid,admin_level,date,time'
    params['distinct'] = 'geom_id'
    params['sort'] = 'geom_id,-date'
    return await fetchPaginationInParallel(
      this.url, params, onProgress
    )
  }

  async statistic(params: any) {
    const response = await DjangoRequests.get(
      this.url + "statistic/", {}, params
    );
    return response.data;
  }

  async values(params: any): Promise<any> {
    const response = await DjangoRequests.get(
      this.url + "values/", {}, params
    );
    return response.data;
  }
}
