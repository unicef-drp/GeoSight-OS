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
   WIDGET TYPE TILES
   One grid for every widget a user can add: the value (summary), the chart
   types and the text. Time series is shown only for widgets that already
   are time series (new ones use the line chart).
   ========================================================================== */

import React from "react";
import { useTranslation } from "react-i18next";
import { FormControl } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import { ChartTypes } from "../Definition";

/** Tiles that are not chart types. */
export const WidgetTiles = {
  VALUE: "value",
  TEXT: "text",
  TIME_SERIES: "time-series",
};

/** 24px icons of the tiles (1.5 stroke). */
/** 24px icons of the type cards (1.5 stroke). */
const ICONS: Record<string, React.ReactNode> = {
  [WidgetTiles.VALUE]: (
    <>
      <path d="M10 4L8 20M16 4l-2 16M5 9h15M4 15h15" />
    </>
  ),
  [WidgetTiles.TEXT]: (
    <>
      <path d="M5 6h14M12 6v12M9 18h6" />
    </>
  ),
  [WidgetTiles.TIME_SERIES]: (
    <>
      <path d="M4 4v16h16" />
      <path d="M7 15l3-4 3 2 5-6" />
    </>
  ),
  [ChartTypes.BAR]: (
    <>
      <path d="M4 6h10M4 12h15M4 18h7" strokeWidth="3" />
    </>
  ),
  [ChartTypes.LINE]: <path d="M3 17l5-6 4 3 4-7 5 5" />,
  [ChartTypes.DONUT]: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4v4.5M19.2 15.5l-3.9-1.8" />
    </>
  ),
  [ChartTypes.SCATTER]: (
    <>
      <path d="M4 4v16h16" />
      <circle cx="9" cy="14" r="1.5" />
      <circle cx="13" cy="9" r="2.5" />
      <circle cx="18" cy="12" r="1.5" />
    </>
  ),
  [ChartTypes.HEATMAP]: (
    <>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" fill="currentColor" />
      <rect x="4" y="13" width="7" height="7" fill="currentColor" />
      <rect x="13" y="13" width="7" height="7" />
    </>
  ),
  [ChartTypes.TREEMAP]: (
    <>
      <rect x="4" y="4" width="16" height="16" />
      <path d="M12 4v16M12 13h8M4 11h8" />
    </>
  ),
  [ChartTypes.GAUGE]: (
    <>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M12 16l4-5" />
    </>
  ),
  [ChartTypes.KPI]: (
    <>
      <path d="M4 7h7M4 11h4" strokeWidth="2.5" />
      <path d="M4 18l5-3 4 2 7-5" />
    </>
  ),
};

export interface Props {
  /** The selected tile: a chart type or one of WidgetTiles. */
  value: string;
  onChange: (tile: string) => void;
  /** Show the time series tile (only for existing time series widgets). */
  showTimeSeries?: boolean;
}

/** Test id of a tile: chart types keep their chart-type-* ids. */
function testId(tile: string): string {
  return Object.values(ChartTypes).includes(tile)
    ? `chart-type-${tile}`
    : `widget-type-${tile}`;
}

export function WidgetTypeTiles({ value, onChange, showTimeSeries }: Props) {
  const { t } = useTranslation();
  const labels: Record<string, string> = {
    [WidgetTiles.VALUE]: t("admin.widget.typeValue"),
    [WidgetTiles.TEXT]: t("admin.widget.typeText"),
    [WidgetTiles.TIME_SERIES]: t("admin.widget.typeTimeSeries"),
    [ChartTypes.BAR]: t("admin.widget.chartBar"),
    [ChartTypes.LINE]: t("admin.widget.chartLine"),
    [ChartTypes.DONUT]: t("admin.widget.chartDonut"),
    [ChartTypes.SCATTER]: t("admin.widget.chartScatter"),
    [ChartTypes.HEATMAP]: t("admin.widget.chartHeatmap"),
    [ChartTypes.TREEMAP]: t("admin.widget.chartTreemap"),
    [ChartTypes.GAUGE]: t("admin.widget.chartGauge"),
    [ChartTypes.KPI]: t("admin.widget.chartKpi"),
  };
  const tiles = [
    WidgetTiles.VALUE,
    ...Object.values(ChartTypes),
    WidgetTiles.TEXT,
    ...(showTimeSeries ? [WidgetTiles.TIME_SERIES] : []),
  ];
  return (
    <FormControl className="MuiForm-RadioGroup ChartConfig WidgetTypeTiles">
      <FormLabel className="MuiInputLabel-root" id="widget-type-label">
        {t("admin.widget.widgetType")}
      </FormLabel>
      <div
        className="ChartConfig-Types"
        role="radiogroup"
        aria-labelledby="widget-type-label"
      >
        {tiles.map((tile) => (
          <button
            key={tile}
            type="button"
            role="radio"
            aria-checked={value === tile}
            className={"ChartConfig-Type" + (value === tile ? " Selected" : "")}
            data-testid={testId(tile)}
            onClick={() => onChange(tile)}
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {ICONS[tile]}
            </svg>
            <span>{labels[tile]}</span>
          </button>
        ))}
      </div>
    </FormControl>
  );
}
