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

export interface AggregationConfig {
  method: string;
  decimalPlace: number;
  useDecimalPlace: boolean;
  useAutoUnits: boolean;
}

export interface SortConfig {
  field: string;
  method: string;
  topN: number;
  useTopN: boolean;
}

export interface UnitConfig {
  id: number;
  name: string;
  color: string;
}

export interface DateTimeConfig {
  interval: null | string;
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

  // For the date filter
  dateTimeType: string;
  dateTimeConfig: DateTimeConfig;

  // Aggregation
  aggregation?: AggregationConfig;
  sort?: SortConfig;

  // This is legacy
  layer_id?: number;
  layer_used?: string;
  property_2?: string;
  date_filter_type?: string;
  date_filter_value?: string;
  operation?: string;
  unit?: string;
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
