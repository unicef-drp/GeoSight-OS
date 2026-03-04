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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   ALL DEFINITION FOR TIME SERIES
   ========================================================================== */

/** Used for grouping data **/
export const SeriesTypeNone = "None";
export const SeriesType = {
  GEOGRAPHICAL_UNITS: "Geographical units",
  INDICATORS: "Indicators",
};
/** Used for grouping data
 * Is the data type of the series based on predefined list or sync with the current map. **/
export const SeriesDataType = {
  PREDEFINED: "Predefined list",
  SYNC: "Sync with the current map",
};
/** Used for grouping data
 * Is the data type of the series based on predefined list or sync with the current map. **/
export const TimeType = {
  PREDEFINED: "Predefined start/end date",
  SYNC: "Sync with dashboard",
};

/** Used for sorting data. **/
export const SortTypes = {
  VALUE: "Value",
  NAME: "Name",
  CODE: "Code",
};

/** Used for sorting data. **/
export const SortMethodTypes = {
  ASC: "Ascending",
  DESC: "Descending",
};

export const WidgetType = {
  GENERIC_SUMMARY_WIDGET: "GenericSummaryWidget",
  GENERIC_TIME_SERIES_WIDGET: "GenericTimeSeriesWidget",

  // This is legacy widget
  SUMMARY_WIDGET: "SummaryWidget",
  SUMMARY_GROUP_WIDGET: "SummaryGroupWidget",
  TIME_SERIES_CHART_WIDGET: "TimeSeriesChartWidget",
};
export const WidgetText = {
  GENERIC_SUMMARY_WIDGET: "Summary Widget",
  GENERIC_TIME_SERIES_WIDGET: "Time Series Widget",

  // This is legacy widget
  SUMMARY_WIDGET: "Summary Widget (Legacy)",
  SUMMARY_GROUP_WIDGET: "Summary Group Widget (Legacy)",
  TIME_SERIES_CHART_WIDGET: "Time Series Widget",
};

export const WidgetOperation = {
  SUM: "Sum",
};

export const WidgetLayerUsed = {
  INDICATOR: "Indicator",
  INDICATOR_LAYER: "Indicator Layer",
};
export const DateFilterType = {
  NO_FILTER: "No filter",
  SYNC: "Global datetime filter",
  CUSTOM: "Custom filter",
};
