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

/** TYPE INTERVAL SECTION */
export const INTERVALS = {
  DAILY: 'Daily',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly'
}

/***
 * Return date label
 */
export const dateLabel = (d, interval, reverse = false) => {
  let month = '' + (d.getUTCMonth() + 1);
  let day = '' + d.getUTCDate();
  let year = d.getUTCFullYear();
  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  // Create data
  switch (interval) {
    case INTERVALS.DAILY:
      if (reverse) {
        return [year, month, day].join('-')
      } else {
        return [day, month, year].join('-')
      }
    case INTERVALS.MONTHLY:
      if (reverse) {
        return [year, month].join('-')
      } else {
        return [month, year].join('-')
      }
    case INTERVALS.YEARLY:
      return [year].join('-')
  }
}

/*** Return dates in range **/
export function getDatesInRange(startDate, endDate, interval) {
  const start = new Date(new Date(startDate).setUTCHours(0, 0, 0, 0));
  const end = new Date(new Date(endDate).setUTCHours(23, 23, 59, 0));
  const date = new Date(start);
  const dates = [];
  while (date <= end) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return Array.from(new Set(dates.map(d => dateLabel(d, interval))));
}