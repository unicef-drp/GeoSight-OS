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

import React, { useEffect, useState } from "react";

// Widgets
import { Session } from "../../../utils/Sessions";
import { Widget } from "../../../types/Widget";
import { IndicatorData, ParameterProps } from "../../../class/IndicatorData";
import RequestParameter from "./RequestParameter";

const fetchIndicatorData = async (params: ParameterProps) => {
  try {
    const response = await new IndicatorData().valueLatest(params, null, [
      "geometry_code",
      "entity_name",
      "value",
      "indicator_name",
      "indicator_shortcode",
      "concept_uuid",
    ]);
    return {
      fetching: false,
      fetched: true,
      receivedAt: Date.now(),
      // @ts-ignore
      data: response,
      // @ts-ignore
      error: null,
    };
  } catch (err) {
    return {
      fetching: false,
      fetched: true,
      receivedAt: Date.now(),
      // @ts-ignore
      data: null,
      error: err.response?.data?.detail
        ? err.response?.data?.detail
        : err.message,
    };
  }
};

export interface Props {
  widget: Widget;
  applyData: (data: any) => void;
}

/**Base widget that handler widget rendering. */
export default function RequestData({ widget, applyData }: Props) {
  const [parameters, setParameters] = useState<ParameterProps>({});

  // Fetch the data if it is using no filter or custom
  useEffect(() => {
    (async () => {
      if (parameters["indicator_id__in"] === undefined) {
        return;
      }
      if (!parameters["indicator_id__in"]?.length) {
        applyData({
          fetching: false,
          fetched: true,
          data: null,
          error: "No indicators found.",
        });
        return;
      }
      // Don't request if parameter with date
      if (!parameters["date__gte"]) {
        return;
      }
      const session = new Session("Widget request " + widget.name);
      applyData({
        fetching: true,
        fetched: false,
        data: null,
        error: null,
      });
      const output = await fetchIndicatorData(parameters);
      if (!session.isValid) {
        return;
      }
      applyData(output);
    })();
  }, [parameters]);

  return (
    <RequestParameter
      widget={widget}
      setParameter={(newParameters: ParameterProps) => {
        if (JSON.stringify(parameters) !== JSON.stringify(newParameters)) {
          setParameters(newParameters);
        }
      }}
    />
  );
}
