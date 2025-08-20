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
   GENERAL WIDGET FOR SHOWING SUMMARY OF DATA PER GROUP
   ========================================================================== */

import React, { Fragment } from "react";
import CircularProgress from "@mui/material/CircularProgress";

import { numberWithCommas } from "../../../../utils/main";
import { WidgetOperation } from "../../Definition";

/**
 * General widget to show summary of data.
 * @param {int} idx Index of widget
 * @param {list} data List of data {value, date}
 * @param {object} widgetData Widget Data
 */
export default function SummaryWidget({ data, widgetData }) {
  const { config } = widgetData;
  const { unit, operation } = config;

  /**
   * Return value of widget
   * @returns {JSX.Element}
   */
  function getValue() {
    if (data !== null) {
      switch (operation) {
        case WidgetOperation.SUM:
          let total = 0;
          data.forEach(function (rowData) {
            const rowValue = parseFloat(rowData.value);
            if (!isNaN(rowValue)) {
              total += rowValue;
            }
          });
          return (
            <span>
              {numberWithCommas(total)} {unit}
            </span>
          );
        default:
          return <div className="error">Operation Not Found</div>;
      }
    }
    return (
      <div className="dashboard__right_side__loading">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Fragment>
      <div className="widget__sw">{getValue()}</div>
    </Fragment>
  );
}
