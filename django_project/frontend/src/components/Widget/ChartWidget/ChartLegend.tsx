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
   CHART LEGEND
   The legend below a chart: the first entries, and a button that shows all
   of them. Each entry is a toggle that hides or shows its series or slice.
   ========================================================================== */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LegendItem } from "./buildOption";

/** Entries shown before "Show all". */
export const LEGEND_COLLAPSED = 6;

export interface Props {
  items: LegendItem[];
  hidden: string[];
  onToggle: (name: string) => void;
}

export default function ChartLegend({ items, hidden, onToggle }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<boolean>(false);
  const canExpand = items.length > LEGEND_COLLAPSED;
  const shown =
    expanded || !canExpand ? items : items.slice(0, LEGEND_COLLAPSED);
  return (
    <div
      className={"widget__chart__legend" + (expanded ? " Expanded" : "")}
      data-testid="chart-legend"
    >
      <ul>
        {shown.map((item) => {
          const off = hidden.includes(item.name);
          return (
            <li key={item.name}>
              <button
                type="button"
                aria-pressed={!off}
                className={off ? "Off" : ""}
                title={item.name}
                onClick={() => onToggle(item.name)}
              >
                <span
                  className="widget__chart__legend__swatch"
                  style={{ background: item.color }}
                  aria-hidden="true"
                />
                <span className="widget__chart__legend__name">{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {canExpand && (
        <button
          type="button"
          className="widget__chart__legend__more"
          aria-expanded={expanded}
          data-testid="chart-legend-more"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? t("dashboardPage.widget.legendShowLess")
            : t("dashboardPage.widget.legendShowAll", { count: items.length })}
        </button>
      )}
    </div>
  );
}
