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
 * __date__ = '29/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import { Dimensions } from "../../types/SDMX";

export const constructSDMXUrl = (
  apiUrl: string,
  agencyId: string,
  dataFlowId: string,
  dataFlowVersionId: string,
  dimensionKeys: string[] = [],
  dimensionTimeKeys: string[] = [],
  dimensions: Dimensions = {},
): string => {
  const urlSection = dimensionKeys
    .map((key) =>
      dimensions && dimensions[key] ? dimensions[key].join("+") : "",
    )
    .join(".");
  let url = apiUrl
    .replaceAll("<agency>", agencyId)
    .replaceAll("<dataflow>", dataFlowId)
    .replaceAll("<dataflow_version>", dataFlowVersionId)
    .replaceAll("<dimensions>", urlSection);

  const [startPeriod, endPeriod] =
    (dimensionTimeKeys[0] && dimensions?.[dimensionTimeKeys[0]]) || [];
  const params = new URLSearchParams();
  if (startPeriod) params.set("startPeriod", startPeriod);
  if (endPeriod) params.set("endPeriod", endPeriod);
  if (params.toString()) {
    url += (url.includes("?") ? "&" : "?") + params.toString();
  }
  return url;
};
