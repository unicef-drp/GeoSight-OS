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
 * __date__ = '20/08/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   WIDGET
   ========================================================================== */

import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Widget, WidgetConfig } from "../../../types/Widget";
import CustomPopover from "../../CustomPopover";
import { InfoFillIcon } from "../../Icons";
import { getIndicatorOrIndicatorLayer } from "../../../utils/dashboard";
import {
  ChartBarLayouts,
  ChartPeriods,
  ChartTypes,
  DateFilterType,
  SeriesDataType,
  TimeType,
  WidgetType,
} from "../Definition";
import {
  chartConfig,
  usesAggregation,
  usesIndicatorList,
  usesPeriod,
  usesSeries,
  usesSort,
} from "../ChartWidget/capabilities";
import { capitalize } from "../../../utils/main";
import { widgetLocalDateTime } from "../../../utils/Dates";

import "./style.scss";

/** Widget List rendering */
export interface Props {
  data: Widget;
}

function Aggregation(config: WidgetConfig) {
  const { t } = useTranslation();
  let aggregation = "";
  if (config.aggregation?.method) {
    aggregation = config.aggregation?.method;
  } else if (config.operation) {
    aggregation = config.operation;
  }
  if (!aggregation) {
    return null;
  }
  return (
    <div>
      <div>{t("Aggregation")}:</div>
      <div>{aggregation.toUpperCase()}</div>
    </div>
  );
}

function Indicators(config: WidgetConfig) {
  const { t } = useTranslation();
  const { indicators, indicatorLayers } = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data,
  );
  let indicatorsUsed: any = [];

  if (config.indicatorsType === SeriesDataType.SYNC) {
    indicatorsUsed = [
      {
        name: SeriesDataType.SYNC,
      },
    ];
  } else if (!config.indicators && config.layer_id) {
    const layer = getIndicatorOrIndicatorLayer(
      config.layer_id,
      config.layer_used,
      indicators,
      indicatorLayers,
    );
    if (layer) {
      indicatorsUsed.push(layer);
    }
  } else if (config.indicators) {
    indicatorsUsed = config.indicators;
  }
  if (!indicatorsUsed.length) {
    return null;
  }
  let text = indicatorsUsed
    .map((indicator: any) => indicator.name)
    .filter((name: string) => name)
    .join(", ");
  if (text.length > 50) {
    text = `${indicatorsUsed.length} indicators used`;
  }
  return (
    <div>
      <div>{t("Indicators")}:</div>
      <div>{text}</div>
    </div>
  );
}

function GeographicUnit(config: WidgetConfig) {
  const { t } = useTranslation();
  let geographicUnitUsed: any = [];
  if (
    config.geographicalUnitType === SeriesDataType.SYNC ||
    config.property_2
  ) {
    geographicUnitUsed = [
      {
        name: SeriesDataType.SYNC,
      },
    ];
  } else if (config.geographicalUnit) {
    geographicUnitUsed = config.geographicalUnit;
  }
  if (!geographicUnitUsed.length) {
    return null;
  }
  let text = geographicUnitUsed
    .map((unit: any) => unit.name)
    .filter((name: string) => name)
    .join(", ");
  if (text.length > 50) {
    text = `${geographicUnitUsed.length} admin units used`;
  }
  return (
    <div>
      <div>{t("Geographic unit")}:</div>
      <div>{text}</div>
    </div>
  );
}

function DateTimeRange(config: WidgetConfig) {
  const { t } = useTranslation();
  let text = "";
  if (config.date_filter_type === DateFilterType.NO_FILTER) {
    text = t("Last known data");
  } else if (
    config.date_filter_type === DateFilterType.SYNC ||
    config.dateTimeType === TimeType.SYNC
  ) {
    text = t("Sync with map");
  } else if (config.date_filter_type === DateFilterType.CUSTOM) {
    const [from, to] = config.date_filter_value.split(";");
    if (!to) {
      text = t("From ") + " " + from.split(".")[0];
    } else {
      text = [from.split(".")[0], to.split(".")[0]].join(" - ");
    }
  } else if (config.dateTimeType === TimeType.PREDEFINED) {
    const from = widgetLocalDateTime(config.dateTimeConfig.minDateFilter);
    const to = widgetLocalDateTime(config.dateTimeConfig.maxDateFilter);
    if (!to) {
      text = t("From ") + " " + from;
    } else {
      text = [from, to].join(" - ");
    }
    if (config.dateTimeConfig.interval) {
      text = config.dateTimeConfig.interval + " - " + text;
    }
  }
  if (!text) {
    return;
  }
  return (
    <div>
      <div>{t("Date/time range")}:</div>
      <div>{text}</div>
    </div>
  );
}

