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
 * __date__ = '26/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
export const AGGREGATION_TYPES = {
  'SUM': 'SUM',
  'MIN': 'MIN',
  'MAX': 'MAX',
  'AVG': 'AVG',
} as const;

export const SELECTION_MODE = {
  SELECT: "SELECT",
  MANUAL: "MANUAL",
} as const;

export const DRAW_MODE = {
  POINT: "POINT",
  LINE: "LINE",
  POLYGON: "POLYGON",
} as const;

export interface ZonalAnalysisConfiguration {
  selectionMode: keyof typeof SELECTION_MODE;
  drawMode: keyof typeof DRAW_MODE;
  aggregation: keyof typeof AGGREGATION_TYPES;
  buffer: number;
}