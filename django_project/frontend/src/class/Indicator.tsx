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
import {
  DjangoRequestPagination,
  DjangoRequests,
  getWithSplitKey,
} from "../Requests";
import { dictDeepCopy } from "../utils/main";
import { apiUrl } from "../utils/urls";
import { IndicatorData } from "./IndicatorData";

export class Indicator extends IndicatorData {
  id: number;
  indicator: IndicatorType;
  metadataKey: string;
  url: string;

  constructor(indicator: IndicatorType) {
    super();
    this.indicator = indicator;
    this.id = indicator.id;
    this.metadataKey = "indicator-" + indicator.id;
    this.url = `${apiUrl()}indicators/${indicator.id}/data/`;
  }

  /** Return latest values of data **/
  async valueLatest(
    params: any,
    onProgress: (progress: any) => void | null,
    fields: string[] = [
      "geometry_code",
      "value",
      "concept_uuid",
      "admin_level",
      "date",
      "time",
    ],
  ) {
    params = dictDeepCopy(params);
    params["fields"] = fields;
    params["distinct"] = "geom_id";
    params["sort"] = "geom_id,-date";

    let data: any = {};
    if (params["country_geom_id__in"]) {
      return await getWithSplitKey(
        this.url,
        data,
        params,
        "country_geom_id__in",
        onProgress,
      );
    } else if (params["country_concept_uuid__in"]) {
      return await getWithSplitKey(
        this.url,
        data,
        params,
        "country_concept_uuid__in",
        onProgress,
      );
    } else {
      [params, data] = this.getParamAndData(params);
      return await DjangoRequestPagination.post(
        this.url,
        data,
        {},
        params,
        onProgress,
        true,
      );
    }
  }
}