/** Chart widgets: the chart type and its own settings. */
function ChartInfo({ data }: Props) {
  const { t } = useTranslation();
  const indicators = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.indicators,
  );
  const chart = chartConfig(data);
  const typeKeys: Record<string, string> = {
    [ChartTypes.BAR]: "chartBar",
    [ChartTypes.LINE]: "chartLine",
    [ChartTypes.DONUT]: "chartDonut",
    [ChartTypes.SCATTER]: "chartScatter",
    [ChartTypes.HEATMAP]: "chartHeatmap",
    [ChartTypes.TREEMAP]: "chartTreemap",
    [ChartTypes.GAUGE]: "chartGauge",
    [ChartTypes.KPI]: "chartKpi",
  };
  const layoutKeys: Record<string, string> = {
    [ChartBarLayouts.SIMPLE]: "layoutSimple",
    [ChartBarLayouts.STACKED]: "layoutStacked",
    [ChartBarLayouts.GROUPED]: "layoutGrouped",
    [ChartBarLayouts.PERCENT]: "layoutPercent",
  };
  const periodKeys: Record<string, string> = {
    [ChartPeriods.DATE]: "periodDate",
    [ChartPeriods.MONTHLY]: "periodMonthly",
    [ChartPeriods.YEARLY]: "periodYearly",
  };
  const indicatorName = (id: number | null | undefined) =>
    indicators?.find((indicator: any) => indicator.id === id)?.name ||
    (id ? "" + id : "");

  const rows: [string, string][] = [];
  let type = typeKeys[chart.type]
    ? t("admin.widget." + typeKeys[chart.type])
    : "";
  if (chart.type === ChartTypes.BAR && layoutKeys[chart.layout]) {
    type += " · " + t("admin.widget." + layoutKeys[chart.layout]);
  }
  if (type) {
    rows.push([t("admin.widget.chartType"), type]);
  }
  if (chart.type === ChartTypes.SCATTER) {
    rows.push([t("admin.widget.chartScatterX"), indicatorName(chart.x)]);
    rows.push([t("admin.widget.chartScatterY"), indicatorName(chart.y)]);
    if (chart.size) {
      rows.push([
        t("admin.widget.chartScatterSize"),
        indicatorName(chart.size),
      ]);
    }
  }
  // An unset period is drawn per date.
  const period = chart.period || ChartPeriods.DATE;
  if (usesPeriod(chart) && periodKeys[period]) {
    rows.push([
      t("admin.widget.chartPeriod"),
      t("admin.widget." + periodKeys[period]),
    ]);
  }
  if (
    [ChartTypes.BAR, ChartTypes.GAUGE].includes(chart.type) &&
    chart.target !== null &&
    chart.target !== undefined &&
    ("" + chart.target).trim() !== ""
  ) {
    rows.push([t("admin.widget.chartTarget"), "" + chart.target]);
  }
  return (
    <>
      {rows
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label}>
            <div>{label}:</div>
            <div>{value}</div>
          </div>
        ))}
    </>
  );
}

function GroupBy(config: WidgetConfig) {
  const { t } = useTranslation();
  let text = "";
  if (config.seriesType) {
    text = config.seriesType;
  } else if (config.property_2) {
    text = config.property_2.replace("_", " ");
  }
  if (!text) {
    return;
  }
  return (
    <div>
      <div>{t("Group by")}:</div>
      <div>{capitalize(text)}</div>
    </div>
  );
}

function SortBy(config: WidgetConfig) {
  const { t } = useTranslation();
  let text = "";
  if (config.sort?.field) {
    text = config.sort.field;
  } else if (config.property_2) {
    text = "value";
  }
  if (!text) {
    return;
  }
  return (
    <div>
      <div>{t("Sort by")}:</div>
      <div>{capitalize(text)}</div>
    </div>
  );
}

export default function WidgetInformation({ data }: Props) {
  const { config } = data;
  // Chart widgets list only the settings their chart type uses.
  const chart =
    data.type === WidgetType.CHART_WIDGET ? chartConfig(data) : null;
  return (
    // Aggregation
    <CustomPopover
      anchorOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "right",
      }}
      Button={<InfoFillIcon />}
      showOnHover={true}
    >
      <div className="WidgetInformation" data-testid="widget-information">
        {chart && <ChartInfo data={data} />}
        {(!chart || usesAggregation(chart, config.seriesType)) && (
          <Aggregation {...config} />
        )}
        {(!chart || usesSeries(chart)) && <GroupBy {...config} />}
        {(!chart || usesSort(chart)) && <SortBy {...config} />}
        {(!chart || usesIndicatorList(chart)) && <Indicators {...config} />}
        <GeographicUnit {...config} />
        <DateTimeRange {...config} />
      </div>
    </CustomPopover>
  );
}
