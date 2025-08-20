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
import { useSelector } from "react-redux";

// Widgets
import { Session } from "../../../utils/Sessions";
import { DateFilterType } from "../Definition";
import { UnitConfig, Widget } from "../../../types/Widget";
import { IndicatorData } from "../../../class/IndicatorData";

const fetchIndicatorData = async (indicatorIds: number[], params: any) => {
  try {
    if (!indicatorIds) {
      throw new Error("Indicators is empty.");
    }
    const response = await new IndicatorData().valueLatest(
      {
        ...params,
        indicator_id__in: indicatorIds.join(","),
      },
      null,
    );
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
  data: Widget;
  applyData: (data: any) => void;
}

/**Base widget that handler widget rendering. */
export default function RequestData({ data, applyData }: Props) {
  const { config } = data;
  const { indicators, date_filter_value } = config;
  const {
    indicatorLayers,
    default_time_mode,
    referenceLayer,
    // @ts-ignore
  } = useSelector((state) => state.dashboard.data);
  const { use_only_last_known_value } = default_time_mode;
  // @ts-ignore
  const filteredGeometries = useSelector((state) => state.filteredGeometries);
  // @ts-ignore
  const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);
  const referenceLayerData = useSelector(
    // @ts-ignore
    (state) => state.referenceLayerData[referenceLayer?.identifier],
  );

  const [countries, setCountries] = useState({});
  const [layerData, setLayerData] = useState({});

  const date_filter_type = use_only_last_known_value;

  // Fetch the data if it is using global filter
  useEffect(() => {
    const newCountries = referenceLayerData?.data?.countries?.map(
      (country: any) => country.ucode,
    );
    if (JSON.stringify(newCountries) !== JSON.stringify(countries)) {
      setCountries(newCountries);
    }
  }, [referenceLayerData?.data]);

  // Fetch the data if it is using no filter or custom
  useEffect(() => {
    (async () => {
      if (!countries || [null, undefined].includes(selectedAdminLevel?.level)) {
        return;
      }
      let params = {
        admin_level: selectedAdminLevel?.level,
        country_geom_id__in: countries,
      };
      if (date_filter_type === DateFilterType.CUSTOM) {
        if (date_filter_value) {
          let [minDateFilter, maxDateFilter] = date_filter_value.split(";");
          params = {
            // @ts-ignore
            time__gte: minDateFilter,
          };
          if (maxDateFilter) {
            // @ts-ignore
            params["time__lte"] = maxDateFilter;
          }
        }
      }
      const session = new Session("Widget request " + data.name);
      setLayerData({
        fetching: true,
        fetched: false,
        data: null,
        error: null,
      });
      const output = await fetchIndicatorData(
        indicators.map((indicator: UnitConfig) => indicator.id),
        params,
      );
      if (!session.isValid) {
        return;
      }
      setLayerData(output);
      if (output.error) {
        throw new Error(output.error);
      }
    })();
  }, [data, selectedAdminLevel, indicatorLayers, date_filter_type, countries]);

  // Fetch the data if it is using no filter or custom
  useEffect(() => {
    let indicatorData: any = null;
    if (layerData) {
      indicatorData = Object.assign({}, layerData);
      if (indicatorData?.fetched && indicatorData?.data) {
        indicatorData.data = indicatorData.data.filter((row: any) => {
          return (
            !filteredGeometries ||
            filteredGeometries?.includes(row.concept_uuid)
          );
        });
      }
    }
    applyData(indicatorData);
  }, [filteredGeometries, layerData]);

  return <></>;
}
