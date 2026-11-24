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
 * __date__ = '24/11/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   CHART WIDGET CAPABILITIES
   Which generic widget settings each chart type uses. The editor shows only
   these settings, the info popup lists only these, and the view follows them.
   ========================================================================== */

import { ChartConfig, Widget } from "../../../types/Widget";
import {
  ChartBarLayouts,
  ChartColorModes,
  ChartPeriods,
  ChartTypes,
  DEFAULT_CHART_CONFIG,
  SeriesType,
} from "../Definition";

/** The chart config with the defaults of older configs filled in. */
export function chartConfig(widget: Widget): ChartConfig {
  return { ...DEFAULT_CHART_CONFIG, ...(widget.config?.chart || {}) };
}

/** Is the bar chart drawn with series (stacked, grouped, 100%)? */
export function isMultiBar(chart: ChartConfig): boolean {
  return (
    chart.type === ChartTypes.BAR &&
    !!chart.layout &&
    chart.layout !== ChartBarLayouts.SIMPLE
  );
}

/** Does the chart split the data by area or indicator ("Series")? */
export function usesSeries(chart: ChartConfig): boolean {
  return ![ChartTypes.SCATTER, ChartTypes.GAUGE, ChartTypes.KPI].includes(
    chart.type,
  );
}

/**
 * Does the aggregation (SUM, AVG, COUNT…) change what the chart shows?
 * Only when several values are combined into one: values of several areas
 * (series = indicators, gauge, KPI) or of several dates in a period. One
 * latest value per area (or per area and indicator) is never combined, so
 * the setting is hidden there and the chart uses the value itself.
 */
export function usesAggregation(
  chart: ChartConfig,
  seriesType: string,
): boolean {
  const byIndicator = seriesType === SeriesType.INDICATORS;
  switch (chart.type) {
    case ChartTypes.SCATTER:
      return false;
    case ChartTypes.GAUGE:
    case ChartTypes.KPI:
      return true;
    case ChartTypes.LINE:
    case ChartTypes.HEATMAP:
      return (
        byIndicator || (!!chart.period && chart.period !== ChartPeriods.DATE)
      );
    case ChartTypes.BAR:
      return !isMultiBar(chart) && byIndicator;
    default:
      return byIndicator;
  }
}

/**
 * Does the chart take its colours from a palette? Lines do unless their
 * colours are custom (they have no map style); bars, donuts, treemaps,
 * heatmaps and scatters in palette mode; gauge and KPI have one colour of
 * their own.
 */
export function usesPalette(chart: ChartConfig): boolean {
  switch (chart.type) {
    case ChartTypes.LINE:
      return chart.colors !== ChartColorModes.CUSTOM;
    case ChartTypes.GAUGE:
    case ChartTypes.KPI:
      return false;
    default:
      return chart.colors === ChartColorModes.PALETTE;
  }
}

/** Does the chart use a colour per item, set in the predefined lists? */
export function usesCustomColors(chart: ChartConfig): boolean {
  return (
    chart.colors === ChartColorModes.CUSTOM &&
    ![ChartTypes.GAUGE, ChartTypes.KPI].includes(chart.type)
  );
}

/** Does the chart have a colour setting at all? */
export function hasColorSetting(chart: ChartConfig): boolean {
  return ![ChartTypes.GAUGE, ChartTypes.KPI].includes(chart.type);
}

/** Does the chart follow the sort settings (order, top N)? */
export function usesSort(chart: ChartConfig): boolean {
  return [ChartTypes.BAR, ChartTypes.DONUT, ChartTypes.TREEMAP].includes(
    chart.type,
  );
}

/** Does the chart read the widget's indicator list (scatter has X/Y/size)? */
export function usesIndicatorList(chart: ChartConfig): boolean {
  return chart.type !== ChartTypes.SCATTER;
}

/** Does the chart have a period setting (date, month, year)? */
export function usesPeriod(chart: ChartConfig): boolean {
  return [ChartTypes.LINE, ChartTypes.HEATMAP, ChartTypes.KPI].includes(
    chart.type,
  );
}

/**
 * Can the chart show one indicator only? Then, with several active
 * indicators (e.g. a multi-indicator layer synced with the map), the viewer
 * picks one instead of getting the values of all indicators added up.
 */
export function needsOneIndicator(
  chart: ChartConfig,
  seriesType: string,
): boolean {
  const byArea = seriesType !== SeriesType.INDICATORS;
  switch (chart.type) {
    case ChartTypes.GAUGE:
    case ChartTypes.KPI:
      return true;
    case ChartTypes.SCATTER:
      return false;
    case ChartTypes.BAR:
      return !isMultiBar(chart) && byArea;
    default:
      return byArea;
  }
}

/** Does the chart show areas, so they can be linked to the map? */
export function showsAreas(chart: ChartConfig, seriesType: string): boolean {
  switch (chart.type) {
    case ChartTypes.GAUGE:
    case ChartTypes.KPI:
      return false;
    case ChartTypes.SCATTER:
      return true;
    case ChartTypes.BAR:
      return isMultiBar(chart) || seriesType !== SeriesType.INDICATORS;
    default:
      return seriesType !== SeriesType.INDICATORS;
  }
}
