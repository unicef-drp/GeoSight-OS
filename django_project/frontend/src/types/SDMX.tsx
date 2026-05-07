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
 * __date__ = '30/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

export const SDMX_MODE_CONFIG = "config" as const;
export const SDMX_MODE_URL = "url" as const;
export const SDMX_MODES = [SDMX_MODE_CONFIG, SDMX_MODE_URL] as const;

export interface SDMXDataForm {
  url?: string;
  mode?: string;

  // Using config
  smdxConfigId?: string;
  agencyId?: string;
  agencyName?: string;
  dataflowId?: string;
  dataflowName?: string;
  dataflowDsdId?: string;
  dataflowVersionId?: string;
  dimensions?: Dimensions;
  dimensionKeys?: string[];
  attributeKeys?: string[];
}

export interface SDMXConfigUrls {
  agencies: string;
  data: string;
  data_structure: string;
  dataflow: string;
  dataflow_versions: string;
}

export interface SDMXConfig {
  id: string;
  name: string;
  url: string;
  urls: SDMXConfigUrls;
}

export interface Agency {
  id: string;
  name: string;
}

export type Dimensions = Record<string, string[]>;
