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
 * __date__ = '20/03/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export type Extent = [number, number, number, number];
export type Center = [number, number];
export type Position = {
  pitch: number;
  bearing: number;
  zoom: number;
  center: Center;
};
