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
import { getIndicatorOrIndicatorLater } from "../../../utils/dashboard";
import { DateFilterType, SeriesDataType, TimeType } from "../Definition";
import { capitalize } from "../../../utils/main";

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
    const layer = getIndicatorOrIndicatorLater(
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
  return (
    <div>
      <div>{t("Indicators")}:</div>
      <div>
        {indicatorsUsed
          .map((indicator: any) => indicator.name)
          .filter((name: string) => name)
          .join(", ")}
      </div>
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
  return (
    <div>
      <div>{t("Geographic unit")}:</div>
      <div>
        {geographicUnitUsed
          .map((unit: any) => unit.name)
          .filter((name: string) => name)
          .join(", ")}
      </div>
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
    const from = config.dateTimeConfig.minDateFilter;
    const to = config.dateTimeConfig.maxDateFilter;
    if (!to) {
      text = t("From ") + " " + from.split(".")[0];
    } else {
      text = [from.split(".")[0], to.split(".")[0]].join(" - ");
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
  const aggregation = config?.aggregation?.method;
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
      <div className="WidgetInformation">
        <Aggregation {...config} />
        <GroupBy {...config} />
        <SortBy {...config} />
        <Indicators {...config} />
        <GeographicUnit {...config} />
        <DateTimeRange {...config} />
        {aggregation && (
          <div>
            <div>Aggregation:</div>
            <div>{aggregation}</div>
          </div>
        )}
      </div>
    </CustomPopover>
  );
}
