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
 * __date__ = '02/09/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export interface Style {
  id: number;
  name: string;
  rule: string;
  color: string;
  outline_color: string;
  outline_size: number;
  active: boolean;
}
