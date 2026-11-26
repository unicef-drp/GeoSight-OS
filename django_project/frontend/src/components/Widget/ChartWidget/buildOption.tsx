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
   CHART WIDGET: build the ECharts option from GeoSight rows.
   Pure functions, no React and no ECharts import, so they can be unit tested
   and reused by the standalone harness.
   ========================================================================== */

import { ChartConfig } from "../../../types/Widget";
import { ChartBarLayouts, ChartTypes } from "../Definition";

/**
 * One data point.
 * Bar, donut, treemap: category = area or indicator, series = the other one
 * (stacked/grouped bars only).
 * Line, heatmap, KPI: category = date, series = area or indicator.
 */
export interface ChartRow {
  category: string;
  series: string | null;
  value: number | null;
  /** Colour from the indicator's map style (map style colours mode). */
  color?: string | null;
}

/** One area of the scatter chart. */
export interface ScatterPoint {
  name: string;
  x: number;
  y: number;
  size: number | null;
  color?: string | null;
}

export interface ChartInput {
  rows: ChartRow[];
  /** Scatter only. */
  points?: ScatterPoint[];
  /** Gauge only: the aggregated value. */
  value?: number | null;
  /** Scatter only: indicator names of the axes. */
  axisNames?: { x?: string; y?: string; size?: string };
}

/** Translated texts used inside the chart. */
export interface ChartTexts {
  other: string;
  target: string;
}

export interface BuildOptions {
  /** Formats an axis tick (the widget's format, without trailing zeros). */
  format: (value: number) => string;
  /** Formats a value: labels, tooltips, targets. Defaults to `format`. */
  formatExact?: (value: number) => string;
  /** Colour per category or series name, from the widget config. */
  colors: Record<string, string>;
  /** Accessible description of the chart. */
  description: string;
  texts: ChartTexts;
  /** Area names can be clicked (axis labels send click events too). */
  linkAreas?: boolean;
  /** Name of the area selected on the map: outlined in the chart. */
  selected?: string | null;
  /** Legend entries the viewer has hidden. */
  hidden?: string[];
  /** Colours of the palette chosen in the editor (palette mode). */
  palette?: string[];
}

export interface KpiValue {
  value: number;
  previous: number | null;
}

export interface BuiltChart {
  option: any;
  height: number;
  /** KPI only: the value shown above the sparkline. */
  kpi?: KpiValue;
  /** Legend entries, drawn by the widget below the chart. */
  legend?: LegendItem[];
}

export interface LegendItem {
  name: string;
  color: string;
}

/** Categorical fallback palette (12 slots, assigned in order). */
export const FALLBACK_COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#6250d6",
  "#e34948",
  "#0097a7",
  "#8d6e63",
  "#9e9d24",
  "#546e7a",
];

/** Maximum number of series (and donut slices) before the rest are grouped. */
export const MAX_SERIES = 12;

const AXIS_COLOR = "#d9d9d9";
const GRID_COLOR = "#ececec";
const TEXT_COLOR = "#555555";
const TARGET_COLOR = "#333333";
const GOOD_COLOR = "#1baf7a";
const TRACK_COLOR = "#ececec";
const HEAT_LOW = [232, 241, 251];
const HEAT_HIGH = [42, 120, 214];
const LINE_HEIGHT = 240;
const BAR_ROW_HEIGHT = 28;

/**
 * Keep every axis label inside the chart. ECharts 6 deprecates
 * grid.containLabel, which only estimates the size from sample labels.
 */
const LABEL_BOUNDS = {
  outerBoundsMode: "same",
  outerBoundsContain: "axisLabel",
};

