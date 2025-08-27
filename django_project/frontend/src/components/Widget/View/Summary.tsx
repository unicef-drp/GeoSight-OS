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
import { WidgetConfig } from "../../../types/Widget";
import { analyzeData } from "../../../utils/analysisData";
import { formatNumber } from "../../../utils/Utilities";

export interface DataProps {
  value: string;
}

export interface Props {
  data: DataProps[];
  config: WidgetConfig;
}

export default function Summary({ data, config }: Props) {
  const { unit, operation, aggregation } = config;

  /**
   * Return value of widget
   * @returns {JSX.Element}
   */
  function getValue() {
    if (![null, undefined].includes(data)) {
      const method = operation ? operation : aggregation?.method;
      try {
        const total = analyzeData(
          // @ts-ignore
          method.toUpperCase(),
          data.map((row) => row.value),
        );
        return (
          <span>
            {formatNumber(
              total,
              aggregation?.useDecimalPlace ? aggregation?.decimalPlace : 0,
              aggregation?.useAutoUnits,
            )}{" "}
            {unit}
          </span>
        );
      } catch (err) {
        return <div className="error">{err.toString()}</div>;
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
