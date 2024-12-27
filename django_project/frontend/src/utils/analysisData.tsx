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
 * __date__ = '27/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export const AGGREGATION_TYPES = {
  SUM: 'SUM',
  MIN: 'MIN',
  MAX: 'MAX',
  AVG: 'AVG',
} as const;

export const analyzeData = (
  operator: keyof typeof AGGREGATION_TYPES,
  data: number[]
) => {
  switch (operator) {
    case AGGREGATION_TYPES.SUM: {
      return data.reduce((sum, num) => {
        return sum + (isNaN(num) ? 0 : num);
      }, 0);
    }
  }
  return null
}