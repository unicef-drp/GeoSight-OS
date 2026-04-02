/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 */

export interface DashboardStory {
  id: number;
  name: string;
  title?: string;
  label?: string;
  description?: string;
  icon?: string | null;
  iconFile?: File | null;
  bookmark_id?: number | null;
  visible_by_default: boolean;
  order?: number;
  group?: string;
  config?: Record<string, any> | null;
}