/** Escape text that goes into an HTML tooltip. */
export function escapeHtml(text: string): string {
  return ("" + text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Dark or white text, whichever reads better on the colour. */
export function textColorOn(color: string | null | undefined): string {
  let r = 0,
    g = 0,
    b = 0;
  const value = ("" + (color || "")).trim();
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  const rgb = value.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (hex) {
    const full =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((char) => char + char)
            .join("")
        : hex[1];
    r = parseInt(full.substring(0, 2), 16);
    g = parseInt(full.substring(2, 4), 16);
    b = parseInt(full.substring(4, 6), 16);
  } else if (rgb) {
    r = Number(rgb[1]);
    g = Number(rgb[2]);
    b = Number(rgb[3]);
  } else {
    return "#ffffff";
  }
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const luminance =
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return luminance > 0.4 ? "#222222" : "#ffffff";
}

const exact = (opts: BuildOptions) => opts.formatExact || opts.format;

/** Colour of a name: map style, then the configured colour, then palette. */
function colorOf(
  opts: BuildOptions,
  name: string,
  index: number,
  mapColor?: string | null,
): string {
  const palette = opts.palette?.length ? opts.palette : FALLBACK_COLORS;
  return mapColor || opts.colors[name] || palette[index % palette.length];
}

/** Unique values in order of first appearance. */
function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

/** Shared parts of every chart. */
function base(opts: BuildOptions) {
  return {
    animationDuration: 300,
    // The font family is set by EChart from the page's computed font:
    // ECharts measures text itself, so "inherit" would break label layout.
    textStyle: { color: TEXT_COLOR },
    aria: { enabled: true, label: { description: opts.description } },
    tooltip: {
      confine: true,
      // Square corners and the size of the chart labels.
      borderRadius: 0,
      textStyle: { color: TEXT_COLOR, fontSize: 12 },
      valueFormatter: (value: number) =>
        value === null || value === undefined || isNaN(value)
          ? "-"
          : exact(opts)(value),
    },
  };
}

function valueAxis(opts: BuildOptions, percent: boolean = false) {
  return {
    type: "value",
    max: percent ? 100 : undefined,
    axisLabel: {
      hideOverlap: true,
      formatter: (value: number) =>
        percent ? `${value}%` : opts.format(value),
    },
    splitLine: { lineStyle: { color: GRID_COLOR, width: 1 } },
  };
}

function categoryAxis(categories: string[], horizontal: boolean) {
  return {
    type: "category",
    data: categories,
    inverse: horizontal,
    axisTick: { show: false },
    axisLine: { lineStyle: { color: AXIS_COLOR } },
    axisLabel: horizontal
      ? { width: 96, overflow: "truncate" }
      : { width: 64, overflow: "truncate", hideOverlap: true },
  };
}

/**
 * The ECharts legend is not drawn (the widget draws its own, expandable one
 * below the chart), but it still hides the entries the viewer switched off.
 */
function legend(opts: BuildOptions) {
  const selected: Record<string, boolean> = {};
  (opts.hidden || []).forEach((name) => (selected[name] = false));
  return { show: false, selected: selected };
}

const validNumber = (value: any) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  !isNaN(Number(value));

/** Dashed target line on the value axis. */
function targetLine(chart: ChartConfig, opts: BuildOptions) {
  if (!validNumber(chart.target)) {
    return undefined;
  }
  const target = Number(chart.target);
  const horizontal = chart.type === ChartTypes.BAR && !!chart.horizontal;
  return {
    silent: true,
    symbol: "none",
    lineStyle: { type: "dashed", color: TARGET_COLOR, width: 1.5 },
    label: {
      formatter: `${opts.texts.target}: ${exact(opts)(target)}`,
      // A vertical line (horizontal bars) gets its label above the line:
      // the category axis is inverted there, so the top is the "start".
      position: horizontal ? "start" : "insideEndTop",
      color: TARGET_COLOR,
    },
    data: [horizontal ? { xAxis: target } : { yAxis: target }],
  };
}

/** Room above the grid for the target label of horizontal bars. */
function targetTop(chart: ChartConfig): number {
  return chart.horizontal && validNumber(chart.target) ? 24 : 8;
}

/** Bar chart, simple: one bar per category, in the order given. */
function buildBarSimple(
  chart: ChartConfig,
  rows: ChartRow[],
  opts: BuildOptions,
): BuiltChart {
  const horizontal = !!chart.horizontal;
  const categories = rows.map((row) => row.category);
  const option = {
    ...base(opts),
    grid: {
      left: 8,
      right: 24,
      top: targetTop(chart),
      bottom: 8,
      ...LABEL_BOUNDS,
    },
    tooltip: {
      ...base(opts).tooltip,
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: horizontal ? valueAxis(opts) : categoryAxis(categories, false),
    yAxis: horizontal ? categoryAxis(categories, true) : valueAxis(opts),
    series: [
      {
        type: "bar",
        barMaxWidth: 24,
        label: {
          show: !!chart.labels,
          position: horizontal ? "right" : "top",
          formatter: (params: any) => exact(opts)(params.value),
        },
        markLine: targetLine(chart, opts),
        // Palette: one colour per bar, so the chosen palette shows.
        data: rows.map((row, index) => ({
          value: row.value,
          itemStyle: {
            color: colorOf(opts, row.category, index, row.color),
          },
        })),
      },
    ],
  };
  const height = horizontal
    ? Math.max(160, categories.length * BAR_ROW_HEIGHT + 40)
    : LINE_HEIGHT;
  return { option, height };
}

/**
 * Bar chart with series: stacked, grouped or 100% stacked.
 * Categories keep the order given; series are capped by the caller.
 */
function buildBarMulti(
  chart: ChartConfig,
  rows: ChartRow[],
  opts: BuildOptions,
): BuiltChart {
  const horizontal = !!chart.horizontal;
  const layout = chart.layout;
  const percent = layout === ChartBarLayouts.PERCENT;
  const stacked = percent || layout === ChartBarLayouts.STACKED;
  const categories = unique(rows.map((row) => row.category));
  const names = unique(rows.map((row) => row.series || ""));

  const values: Record<string, Record<string, number>> = {};
  // Map style: a colour per segment, from the value in its indicator style.
  const segmentColors: Record<string, Record<string, string>> = {};
  const totals: Record<string, number> = {};
  rows.forEach((row) => {
    const name = row.series || "";
    if (!values[name]) {
      values[name] = {};
      segmentColors[name] = {};
    }
    values[name][row.category] = Number(row.value);
    if (row.color) {
      segmentColors[name][row.category] = row.color;
    }
    totals[row.category] = (totals[row.category] || 0) + Number(row.value);
  });

  const series = names.map((name, index) => ({
    type: "bar",
    name: name,
    stack: stacked ? "total" : undefined,
    barMaxWidth: 24,
    color: colorOf(opts, name, index),
    itemStyle: stacked ? { borderColor: "#ffffff", borderWidth: 1 } : {},
    label: {
      show: !!chart.labels,
      position: stacked ? "inside" : horizontal ? "right" : "top",
      fontSize: 10,
      formatter: (params: any) =>
        percent ? `${Math.round(params.value)}%` : exact(opts)(params.value),
    },
    markLine: index === 0 && !percent ? targetLine(chart, opts) : undefined,
    data: categories.map((category) => {
      const value = values[name][category];
      if (value === undefined || isNaN(value)) {
        return null;
      }
      const shown = percent
        ? totals[category]
          ? (value / totals[category]) * 100
          : 0
        : value;
      const color = segmentColors[name][category];
      return color ? { value: shown, itemStyle: { color } } : shown;
    }),
  }));

  const multi = names.length > 1;
  const option = {
    ...base(opts),
    grid: {
      left: 8,
      right: 24,
      top: percent ? 8 : targetTop(chart),
      bottom: 8,
      ...LABEL_BOUNDS,
    },
    tooltip: {
      ...base(opts).tooltip,
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value: number) =>
        value === null || value === undefined || isNaN(value)
          ? "-"
          : percent
            ? `${value.toFixed(1)}%`
            : exact(opts)(value),
    },
    legend: legend(opts),
    xAxis: horizontal
      ? valueAxis(opts, percent)
      : categoryAxis(categories, false),
    yAxis: horizontal
      ? categoryAxis(categories, true)
      : valueAxis(opts, percent),
    series: series,
  };
  const rowHeight =
    layout === ChartBarLayouts.GROUPED
      ? Math.max(BAR_ROW_HEIGHT, names.length * 12 + 12)
      : BAR_ROW_HEIGHT;
  const height = horizontal
    ? Math.max(160, categories.length * rowHeight + 40)
    : LINE_HEIGHT;
  // Map style colours vary within a series: no series legend then.
  const bySegment = rows.some((row) => row.color);
  const items =
    multi && !bySegment
      ? names.map((name, index) => ({
          name,
          color: colorOf(opts, name, index),
        }))
      : undefined;
  return { option, height, legend: items };
}

/** Line chart: x = date, one line per series. */
function buildLine(
  chart: ChartConfig,
  rows: ChartRow[],
  opts: BuildOptions,
): BuiltChart {
  const bySeries: Record<string, [string, number | null][]> = {};
  rows.forEach((row) => {
    const name = row.series || "";
    if (!bySeries[name]) {
      bySeries[name] = [];
    }
    bySeries[name].push([row.category, row.value]);
  });
  const names = Object.keys(bySeries);
  const multi = names.length > 1;
  const series = names.map((name, index) => {
    const data = bySeries[name].sort((a, b) => a[0].localeCompare(b[0]));
    return {
      type: "line",
      name: name,
      data: data,
      color: colorOf(opts, name, index),
      showSymbol: data.length <= 24,
      symbolSize: 8,
      lineStyle: { width: 2, cap: "round", join: "round" },
      itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
      areaStyle: chart.area ? { opacity: 0.15 } : undefined,
      label: {
        show: !!chart.labels,
        formatter: (params: any) => exact(opts)(params.value[1]),
      },
    };
  });
  const option = {
    ...base(opts),
    grid: {
      left: 8,
      right: 16,
      top: 12,
      bottom: 8,
      ...LABEL_BOUNDS,
    },
    tooltip: {
      ...base(opts).tooltip,
      trigger: "axis",
      axisPointer: { type: "line" },
    },
    legend: legend(opts),
    xAxis: {
      type: "time",
      axisLine: { lineStyle: { color: AXIS_COLOR } },
      axisLabel: { hideOverlap: true },
      splitLine: { show: false },
    },
    yAxis: valueAxis(opts),
    series: series,
  };
  const items = multi
    ? names.map((name, index) => ({
        name,
        color: colorOf(opts, name, index),
      }))
    : undefined;
  return { option, height: LINE_HEIGHT, legend: items };
}

/** Donut: the largest slices, the rest grouped as "Other". */
function buildDonut(
  chart: ChartConfig,
  rows: ChartRow[],
  opts: BuildOptions,
): BuiltChart {
  // Slices keep the order of the widget's sort; past the maximum, the
  // smallest values are grouped as "Other" (last).
  const positive = rows.filter((row) => Number(row.value) > 0);
  let slices = positive;
  if (positive.length > MAX_SERIES) {
    const largest = [...positive]
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, MAX_SERIES - 1);
    const rest = positive.filter((row) => !largest.includes(row));
    slices = [
      ...positive.filter((row) => largest.includes(row)),
      {
        category: opts.texts.other,
        series: null,
        value: rest.reduce((total, row) => total + Number(row.value), 0),
        color: "#9e9e9e",
      },
    ];
  }
  const option = {
    ...base(opts),
    tooltip: { ...base(opts).tooltip, trigger: "item" },
    legend: legend(opts),
    series: [
      {
        type: "pie",
        radius: ["50%", "80%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
        // Labels inside the ring: outside labels run off narrow screens.
        label: {
          show: !!chart.labels,
          position: "inside",
          fontSize: 11,
          formatter: (params: any) =>
            params.percent >= 5 ? `${Math.round(params.percent)}%` : "",
        },
        labelLine: { show: false },
        data: slices.map((row, index) => {
          const color = colorOf(opts, row.category, index, row.color);
          return {
            name: row.category,
            value: row.value,
            itemStyle: { color: color },
            label: { color: textColorOn(color) },
          };
        }),
      },
    ],
  };
  const items = slices.map((row, index) => ({
    name: row.category,
    color: colorOf(opts, row.category, index, row.color),
  }));
  return { option, height: 240, legend: items };
}

/** Treemap: one rectangle per category, sized by value. */
function buildTreemap(
  chart: ChartConfig,
  rows: ChartRow[],
  opts: BuildOptions,
): BuiltChart {
  const positive = rows.filter((row) => Number(row.value) > 0);
  const option = {
    ...base(opts),
    tooltip: { ...base(opts).tooltip, trigger: "item" },
    series: [
      {
        type: "treemap",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        roam: false,
        nodeClick: false,
        // Keep the order of the widget's sort.
        sort: false,
        breadcrumb: { show: false },
        itemStyle: { borderColor: "#ffffff", borderWidth: 2, gapWidth: 2 },
        label: {
          show: true,
          overflow: "truncate",
          formatter: (params: any) =>
            chart.labels
              ? `${params.name}\n${exact(opts)(params.value)}`
              : params.name,
        },
        data: positive.map((row, index) => {
          const color = colorOf(opts, row.category, index, row.color);
          return {
            name: row.category,
            value: row.value,
            itemStyle: { color: color },
            label: { color: textColorOn(color) },
          };
        }),
      },
    ],
  };
  return { option, height: 260 };
}

/** Linear colour between the light and dark ends of the heatmap scale. */
export function heatColor(ratio: number): string {
  const safe = Math.max(0, Math.min(1, isNaN(ratio) ? 0 : ratio));
  const channel = (index: number) =>
    Math.round(HEAT_LOW[index] + (HEAT_HIGH[index] - HEAT_LOW[index]) * safe);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/** Colour at `ratio` (0–1) along the stops of a palette (hex colours). */
export function paletteColor(ratio: number, stops: string[]): string {
  const safe = Math.max(0, Math.min(1, isNaN(ratio) ? 0 : ratio));
  const rgb = (hex: string) => {
    const value = hex.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(value.substring(i, i + 2), 16));
  };
  if (stops.length === 1) {
    return stops[0];
  }
  const position = safe * (stops.length - 1);
  const index = Math.min(Math.floor(position), stops.length - 2);
  const [low, high] = [rgb(stops[index]), rgb(stops[index + 1])];
  const local = position - index;
  const channel = (i: number) =>
    Math.round(low[i] + (high[i] - low[i]) * local);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/** Heatmap: rows = series (areas or indicators), columns = dates. */
function buildHeatmap(
  chart: ChartConfig,
  rows: ChartRow[],
  opts: BuildOptions,
): BuiltChart {
  const periods = unique(rows.map((row) => row.category)).sort();
  const names = unique(rows.map((row) => row.series || ""));
  const numbers = rows.map((row) => Number(row.value));
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  // ECharts needs a visualMap for a heatmap: a hidden piecewise one maps the
  // 4th value (an index into `colors`) to the colour of each cell.
  const colors: string[] = [];
  const data = rows.map((row) => {
    const ratio = max === min ? 1 : (Number(row.value) - min) / (max - min);
    // Map style colour, else the palette as a scale, else blue.
    const color =
      row.color ||
      (opts.palette?.length
        ? paletteColor(ratio, opts.palette)
        : heatColor(ratio));
    if (colors.indexOf(color) === -1) {
      colors.push(color);
    }
    return {
      name: row.series || "",
      value: [
        periods.indexOf(row.category),
        names.indexOf(row.series || ""),
        row.value,
        colors.indexOf(color),
      ],
      itemStyle: { borderColor: "#ffffff", borderWidth: 1 },
    };
  });
  const option = {
    ...base(opts),
    grid: { left: 8, right: 8, top: 8, bottom: 8, ...LABEL_BOUNDS },
    tooltip: {
      ...base(opts).tooltip,
      trigger: "item",
      formatter: (params: any) => {
        const [x, y, value] = params.value;
        return (
          `${escapeHtml(names[y])}<br/>${escapeHtml(periods[x])}: ` +
          `<b>${escapeHtml(exact(opts)(value))}</b>`
        );
      },
    },
    xAxis: {
      type: "category",
      data: periods,
      splitArea: { show: false },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: AXIS_COLOR } },
      axisLabel: { hideOverlap: true },
    },
    yAxis: {
      type: "category",
      data: names,
      inverse: true,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { width: 96, overflow: "truncate" },
    },
    visualMap: {
      type: "piecewise",
      show: false,
      dimension: 3,
      seriesIndex: 0,
      pieces: colors.map((color, index) => ({ value: index, color: color })),
    },
    series: [
      {
        type: "heatmap",
        data: data,
        label: {
          show: !!chart.labels,
          fontSize: 10,
          formatter: (params: any) => exact(opts)(params.value[2]),
        },
      },
    ],
  };
  return { option, height: Math.max(160, names.length * 24 + 60) };
}

/** Point size in px from the size value (area-proportional, 8 to 32). */
function pointSize(size: number | null, maxSize: number): number {
  if (size === null || isNaN(size) || maxSize <= 0) {
    return 10;
  }
  return 8 + 24 * Math.sqrt(Math.max(0, size) / maxSize);
}

/** Scatter: one point per area; optional pulse on the selected area. */
function buildScatter(
  chart: ChartConfig,
  points: ScatterPoint[],
  axisNames: ChartInput["axisNames"],
  opts: BuildOptions,
): BuiltChart {
  const maxSize = Math.max(0, ...points.map((point) => point.size || 0));
  const toData = (point: ScatterPoint) => ({
    name: point.name,
    value: [point.x, point.y, point.size],
    symbolSize: pointSize(point.size, maxSize),
    // Map style colour, else the area's custom colour, else the palette.
    itemStyle: {
      color: colorOf(opts, point.name, points.indexOf(point), point.color),
      opacity: 0.85,
    },
  });
  // Pulse: the area selected on the map (nothing when none is selected).
  const top =
    chart.pulse && opts.selected
      ? points.filter((point) => point.name === opts.selected)
      : [];
  const names = axisNames || {};
  const tooltip = (params: any) => {
    const [x, y, size] = params.value;
    const lines = [
      `<b>${escapeHtml(params.name)}</b>`,
      `${escapeHtml(names.x || "x")}: ${escapeHtml(exact(opts)(x))}`,
      `${escapeHtml(names.y || "y")}: ${escapeHtml(exact(opts)(y))}`,
    ];
    if (validNumber(size) && names.size) {
      lines.push(`${escapeHtml(names.size)}: ${escapeHtml(exact(opts)(size))}`);
    }
    return lines.join("<br/>");
  };
  const axis = (name: string | undefined) => ({
    ...valueAxis(opts),
    name: name,
    nameLocation: "middle",
    nameGap: 24,
    nameTextStyle: { color: TEXT_COLOR },
    scale: true,
  });
  const series: any[] = [
    {
      type: "scatter",
      data: points.map(toData),
      label: {
        show: !!chart.labels,
        position: "right",
        fontSize: 10,
        formatter: (params: any) => params.name,
      },
    },
  ];
  if (top.length) {
    series.push({
      type: "effectScatter",
      data: top.map(toData),
      rippleEffect: { scale: 2.5, brushType: "stroke", period: 3 },
      z: 3,
    });
  }
  const option = {
    ...base(opts),
    // Axis names are part of the layout too, so nothing is clipped.
    grid: {
      left: 8,
      right: 16,
      top: 16,
      bottom: 8,
      outerBoundsMode: "same",
      outerBoundsContain: "all",
    },
    tooltip: { ...base(opts).tooltip, trigger: "item", formatter: tooltip },
    xAxis: axis(names.x),
    yAxis: { ...axis(names.y), nameGap: 36, nameRotate: 90 },
    series: series,
  };
  return { option, height: 280 };
}

/** A round maximum at or above the value, for the gauge scale. */
export function niceMax(value: number): number {
  if (!value || value <= 0) {
    return 1;
  }
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  for (const step of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (step * magnitude >= value) {
      return step * magnitude;
    }
  }
  return 10 * magnitude;
}

/** Gauge: one value on an arc, with an optional target mark. */
function buildGauge(
  chart: ChartConfig,
  value: number,
  opts: BuildOptions,
): BuiltChart {
  const hasTarget = validNumber(chart.target);
  const target = hasTarget ? Number(chart.target) : 0;
  const min = validNumber(chart.min) ? Number(chart.min) : 0;
  const max = validNumber(chart.max)
    ? Number(chart.max)
    : niceMax(Math.max(value, target) * 1.1);
  const reached = hasTarget && value >= target;
  let track: any[] = [[1, TRACK_COLOR]];
  if (hasTarget && max > min) {
    const at = Math.max(0, Math.min(1, (target - min) / (max - min)));
    track = [
      [Math.max(0, at - 0.004), TRACK_COLOR],
      [Math.min(1, at + 0.004), TARGET_COLOR],
      [1, TRACK_COLOR],
    ];
  }
  const option = {
    ...base(opts),
    tooltip: { show: false },
    series: [
      {
        type: "gauge",
        min: min,
        max: max,
        startAngle: 200,
        endAngle: -20,
        radius: "92%",
        center: ["50%", "58%"],
        progress: {
          show: true,
          width: 14,
          itemStyle: { color: reached ? GOOD_COLOR : FALLBACK_COLORS[0] },
        },
        axisLine: { lineStyle: { width: 14, color: track } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        splitNumber: 1,
        axisLabel: {
          distance: 20,
          color: TEXT_COLOR,
          fontSize: 11,
          formatter: (label: number) => opts.format(label),
        },
        title: { show: hasTarget, offsetCenter: [0, "38%"], fontSize: 12 },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, "4%"],
          fontSize: 26,
          fontWeight: 600,
          color: "#222222",
          formatter: (detail: number) => exact(opts)(detail),
        },
        data: [
          {
            value: value,
            name: hasTarget
              ? `${opts.texts.target}: ${exact(opts)(target)}`
              : "",
          },
        ],
      },
    ],
  };
  return { option, height: 220 };
}

