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
 * __date__ = '20/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   WIDGET
   ========================================================================== */

import React, { memo, useEffect } from "react";
import { useSelector } from "react-redux";

// Widgets
import { DateTimeConfig, WidgetConfig } from "../../../types/Widget";
import { TimeType } from "../Definition";

export interface TimeParametersProps {
  dateTimeConfig: DateTimeConfig;
}

export interface Props {
  config: WidgetConfig;
  parameter: TimeParametersProps;
  setParameter: (data: TimeParametersProps) => void;
}

/**Handling request config that return for requests. */
function TimeParameter({ config, parameter, setParameter }: Props) {
  // ------------------------------------------
  // Time
  // ------------------------------------------
  const selectedGlobalTime = useSelector(
    // @ts-ignore
    (state) => state.selectedGlobalTime,
  );

  const { dateTimeConfig, dateTimeType } = config;
  let { maxDateFilter, minDateFilter } = dateTimeConfig;
  if (dateTimeType === TimeType.SYNC) {
    maxDateFilter = selectedGlobalTime.max;
    minDateFilter = selectedGlobalTime.min;
  }

  // Fetch some default data
  useEffect(() => {
    const newRequestConfig: TimeParametersProps = {
      dateTimeConfig: {
        interval: null,
        minDateFilter: minDateFilter,
        maxDateFilter: maxDateFilter,
      },
    };
    if (JSON.stringify(parameter) !== JSON.stringify(newRequestConfig)) {
      setParameter(newRequestConfig);
    }
  }, [minDateFilter, maxDateFilter]);
  return <></>;
}

export default memo(TimeParameter);
