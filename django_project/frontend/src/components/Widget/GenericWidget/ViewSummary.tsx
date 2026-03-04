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

import React, { Fragment, useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Widget } from "../../../types/Widget";
import { formatNumber } from "../../../utils/Utilities";
import { IndicatorData, ParameterProps } from "../../../class/IndicatorData";
import RequestParameter from "./RequestParameter";
import { Session } from "../../../utils/Sessions";

export interface DataProps {
  fetching: boolean;
  value: number | null;
  error: string | null;
}

export interface Props {
  widget: Widget;
}

export default function Summary({ widget }: Props) {
  const { unit, operation, aggregation } = widget.config;
  const [value, setValue] = useState<DataProps>({
    fetching: true,
    value: null,
    error: null,
  });
  const [parameters, setParameters] = useState<ParameterProps>({});
  const method = operation ? operation : aggregation?.method;

  // Fetch some default data
  useEffect(() => {
    (async () => {
      try {
        if (parameters["indicator_id__in"] === undefined) {
          return;
        }
        // Don't request if parameter with date
        if (!parameters["date__gte"]) {
          return;
        }
        if (!parameters["indicator_id__in"]?.length) {
          setValue({
            fetching: false,
            value: null,
            error: "No indicators found.",
          });
          return;
        }
        const session = new Session("Widget request " + widget.id);
        const output = await new IndicatorData().statistic({
          ...parameters,
          latest_value: true,
          aggregate_methods: [method],
        });
        if (!session.isValid) {
          return;
        }
        setValue({
          fetching: false,
          value: output[method.toLowerCase()],
          error: null,
        });
      } catch (err) {
        setValue({
          fetching: false,
          value: null,
          error: err.toString(),
        });
      }
    })();
  }, [parameters]);

  const ViewOutput = () => {
    if (!value.fetching) {
      if (value.error) {
        return <div className="error">{value.error}</div>;
      }
      try {
        return (
          <span>
            {formatNumber(
              value.value,
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

      <div className="widget__sw">
        <ViewOutput />
      </div>
    </Fragment>
  );
}