/** KPI: the latest value, its change and a sparkline of all dates. */
function buildKpi(rows: ChartRow[], opts: BuildOptions): BuiltChart {
  const data = [...rows]
    .sort((a, b) => a.category.localeCompare(b.category))
    .map((row) => [row.category, row.value]);
  const last = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;
  const option = {
    ...base(opts),
    grid: { left: 2, right: 2, top: 4, bottom: 4 },
    tooltip: { ...base(opts).tooltip, trigger: "axis" },
    xAxis: { type: "time", show: false },
    yAxis: { type: "value", show: false, scale: true },
    series: [
      {
        type: "line",
        data: data,
        color: FALLBACK_COLORS[0],
        showSymbol: false,
        lineStyle: { width: 2, cap: "round", join: "round" },
        areaStyle: { opacity: 0.12 },
      },
    ],
  };
  return {
    option,
    height: data.length > 1 ? 56 : 0,
    kpi: {
      value: Number(last[1]),
      previous: previous ? Number(previous[1]) : null,
    },
  };
}

/* --------------------------------------------------------------------------
   Advanced overrides
   -------------------------------------------------------------------------- */

/**
 * Keys that are never taken from the overrides: they can carry HTML, CSS or
 * URLs (tooltips render HTML), so a dashboard editor could inject content
 * that runs for every viewer.
 */
