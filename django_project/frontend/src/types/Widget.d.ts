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

/** Settings of the chart widget (config.chart), version 1. */
export interface ChartConfig {
  version?: number;
  /** bar | line | donut | scatter | heatmap | treemap | gauge | kpi */
  type: string;
  /** Bar: simple | stacked | grouped | percent */
  layout?: string;
  horizontal?: boolean;
  /** Bar: target line. Gauge: target value. */
  target?: number | null;
  /** Line: fill the area under the line. */
  area?: boolean;
  /** Line, heatmap, KPI: date | monthly | yearly */
  period?: string;
  /** Scatter: indicator ids of the x axis, y axis and point size. */
  x?: number | null;
  y?: number | null;
  size?: number | null;
  /** Scatter: the area selected on the map pulses (> 0 = on, 0 = off). */
  pulse?: number;
  /** Gauge: scale. Empty max = automatic. */
  min?: number | null;
  max?: number | null;
  /** Show value labels on the chart. */
  labels?: boolean;
  /** map-style | palette */
  colors?: string;
  /** Palette mode: id of the colour palette. */
  palette?: number | null;
  /** Clicking an area in the chart selects and zooms to it on the map. */
  linkAreas?: boolean;
  /** Advanced: ECharts option overrides (JSON only, merged last). */
  overrides?: object | null;
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

  // Summary table by area: clicking a name selects it on the map (default on)
  linkAreas?: boolean;

  // Chart widget
  chart?: ChartConfig;

  // Text widget: Markdown, optionally with HTML (sanitised when shown)
  text?: string;

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
