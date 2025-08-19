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
export const SeriesType = {
  INDICATORS: "Indicators",
  GEOGRAPHICAL_UNITS: "Geographical units",
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
  NAME: "Name",
  CODE: "Code",
  VALUE: "Value",
};

/** Used for sorting data. **/
export const SortMethodTypes = {
  ASC: "Ascending",
  DESC: "Descending",
};
