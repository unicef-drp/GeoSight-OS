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
   Time track: all data dates on one axis, year ticks, range brackets.
   Dragging snaps to the data dates inside the range.
   ========================================================================== */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Slider from "@mui/material/Slider";
import { dateLabel, getDatesInRange } from "../../../../../utils/Dates";
import { periodLabel } from "../utils";

import "./style.scss";

/** Maximum number of year labels under the track. */
const MAX_YEAR_TICKS = 8;

/**
 * Time track.
 * @param {string[]} dates All data dates for the current interval (sorted).
 * @param {string} minDate Range start.
 * @param {string} maxDate Range end.
 * @param {string} selectedDatePoint Current date.
 * @param {string} interval Current interval.
 * @param {function} onSelect Called with the picked data date.
 * @param {boolean} mini Small, read-only track (mobile card).
 */
export default function TimeTrack(
  { dates, minDate, maxDate, selectedDatePoint, interval, onSelect, mini }
) {
  const { t, i18n } = useTranslation();

  // Every period between the first and the last data date.
  const domain = useMemo(() => {
    if (!dates.length) {
      return [];
    }
    return getDatesInRange(
      new Date(dates[0]), new Date(dates[dates.length - 1]), interval
    );
  }, [dates, interval]);

  const count = domain.length;
  const indexOf = (date) => domain.indexOf(dateLabel(new Date(date), interval));
  const position = (idx) => (count <= 1 ? 50 : (idx / (count - 1)) * 100);

  const inRange = (date) => date >= minDate && date <= maxDate;
  const marks = dates
    .filter(inRange)
    .map((date) => ({ value: indexOf(date), date }))
    .filter((mark) => mark.value >= 0);
  const outside = dates
    .filter((date) => !inRange(date))
    .map(indexOf)
    .filter((idx) => idx >= 0);

  // Year ticks, thinned out to at most MAX_YEAR_TICKS labels.
  const years = useMemo(() => {
    if (count <= 1) {
      return [];
    }
    const first = new Date(dates[0]).getUTCFullYear();
    const last = new Date(dates[dates.length - 1]).getUTCFullYear();
    const ticks = [];
    for (let year = first; year <= last; year++) {
      const idx = domain.indexOf(
        dateLabel(new Date(Date.UTC(year, 0, 1)), interval)
      );
      if (idx >= 0) {
        ticks.push({ year, idx });
      }
    }
    const step = Math.ceil(ticks.length / MAX_YEAR_TICKS);
    return ticks.filter((tick) => (tick.year - first) % step === 0);
  }, [domain]);

  const value = indexOf(selectedDatePoint);
  const single = count <= 1;
  const labelOf = (idx) => {
    const mark = marks.find((m) => m.value === idx);
    return mark ? periodLabel(mark.date, interval, i18n.language) : "";
  };

  if (mini) {
    return (
      <div className="TimeTrackMini" aria-hidden="true">
        {marks.map((mark) => (
          <span
            key={mark.date}
            className={mark.date === selectedDatePoint ? "Selected" : ""}
            style={{ left: position(mark.value) + "%" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={"TimeTrack" + (single ? " Single" : "")}>
      <div className="TimeTrackRail">
        {outside.map((idx) => (
          <span
            key={"out-" + idx}
            className="TimeTrackOutside"
            style={{ left: position(idx) + "%" }}
          />
        ))}
        {!single && (
          <>
            <span
              className="TimeTrackBracket"
              aria-hidden="true"
              style={{ left: position(indexOf(minDate)) + "%" }}
            />
            <span
              className="TimeTrackBracket"
              aria-hidden="true"
              style={{ left: position(indexOf(maxDate)) + "%" }}
            />
          </>
        )}
        <Slider
          aria-label={t("dashboardPage.timeSlider.date")}
          value={single ? 0 : Math.max(value, 0)}
          min={0}
          max={single ? 1 : count - 1}
          step={null}
          marks={single ? [{ value: 0 }] : marks}
          disabled={marks.length <= 1}
          valueLabelDisplay="auto"
          valueLabelFormat={labelOf}
          getAriaValueText={labelOf}
          onChange={(evt, newValue) => {
            const mark = marks.find((m) => m.value === newValue);
            if (mark && mark.date !== selectedDatePoint) {
              onSelect(mark.date);
            }
          }}
        />
      </div>
      <div className="TimeTrackYears" aria-hidden="true">
        {years.map((tick) => (
          <span key={tick.year} style={{ left: position(tick.idx) + "%" }}>
            {tick.year}
          </span>
        ))}
      </div>
    </div>
  );
}
