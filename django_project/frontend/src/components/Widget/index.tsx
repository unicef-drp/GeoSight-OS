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

import React, { Fragment, memo } from "react";

// Widgets
import TimeSeriesChartWidgetView from "./TimeSeriesChartWidget/View";
import SummaryGroupWidgetView from "./Legacy/SummaryGroupWidget/View";
import { WidgetType } from "./Definition";
import { Widget } from "../../types/Widget";
import WidgetInformation from "./Information";

import "./style.scss";

export interface WidgetViewProps {
  data: Widget;
}

/** Base widget that handler widget rendering. */
export const WidgetView = memo(({ data }: WidgetViewProps) => {
  const { name, description, type } = data;

  /**
   * Render widget by type
   * **/
  function renderWidgetByType() {
    // render widget by the type
    switch (type) {
      case WidgetType.SUMMARY_WIDGET:
      case WidgetType.SUMMARY_GROUP_WIDGET:
        // We will fix the widget summary calculation
        return <SummaryGroupWidgetView data={data} />;
      case WidgetType.TIME_SERIES_CHART_WIDGET:
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
      return <div className="error">{"" + error}</div>;
    }
  };

  return (
    <div className="widget">
      <div className="widget__title">
        <div>{name}</div>
        <WidgetInformation data={data} />
      </div>
      {description && <div className="widget__description">{description}</div>}
      <div className="widget__content">{renderWidget()}</div>
    </div>
  );
});

/** Widget List rendering */
export interface WidgetListProps {
  widgets: Widget[];
  widgetsStructure: any;
}

export default function WidgetList({
  widgets,
  widgetsStructure,
}: WidgetListProps) {
  let orders = widgetsStructure?.children ? widgetsStructure?.children : [];
  if (widgets) {
    widgets.map((widget: Widget) => {
      if (!orders.includes(widget.id)) {
        orders.push(widget.id);
      }
    });
  }
  return (
    <>
      {widgets &&
        orders.map((id: number) => {
          const widget = widgets.find((widget: Widget) => widget.id === id);
          return (
            widget?.visible_by_default && <WidgetView key={id} data={widget} />
          );
        })}
    </>
  );
}
