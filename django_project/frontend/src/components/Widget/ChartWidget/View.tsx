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
   CHART WIDGET VIEW
   Data comes from the generic widget controls (RequestParameter) and the
   indicator data statistic endpoint; rendering is done by ECharts.
   ========================================================================== */

import React, { Fragment, memo, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";

import { ChartConfig, UnitConfig, Widget } from "../../../types/Widget";
import { Indicator } from "../../../types/Indicator";
import { IndicatorData, ParameterProps } from "../../../class/IndicatorData";
import { Session } from "../../../utils/Sessions";
import { formatNumber } from "../../../utils/Utilities";
import { UpdateStyleData } from "../../../utils/indicatorData";
// @ts-ignore
import { updateColorPaletteData } from "../../../utils/Style";
import RequestParameter from "../GenericWidget/RequestParameter";
import { useAreaLink } from "../areaLink";
import {
  ChartColorModes,
  ChartPeriods,
  ChartTypes,
  DEFAULT_CHART_CONFIG,
  SeriesType,
  SortMethodTypes,
  SortTypes,
} from "../Definition";
import {
  buildChartOption,
  ChartInput,
  ChartRow,
  limitSeries,
  MAX_SERIES,
  ScatterPoint,
} from "./buildOption";
import EChart from "./EChart";
import ChartLegend from "./ChartLegend";
import {
  chartConfig,
  isMultiBar,
  needsOneIndicator,
  showsAreas,
  usesCustomColors,
  usesAggregation,
  usesPalette,
} from "./capabilities";

import "./style.scss";

const UNIT_FIELDS = ["geom_id", "entity_name", "admin_level"];
const INDICATOR_FIELDS = ["indicator_id"];

/** Types that show the latest value of each area or indicator. */
const SNAPSHOT_TYPES = [ChartTypes.BAR, ChartTypes.DONUT, ChartTypes.TREEMAP];
/** Types that show values over time. */
const TIME_TYPES = [ChartTypes.LINE, ChartTypes.HEATMAP, ChartTypes.KPI];

/** An area of the response, found by its display name. */
interface Area {
  geom_id: string;
  admin_level: number;
  name: string;
}

interface DataState {
  fetching: boolean;
  input: ChartInput | null;
  dropped: number;
  error: string | null;
  areas?: Record<string, Area>;
}

export interface Props {
  data: Widget;
}

export { chartConfig };

/** Short label of a period: 2020-05 for months, 2020 for years. */
function periodLabel(date: string, period: string | undefined): string {
  if (!date) {
    return date;
  }
  if (period === ChartPeriods.YEARLY) {
    return ("" + date).substring(0, 4);
  }
  if (period === ChartPeriods.MONTHLY) {
    return ("" + date).substring(0, 7);
  }
  return "" + date;
}

function ChartWidgetView({ data: widget }: Props) {
  const { t } = useTranslation();
  // The editor preview must not change the map selection.
  const isPreview = ("" + widget.id).startsWith("preview");
  const { config } = widget;
  const chart = chartConfig(widget);
  const { aggregation, sort } = config;
  // Without values to combine, the value itself is shown (SUM of one value).
  const method =
    usesAggregation(chart, config.seriesType) && aggregation?.method
      ? aggregation.method
      : "SUM";
  const byIndicator = config.seriesType === SeriesType.INDICATORS;
  const usePeriod =
    TIME_TYPES.includes(chart.type) &&
    !!chart.period &&
    chart.period !== ChartPeriods.DATE;
  const timeField = usePeriod ? "period" : "date";

  const indicators: Indicator[] = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.indicators,
  );
  const [parameters, setParameters] = useState<ParameterProps>({});
  const [picked, setPicked] = useState<number | null>(null);
  // Colours of the palette chosen in the editor (palette mode).
  const [palette, setPalette] = useState<string[]>([]);
  useEffect(() => {
    if (!usesPalette(chart) || !chart.palette) {
      setPalette([]);
      return;
    }
    updateColorPaletteData()
      .then((palettes: any[]) =>
        setPalette(
          palettes?.find((item: any) => item.id === chart.palette)?.colors ||
            [],
        ),
      )
      .catch(() => setPalette([]));
  }, [chart.type, chart.colors, chart.palette]);
  // Legend entries the viewer switched off.
  const [hidden, setHidden] = useState<string[]>([]);
  const [state, setState] = useState<DataState>({
    fetching: true,
    input: null,
    dropped: 0,
    error: null,
  });

  const indicatorOf = (id: number): any =>
    indicators?.find((indicator: Indicator) => indicator.id === id);

  /** Display name of an indicator. */
  const indicatorName = (id: number): string => {
    const indicator = indicatorOf(id);
    if (!indicator) {
      return "" + id;
    }
    return sort?.field === SortTypes.CODE
      ? indicator.shortcode
      : indicator.name;
  };

  /** Display name of an area. */
  const unitName = (row: any): string =>
    sort?.field === SortTypes.CODE
      ? row.geom_id
      : row.entity_name || row.geom_id;

  /** Name of the main dimension (Series / Group by) of a row. */
  const primaryName = (row: any): string =>
    byIndicator ? indicatorName(row.indicator_id) : unitName(row);

  /** Name of the other dimension of a row. */
  const secondaryName = (row: any): string =>
    byIndicator ? unitName(row) : indicatorName(row.indicator_id);

  /**
   * Map style colours: the colour each row would have on the map, from the
   * style of its indicator. Only for rows of one area and one indicator.
   */
  const mapColors = (
    rows: any[],
    valueKey: string,
    indicatorId: number,
  ): (string | null)[] => {
    // Map style is the default; palette and custom colours ignore it.
    if (
      chart.colors === ChartColorModes.PALETTE ||
      chart.colors === ChartColorModes.CUSTOM
    ) {
      return rows.map((): null => null);
    }
    const indicator = indicatorOf(indicatorId);
    if (!indicator) {
      return rows.map((): null => null);
    }
    try {
      const styled = UpdateStyleData(
        rows.map((row) => ({
          value: row[valueKey] === null ? null : Number(row[valueKey]),
          admin_level: row.admin_level,
          geom_id: row.geom_id,
        })),
        indicator,
      );
      return styled.map((row: any) => row?.style?.color || null);
    } catch (err) {
      return rows.map((): null => null);
    }
  };

  /** Sort and cut rows with the widget sort config. */
  const sortRows = <T extends { category: string; value: number | null }>(
    rows: T[],
  ): T[] => {
    const byValue = !sort || sort.field === SortTypes.VALUE;
    let sorted = [...rows].sort((a, b) =>
      byValue
        ? (a.value || 0) - (b.value || 0)
        : a.category.localeCompare(b.category),
    );
    if (sort?.method === SortMethodTypes.DESC) {
      sorted = sorted.reverse();
    }
    if (sort?.useTopN && sort.topN > 0) {
      sorted = sorted.slice(0, sort.topN);
    }
    return sorted;
  };

  /** Single indicator id of the request, or null. */
  const singleIndicator = (params: any): number | null => {
    const ids = params["indicator_id__in"];
    return ids?.length === 1 ? Number(ids[0]) : null;
  };

  /** Build the request of the chart type. */
  const buildRequest = (params: any) => {
    const request: any = { ...params, aggregate_methods: [method] };
    const primary = byIndicator ? INDICATOR_FIELDS : UNIT_FIELDS;
    switch (chart.type) {
      case ChartTypes.SCATTER:
        request.indicator_id__in = [chart.x, chart.y, chart.size].filter(
          (id) => id !== null && id !== undefined,
        );
        request.group_by = [...INDICATOR_FIELDS, ...UNIT_FIELDS].join(",");
        request.latest_value = true;
        break;
      case ChartTypes.GAUGE:
        request.latest_value = true;
        break;
      case ChartTypes.KPI:
        request.group_by = timeField;
        break;
      case ChartTypes.LINE:
      case ChartTypes.HEATMAP:
        request.group_by = [timeField, ...primary].join(",");
        break;
      default:
        request.group_by = (
          isMultiBar(chart) ? [...INDICATOR_FIELDS, ...UNIT_FIELDS] : primary
        ).join(",");
        request.latest_value = true;
    }
    if (usePeriod && request.group_by?.includes("period")) {
      request.frequency = chart.period;
    }
    return request;
  };

  /** Turn the statistic rows into chart input. */
  const toInput = (
    output: any,
    params: any,
  ): { input: ChartInput; dropped: number } => {
    const key = method.toLowerCase();
    const valueOf = (row: any) =>
      row[key] === null || row[key] === undefined ? null : parseFloat(row[key]);
    const indicatorId = singleIndicator(params);

    switch (chart.type) {
      case ChartTypes.GAUGE:
        return { input: { rows: [], value: valueOf(output) }, dropped: 0 };

      case ChartTypes.KPI:
        return {
          input: {
            rows: output.map((row: any) => ({
              category: row[timeField],
              series: null as string | null,
              value: valueOf(row),
            })),
          },
          dropped: 0,
        };

      case ChartTypes.SCATTER: {
        const byUnit: Record<string, any> = {};
        output.forEach((row: any) => {
          const id = row.geom_id;
          if (!byUnit[id]) {
            byUnit[id] = { row: row, values: {} };
          }
          byUnit[id].values[row.indicator_id] = valueOf(row);
        });
        const units = Object.values(byUnit);
        const colors = chart.y
          ? mapColors(
              units.map((unit: any) => ({
                ...unit.row,
                value: unit.values[chart.y],
              })),
              "value",
              chart.y,
            )
          : [];
        const points: ScatterPoint[] = units.map((unit: any, index) => ({
          name: unitName(unit.row),
          x: unit.values[chart.x],
          y: unit.values[chart.y],
          size: chart.size ? unit.values[chart.size] : null,
          color: colors[index],
        }));
        return {
          input: {
            rows: [],
            points: points,
            axisNames: {
              x: chart.x ? indicatorName(chart.x) : "",
              y: chart.y ? indicatorName(chart.y) : "",
              size: chart.size ? indicatorName(chart.size) : "",
            },
          },
          dropped: 0,
        };
      }

      case ChartTypes.LINE:
      case ChartTypes.HEATMAP: {
        const heatmap = chart.type === ChartTypes.HEATMAP;
        const colors =
          heatmap && !byIndicator && indicatorId
            ? mapColors(output, key, indicatorId)
            : [];
        let rows: ChartRow[] = output.map((row: any, index: number) => ({
          category: heatmap
            ? periodLabel(row[timeField], chart.period)
            : "" + row[timeField],
          series: primaryName(row),
          value: valueOf(row),
          color: colors[index] || null,
        }));
        let dropped = 0;
        if (!heatmap) {
          ({ rows, dropped } = limitSeries(rows));
        }
        return { input: { rows }, dropped };
      }

      default: {
        if (isMultiBar(chart)) {
          let rows: ChartRow[] = output.map((row: any) => ({
            category: primaryName(row),
            series: secondaryName(row),
            value: valueOf(row),
          }));
          // Order and cut the categories by their total.
          const totals: Record<string, number> = {};
          rows.forEach((row) => {
            totals[row.category] =
              (totals[row.category] || 0) + (row.value || 0);
          });
          const categories = sortRows(
            Object.keys(totals).map((category) => ({
              category,
              value: totals[category],
            })),
          ).map((row) => row.category);
          rows = rows.filter((row) => categories.includes(row.category));
          rows.sort(
            (a, b) =>
              categories.indexOf(a.category) - categories.indexOf(b.category),
          );
          // At most 8 series: keep the largest.
          const seriesTotals: Record<string, number> = {};
          rows.forEach((row) => {
            seriesTotals[row.series] =
              (seriesTotals[row.series] || 0) + (row.value || 0);
          });
          const names = Object.keys(seriesTotals).sort(
            (a, b) => seriesTotals[b] - seriesTotals[a],
          );
          const kept = names.slice(0, MAX_SERIES);
          return {
            input: { rows: rows.filter((row) => kept.includes(row.series)) },
            dropped: Math.max(0, names.length - MAX_SERIES),
          };
        }
        const colors =
          !byIndicator && indicatorId
            ? mapColors(output, key, indicatorId)
            : [];
        const rows: ChartRow[] = output.map((row: any, index: number) => ({
          category: primaryName(row),
          series: null as string | null,
          value: valueOf(row),
          color: colors[index] || null,
        }));
        return { input: { rows: sortRows(rows) }, dropped: 0 };
      }
    }
  };

  // Everything in the config that changes the request or the rows.
  const requestKey = JSON.stringify({
    type: chart.type,
    layout: isMultiBar(chart),
    period: chart.period,
    x: chart.x,
    y: chart.y,
    size: chart.size,
    colors: chart.colors,
    seriesType: config.seriesType,
    method,
    sort,
  });

  // Several active indicators on a chart that shows one: the viewer picks.
  const activeIndicators: number[] = (parameters["indicator_id__in"] || []).map(
    (id: any) => Number(id),
  );
  const choices =
    needsOneIndicator(chart, config.seriesType) && activeIndicators.length > 1
      ? activeIndicators
      : [];
  const pickedId = choices.length
    ? choices.includes(picked)
      ? picked
      : choices[0]
    : null;
  const requestParameters = useMemo(
    () =>
      pickedId === null
        ? parameters
        : { ...parameters, indicator_id__in: [pickedId] },
    [parameters, pickedId],
  );

  // Request data
  useEffect(() => {
    (async () => {
      const parameters = requestParameters;
      if (!indicators || parameters["indicator_id__in"] === undefined) {
        return;
      }
      if (!parameters["date__gte"]) {
        return;
      }
      const scatter = chart.type === ChartTypes.SCATTER;
      if (
        scatter ? !chart.x || !chart.y : !parameters["indicator_id__in"]?.length
      ) {
        setState({
          fetching: false,
          input: null,
          dropped: 0,
          error: scatter
            ? t("dashboardPage.widget.scatterPickIndicators")
            : t("dashboardPage.widget.noIndicators"),
        });
        return;
      }
      setState((current) => ({ ...current, fetching: true }));
      try {
        const session = new Session("Chart widget request " + widget.id);
        const output = await new IndicatorData().statistic(
          buildRequest(parameters),
        );
        if (!session.isValid) {
          return;
        }
        const { input, dropped } = toInput(output, parameters);
        // Areas by display name, for the link to the map.
        const areas: Record<string, Area> = {};
        (Array.isArray(output) ? output : []).forEach((row: any) => {
          if (row.geom_id) {
            areas[unitName(row)] = {
              geom_id: row.geom_id,
              admin_level: row.admin_level,
              name: row.entity_name || row.geom_id,
            };
          }
        });
        setState({ fetching: false, input, dropped, error: null, areas });
      } catch (err) {
        setState({
          fetching: false,
          input: null,
          dropped: 0,
          error: "" + err,
        });
      }
    })();
  }, [requestParameters, indicators, requestKey]);

  // Custom colours: the colour of each item of the predefined indicator or
  // area list (the series dimension), by the name the chart shows.
  const colors = useMemo(() => {
    const result: Record<string, string> = {};
    if (!usesCustomColors(chart)) {
      return result;
    }
    const units: UnitConfig[] = byIndicator
      ? config.indicators
      : config.geographicalUnit;
    // Areas: the list names carry the code ("Bay (SOM_0005_V1)"); the chart
    // shows the area name, so match by code.
    const areaNames: Record<string, string> = {};
    Object.entries(state.areas || {}).forEach(([name, area]) => {
      areaNames[area.geom_id] = name;
    });
    units?.forEach((unit: UnitConfig) => {
      if (!unit.color) {
        return;
      }
      const name = byIndicator
        ? indicatorName(unit.id)
        : areaNames["" + unit.id] || unit.name;
      result[name] = unit.color;
    });
    return result;
  }, [config, indicators, chart.colors, chart.type, state.areas]);

  // Decimal places off: the value as it is, up to 2 decimals (0.45 stays
  // 0.45, not 0); trailing zeros are dropped by formatNumber.
  const decimals = aggregation?.useDecimalPlace ? aggregation.decimalPlace : 2;
  const formatExact = (value: number) =>
    formatNumber(value, decimals, aggregation?.useAutoUnits);

  const linked =
    !isPreview && !!chart.linkAreas && showsAreas(chart, config.seriesType);
  const areaLink = useAreaLink(linked);
  // Display name of the area selected on the map, if it is in this chart.
  const selectedName = useMemo(() => {
    if (!areaLink.selectedUcode || !state.areas) {
      return null;
    }
    const found = Object.entries(state.areas).find(
      ([, area]) => area.geom_id === areaLink.selectedUcode,
    );
    return found ? found[0] : null;
  }, [areaLink.selectedUcode, state.areas]);

  /** Click on an area: select it on the map and zoom to it (again: clear). */
  const onChartClick = async (params: any) => {
    if (!linked || !state.areas) {
      return;
    }
    const name = [params.name, params.seriesName, params.value].find(
      (candidate) => typeof candidate === "string" && state.areas[candidate],
    );
    if (name) {
      await areaLink.toggle(state.areas[name]);
    }
  };

  const built = useMemo(() => {
    if (!state.input) {
      return null;
    }
    return buildChartOption(chart, state.input, {
      // Axis: compact (1.5M); tooltip: the widget's own number format.
      format: (value: number) => formatNumber(value, 1, true),
      formatExact: formatExact,
      colors: colors,
      description: widget.name,
      texts: {
        other: t("dashboardPage.widget.other"),
        target: t("dashboardPage.widget.target"),
      },
      linkAreas: linked,
      selected: selectedName,
      hidden: hidden,
      palette: palette,
    });
  }, [
    palette,
    state.input,
    JSON.stringify(chart),
    colors,
    linked,
    selectedName,
    hidden,
  ]);

  // New data with other entries: show them all again.
  const legendKey = JSON.stringify((built?.legend || []).map((i) => i.name));
  useEffect(() => {
    const names: string[] = JSON.parse(legendKey);
    setHidden((current) => current.filter((name) => names.includes(name)));
  }, [legendKey]);

  /** KPI tile: the value, its change and the sparkline. */
  const renderKpi = () => {
    const { value, previous } = built.kpi;
    const change =
      previous === null || isNaN(previous) ? null : value - previous;
    const direction =
      change === null || change === 0 ? "flat" : change > 0 ? "up" : "down";
    const percent =
      change !== null && previous ? (change / Math.abs(previous)) * 100 : null;
    return (
      <div className="widget__chart__kpi" data-testid="chart-kpi">
        <div className="widget__chart__kpi__value">{formatExact(value)}</div>
        {change !== null && (
          <div
            className={"widget__chart__kpi__change " + direction}
            title={t("dashboardPage.widget.kpiChange")}
          >
            <span aria-hidden="true">
              {direction === "up" ? "▲" : direction === "down" ? "▼" : "■"}
            </span>{" "}
            {(change > 0 ? "+" : "") + formatExact(change)}
            {percent !== null &&
              ` (${percent > 0 ? "+" : ""}${percent.toFixed(1)}%)`}{" "}
            <span className="widget__chart__kpi__label">
              {t("dashboardPage.widget.kpiChange")}
            </span>
          </div>
        )}
        {built.height > 0 && (
          <EChart option={built.option} height={built.height} />
        )}
      </div>
    );
  };

  const renderOutput = () => {
    if (state.fetching) {
      return (
        <div className="dashboard__right_side__loading">
          <CircularProgress />
        </div>
      );
    }
    if (state.error) {
      return <div className="error">{state.error}</div>;
    }
    if (!built) {
      return (
        <div className="NoDataFound">{t("dashboardPage.widget.noData")}</div>
      );
    }
    return (
      <Fragment>
        {built.kpi ? (
          renderKpi()
        ) : (
          <EChart
            option={built.option}
            height={built.height}
            onClick={linked ? onChartClick : undefined}
            className={linked ? "Linked" : ""}
          />
        )}
        {built.legend && built.legend.length > 0 && (
          <ChartLegend
            items={built.legend}
            hidden={hidden}
            onToggle={(name) =>
              setHidden((current) =>
                current.includes(name)
                  ? current.filter((item) => item !== name)
                  : [...current, name],
              )
            }
          />
        )}
        {state.dropped > 0 && (
          <div className="widget__chart__note">
            {t("dashboardPage.widget.seriesHidden", { count: state.dropped })}
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      <RequestParameter
        widget={widget}
        setParameter={(newParameters: ParameterProps) => {
          if (JSON.stringify(parameters) !== JSON.stringify(newParameters)) {
            setParameters(newParameters);
          }
        }}
      />
      <div
        className="widget__chart__wrapper"
        data-testid="chart-widget"
        data-chart-type={chart.type}
      >
        {choices.length > 0 && (
          <label className="widget__chart__picker">
            <span>{t("dashboardPage.widget.indicator")}</span>
            <select
              data-testid="chart-indicator-picker"
              value={pickedId}
              onChange={(event) => setPicked(Number(event.target.value))}
            >
              {choices.map((id) => (
                <option key={id} value={id}>
                  {indicatorOf(id)?.name || id}
                </option>
              ))}
            </select>
          </label>
        )}
        {renderOutput()}
      </div>
    </Fragment>
  );
}

export default memo(ChartWidgetView);
