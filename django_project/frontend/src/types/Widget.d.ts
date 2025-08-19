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
 * __date__ = '19/07/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export interface UnitConfig {
  id: number;
  name: string;
  color: string;
}

export interface DateTimeConfig {
  interval: string;
  maxDateFilter: null | string;
  minDateFilter: null | string;
}

export interface WidgetConfig {
  seriesType: null | string;

  // Indicator series list
  indicators: UnitConfig[];
  indicatorsType: string;
  indicatorsPaletteColor: number;

  // Geographical series list
  geographicalUnit: UnitConfig[];
  geographicalUnitType: string;
  geographicalUnitPaletteColor: number;

  // FOr the date filter
  dateTimeType: string;
  dateTimeConfig: DateTimeConfig;
}

export interface WidgetMetadata {
  name: string;
  description: string;
  type: string;
  config: WidgetConfig;
}

export interface Widget extends WidgetMetadata {
  id: number;
  order: number;
  visible_by_default: boolean;
}
