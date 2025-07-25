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
 * __date__ = '23/06/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export interface Entity {
  id: string;
  name: string;
  ucode: string;
  admin_level: number;
  level_name: string;
  bbox: [number, number, number, number];
  dataset: string;
}