export const BLOCKED_OVERRIDE_KEYS = [
  "formatter",
  "valueFormatter",
  "renderMode",
  "extraCssText",
  "className",
  "appendTo",
  "appendToBody",
  "link",
  "sublink",
  "image",
  "backgroundImage",
  "__proto__",
  "constructor",
  "prototype",
];

/** Return a copy of the overrides with only JSON values and no blocked keys. */
export function sanitizeOverrides(value: any): any {
  if (Array.isArray(value)) {
    return value.map(sanitizeOverrides);
  }
  if (value !== null && typeof value === "object") {
    const output: Record<string, any> = {};
    Object.keys(value).forEach((key) => {
      if (BLOCKED_OVERRIDE_KEYS.includes(key)) {
        return;
      }
      output[key] = sanitizeOverrides(value[key]);
    });
    return output;
  }
  if (["string", "number", "boolean"].includes(typeof value)) {
    return value;
  }
  return null;
}

const isObject = (value: any) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Merge the overrides into the option. Objects merge deeply; an array of
 * objects merges item by item (e.g. series[0]); anything else replaces.
 */
export function mergeOverrides(option: any, overrides: any): any {
  if (overrides === undefined) {
    return option;
  }
  if (isObject(option) && isObject(overrides)) {
    const output = { ...option };
    Object.keys(overrides).forEach((key) => {
      output[key] = mergeOverrides(option[key], overrides[key]);
    });
    return output;
  }
  if (Array.isArray(option) && Array.isArray(overrides)) {
    const length = Math.max(option.length, overrides.length);
    const output = [];
    for (let index = 0; index < length; index++) {
      output.push(
        index < overrides.length
          ? mergeOverrides(option[index], overrides[index])
          : option[index],
      );
    }
    return output;
  }
  if (isObject(option) && Array.isArray(overrides) && overrides.length) {
    // e.g. xAxis is one object, the override gives [ {...} ]
    return mergeOverrides(option, overrides[0]);
  }
  return overrides;
}

