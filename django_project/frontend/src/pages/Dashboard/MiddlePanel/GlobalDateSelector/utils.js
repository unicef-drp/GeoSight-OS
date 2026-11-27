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
 * __date__ = '23/11/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   Time slider label helpers
   ========================================================================== */

import { dateLabel, INTERVALS } from "../../../../utils/Dates";

/** Intl options per interval (all dates are UTC). */
const PERIOD_FORMAT = {
  [INTERVALS.YEARLY]: { year: "numeric" },
  [INTERVALS.MONTHLY]: { year: "numeric", month: "short" },
  [INTERVALS.DAILY]: { year: "numeric", month: "short", day: "numeric" },
};

/**
 * Readable, localised label of the period a date belongs to,
 * e.g. "Sep 2023" (monthly), "2023" (yearly), "Sep 30, 2023" (daily).
 */
export function periodLabel(date, interval, language) {
  const d = new Date(date);
  try {
    return new Intl.DateTimeFormat(language, {
      timeZone: "UTC",
      ...(PERIOD_FORMAT[interval] || PERIOD_FORMAT[INTERVALS.DAILY]),
    }).format(d);
  } catch (e) {
    return dateLabel(d, interval);
  }
}

/** Readable, localised day, e.g. "Sep 30, 2023". */
export function dayLabel(date, language) {
  return periodLabel(date, INTERVALS.DAILY, language);
}

/**
 * Readable active window, e.g. "Sep 1, 2023 – Sep 30, 2023".
 * Returns a single day when min is empty or on the same day as max.
 */
export function windowLabel(min, max, language) {
  if (!max) {
    return "";
  }
  const end = dayLabel(max, language);
  if (!min) {
    return end;
  }
  const start = dayLabel(min, language);
  return start === end ? end : `${start} – ${end}`;
}
