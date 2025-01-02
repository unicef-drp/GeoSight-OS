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
  COUNT: 'COUNT',
  SUM: 'SUM',
  MIN: 'MIN',
  MAX: 'MAX',
  AVG: 'AVG',
} as const;

export const analyzeData = (
  operator: keyof typeof AGGREGATION_TYPES,
  data: number[]
) => {
  if (!data?.length) {
    return null
  }
  switch (operator) {
    case AGGREGATION_TYPES.COUNT: {
      return data.length
    }
    case AGGREGATION_TYPES.SUM: {
      return data.reduce((sum, num) => {
        return sum + (isNaN(num) ? 0 : num);
      }, 0);
    }
    case AGGREGATION_TYPES.AVG: {
      const total = data.reduce((sum, num) => {
        return sum + (isNaN(num) ? 0 : num);
      }, 0);
      return total / data.length;
    }
    case AGGREGATION_TYPES.MIN: {
      const val = Math.min(...data)
      return val === Infinity ? null : val
    }
    case AGGREGATION_TYPES.MAX: {
      const val = Math.max(...data)
      return val === -Infinity ? null : val
    }
  }
  return null
}