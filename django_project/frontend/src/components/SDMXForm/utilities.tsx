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
  dimensions: Dimensions = {},
): string => {
  const urlSection = dimensionKeys
    .map((key) =>
      dimensions && dimensions[key] ? dimensions[key].join("+") : "",
    )
    .join(".");
  return apiUrl
    .replaceAll("<agency>", agencyId)
    .replaceAll("<dataflow>", dataFlowId)
    .replaceAll("<dataflow_version>", dataFlowVersionId)
    .replaceAll("<dimensions>", urlSection);
};
