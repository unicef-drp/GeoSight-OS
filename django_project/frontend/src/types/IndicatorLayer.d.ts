import { DatasetView } from "./DatasetView";
import { Indicator } from "./Indicator";
import { RelatedTable } from "./RelatedTable";

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
  description: string,
  name: string,
  level_config: LevelConfig,
  visible_by_default: boolean,
  last_update: string,
  indicators: Indicator[],
  type: string,
  layer_type: string,

  related_table: RelatedTable,
  related_tables: RelatedTable[],

  config: any,
  legend: string,

  // TODO:
  //  We will remove this
  error: string,
}