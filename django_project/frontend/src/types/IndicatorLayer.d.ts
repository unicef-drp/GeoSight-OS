import { DatasetView } from "./DatasetView";

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
 * __date__ = '05/03/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export interface LevelConfig {
  levels: number[],
  default_level: number,
  referenceLayer?: DatasetView
}

export interface IndicatorLayer {
  id: number,
  name: string,
  level_config: LevelConfig,
}