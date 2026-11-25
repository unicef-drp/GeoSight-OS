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
  DAILY: "Daily",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const pad = (number) => ("" + number).padStart(2, "0");

/***
 * Return the local date and time of a Date, without a timezone,
 * e.g. 2010-01-01T00:00:00. Used to store widget dates, so they mean
 * the same calendar day for every viewer.
 */
export const toLocalDateTimeString = (date) => {
  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(
      "-",
    ) +
    "T" +
    [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(
      ":",
    )
  );
};

/***
 * Return a stored widget date as a local date time string.
 * Values with a timezone (Z or +hh:mm, saved before widget dates were
 * stored without one) are converted to the viewer's local time.
 * Returns null for an empty or invalid value.
 */
export const widgetLocalDateTime = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
    return value.split(".")[0];
  }
  return toLocalDateTimeString(date);
};

/***
 * Return the YYYY-MM-DD date of a stored widget date, for requests.
 */
export const widgetRequestDate = (value) => {
  const dateTime = widgetLocalDateTime(value);
  return dateTime ? dateTime.split("T")[0] : null;
};

/***
 * Return date label
 */
export const dateLabel = (d, interval, reverse = false) => {
  let month = "" + (d.getUTCMonth() + 1);
  let day = "" + d.getUTCDate();
  let year = d.getUTCFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  // Create data
  switch (interval) {
    case INTERVALS.DAILY:
      if (reverse) {
        return [year, month, day].join("-");
      } else {
        return [day, month, year].join("-");
      }
    case INTERVALS.MONTHLY:
      if (reverse) {
        return [year, month].join("-");
      } else {
        return [month, year].join("-");
      }
    case INTERVALS.YEARLY:
      return [year].join("-");
  }
};

/*** Convert value + format into ISO datetime string (e.g. 2020-01-01T00:00:00+00:00) **/
export const toISODateTimeString = (value, date_time_format) => {
  if (!value || !date_time_format) return null;

  let year,
    month = "01",
    day = "01",
    hour = "00",
    minute = "00",
    second = "00";

  if (date_time_format === "timestamp") {
    const d = new Date(parseInt(value) * 1000);
    year = String(d.getUTCFullYear()).padStart(4, "0");
    month = String(d.getUTCMonth() + 1).padStart(2, "0");
    day = String(d.getUTCDate()).padStart(2, "0");
    hour = String(d.getUTCHours()).padStart(2, "0");
    minute = String(d.getUTCMinutes()).padStart(2, "0");
    second = String(d.getUTCSeconds()).padStart(2, "0");
  } else if (date_time_format === "%Y") {
    year = value;
  } else if (date_time_format === "%Y-%m") {
    [year, month] = value.split("-");
  } else if (date_time_format === "%Y-%m-%d") {
    [year, month, day] = value.split("-");
  } else if (date_time_format === "%Y-%m-%dT%H:%M:%S") {
    const [datePart, timePart] = value.split("T");
    [year, month, day] = datePart.split("-");
    [hour, minute, second] = timePart.split(":");
  }

  return `${year}-${month}-${day}T${hour}:${minute}:${second}+00:00`;
};

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

  return Array.from(new Set(dates.map((d) => dateLabel(d, interval))));
}