/* --------------------------------------------------------------------------
   Entry points
   -------------------------------------------------------------------------- */

/** Return the ECharts option and height, or null when there is no data. */
export function buildChartOption(
  chart: ChartConfig,
  input: ChartInput,
  opts: BuildOptions,
): BuiltChart | null {
  let built: BuiltChart | null = null;
  const rows = (input.rows || []).filter((row) => validNumber(row.value));
  switch (chart.type) {
    case ChartTypes.SCATTER: {
      const points = (input.points || []).filter(
        (point) => validNumber(point.x) && validNumber(point.y),
      );
      if (points.length) {
        built = buildScatter(chart, points, input.axisNames, opts);
      }
      break;
    }
    case ChartTypes.GAUGE:
      if (validNumber(input.value)) {
        built = buildGauge(chart, Number(input.value), opts);
      }
      break;
    default:
      if (!rows.length) {
        break;
      }
      if (chart.type === ChartTypes.LINE) {
        built = buildLine(chart, rows, opts);
      } else if (chart.type === ChartTypes.DONUT) {
        built = buildDonut(chart, rows, opts);
      } else if (chart.type === ChartTypes.TREEMAP) {
        built = buildTreemap(chart, rows, opts);
      } else if (chart.type === ChartTypes.HEATMAP) {
        built = buildHeatmap(chart, rows, opts);
      } else if (chart.type === ChartTypes.KPI) {
        built = buildKpi(rows, opts);
      } else if (
        chart.layout &&
        chart.layout !== ChartBarLayouts.SIMPLE &&
        rows.some((row) => row.series !== null)
      ) {
        built = buildBarMulti(chart, rows, opts);
      } else {
        built = buildBarSimple(chart, rows, opts);
      }
  }
  if (built) {
    markAreas(built.option, opts);
  }
  if (built && isObject(chart.overrides)) {
    built.option = mergeOverrides(
      built.option,
      sanitizeOverrides(chart.overrides),
    );
  }
  return built;
}

