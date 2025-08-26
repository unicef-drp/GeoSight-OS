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

import React, { useState } from "react";

// Widgets
import SummaryWidget from "../View/Summary";
import { SeriesTypeNone, WidgetType } from "../Definition";
import { Widget } from "../../../types/Widget";
import RequestData from "./RequestData";

/**Base widget that handler widget rendering. */

export interface Props {
  data: Widget;
}

export default function GenericWidgetView({ data }: Props) {
  const { type, config } = data;
  const { seriesType } = config;
  const [indicatorData, setIndicatorData] = useState(null);

  /** Render widget by type **/
  function renderWidgetByType() {
    // If error, raise error
    if (indicatorData?.error) {
      throw new Error(indicatorData?.error);
    }
    if (type !== WidgetType.GENERIC_SUMMARY_WIDGET) {
      throw new Error("Generic widget can only be used with summary widget.");
    }
    // render widget by the type
    switch (seriesType) {
      case SeriesTypeNone:
        return <SummaryWidget data={indicatorData?.data} config={config} />;
      default:
        throw new Error("Widget type does not recognized.");
    }
  }

  // Render widget based on the type and raise error
  const renderWidget = () => {
    try {
      return renderWidgetByType();
    } catch (error) {
      error = ("" + error).replaceAll("Error: ", "");
      return <div className="error">{"" + error}</div>;
    }
  };

  return (
    <>
      <RequestData data={data} applyData={setIndicatorData} />
      {renderWidget()}
    </>
  );
}
