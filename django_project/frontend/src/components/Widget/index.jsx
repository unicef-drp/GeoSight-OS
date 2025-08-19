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

/* ==========================================================================
   WIDGET
   ========================================================================== */

import React, { Fragment, memo, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { InfoFillIcon } from "../Icons";

// Widgets
import SummaryGroupWidgetView from "./SummaryGroupWidget/View";
import TimeSeriesChartWidgetView from "./TimeSeriesChartWidget/View";

import "./style.scss";

export const DEFINITION = {
  WidgetType: {
    SUMMARY_WIDGET: "SummaryWidget",
    SUMMARY_GROUP_WIDGET: "SummaryGroupWidget",
    TIME_SERIES_CHART_WIDGET: "TimeSeriesChartWidget",
    GENERIC_SUMMARY_WIDGET: "GenericSummaryWidget",
    GENERIC_TIME_SERIES_WIDGET: "GenericTimeSeriesWidget",
  },
  WidgetText: {
    SummaryWidget: "Summary Widget",
    SummaryGroupWidget: "Summary Group Widget",
    TimeSeriesChartWidget: "Time Series Chart Widget",
  },
  WidgetOperation: {
    SUM: "Sum",
  },
};

/** Base widget that handler widget rendering.
 * @param {string} data Data of widget
 */
export const Widget = memo(({ data }) => {
  const { name, description, type } = data;
  const [showInfo, setShowInfo] = useState(false);

  const showInfoHandler = () => {
    setShowInfo(!showInfo);
  };

  /**
   * Render widget by type
   * **/
  function renderWidgetByType() {
    // render widget by the type
    switch (type) {
      case DEFINITION.WidgetType.SUMMARY_WIDGET:
      case DEFINITION.WidgetType.SUMMARY_GROUP_WIDGET:
        // We will fix the widget summary calculation
        return <SummaryGroupWidgetView data={data} />;
      case DEFINITION.WidgetType.TIME_SERIES_CHART_WIDGET:
        return <TimeSeriesChartWidgetView data={data} />;
      default:
        throw new Error("Widget type does not recognized.");
    }
  }

  // Render widget based on the type and raise error
  const renderWidget = () => {
    try {
      return renderWidgetByType();
    } catch (error) {
      return <div className="widget__error">{"" + error}</div>;
    }
  };

  return (
    <div className="widget">
      <InfoFillIcon className="info__button" onClick={showInfoHandler} />
      <div className="widget__fill">{renderWidget()}</div>
      {showInfo && (
        <div className="widget__info">
          <div className="widget__info__title">
            <b className="light">{name}</b>
          </div>
          <div className="widget__info__content">{description}</div>
        </div>
      )}
    </div>
  );
});

/**
 * Widget List rendering
 */
export default function WidgetList({ widgets, widgetsStructure }) {
  let orders = widgetsStructure?.children ? widgetsStructure?.children : [];
  if (widgets) {
    widgets.map((widget) => {
      if (!orders.includes(widget.id)) {
        orders.push(widget.id);
      }
    });
  }
  return (
    <Fragment>
      {widgets ? (
        orders.map((id) => {
          const widget = widgets.find((widget) => widget.id === id);
          return (
            widget?.visible_by_default && <Widget key={id} data={widget} />
          );
        })
      ) : (
        <div className="dashboard__right_side__loading">
          <CircularProgress />
        </div>
      )}
    </Fragment>
  );
}