const SELECTED_COLOR = "#222222";

/** Axes of an option as a list (an axis can be one object or a list). */
function axesOf(option: any): any[] {
  return [option.xAxis, option.yAxis]
    .filter(Boolean)
    .flatMap((axis: any) => (Array.isArray(axis) ? axis : [axis]));
}

/**
 * Linked areas: category axis labels send click events, and the area
 * selected on the map is outlined (bars, slices, tiles, points, cells) or
 * drawn thicker (lines), with its axis label in bold.
 */
export function markAreas(option: any, opts: BuildOptions) {
  const selected = opts.selected;
  const categoryAxes = axesOf(option).filter(
    (axis: any) => axis.type === "category",
  );
  if (opts.linkAreas) {
    categoryAxes.forEach((axis: any) => (axis.triggerEvent = true));
  }
  if (!selected) {
    return;
  }
  const outline = { borderColor: SELECTED_COLOR, borderWidth: 2 };
  categoryAxes.forEach((axis: any) => {
    if (!(axis.data || []).includes(selected)) {
      return;
    }
    const label = axis.axisLabel || {};
    axis.axisLabel = {
      ...label,
      formatter: (value: string) =>
        value === selected ? `{selected|${value}}` : value,
      rich: { selected: { fontWeight: "bold", color: SELECTED_COLOR } },
    };
  });
  // Index of the selected category on the category axis of bar charts.
  const barAxis = categoryAxes.find((axis: any) =>
    (axis.data || []).includes(selected),
  );
  const barIndex = barAxis ? barAxis.data.indexOf(selected) : -1;
  (option.series || []).forEach((series: any) => {
    const items: any[] = series.data || [];
    if (series.name === selected) {
      if (series.type === "line") {
        series.lineStyle = { ...(series.lineStyle || {}), width: 4 };
        series.z = 10;
      } else {
        series.itemStyle = { ...(series.itemStyle || {}), ...outline };
      }
    }
    items.forEach((item: any, index: number) => {
      const isSelected =
        (isObject(item) && item.name === selected) ||
        (series.type === "bar" && index === barIndex);
      if (!isSelected) {
        return;
      }
      const data = isObject(item) ? item : { value: item };
      data.itemStyle = { ...(data.itemStyle || {}), ...outline };
      items[index] = data;
    });
  });
}

/**
 * Keep the series with the highest latest value, at most `max`.
 * Returns the kept rows and how many series were dropped.
 */
export function limitSeries(
  rows: ChartRow[],
  max: number = MAX_SERIES,
): { rows: ChartRow[]; dropped: number } {
  const latest: Record<string, { date: string; value: number }> = {};
  rows.forEach((row) => {
    const name = row.series || "";
    const current = latest[name];
    if (!current || row.category > current.date) {
      latest[name] = { date: row.category, value: Number(row.value) || 0 };
    }
  });
  const names = Object.keys(latest);
  if (names.length <= max) {
    return { rows, dropped: 0 };
  }
  const kept = names
    .sort((a, b) => latest[b].value - latest[a].value)
    .slice(0, max);
  return {
    rows: rows.filter((row) => kept.includes(row.series || "")),
    dropped: names.length - max,
  };
}
