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
import { UnitConfig, Widget } from "../../../types/Widget";
import { IndicatorData } from "../../../class/IndicatorData";
import UnitParameters, { UnitParametersProps } from "./UnitParameters";
import TimeParameter, { TimeParametersProps } from "./TimeParameter";

const fetchIndicatorData = async (params: any) => {
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
  data: Widget;
  applyData: (data: any) => void;
}

/**Base widget that handler widget rendering. */
export default function RequestData({ data, applyData }: Props) {
  const { config } = data;
  const { dateTimeType } = config;
  // @ts-ignore
  const referenceLayers = useSelector((state) => state.map?.referenceLayers);
  const referenceLayer = referenceLayers[0];
  // @ts-ignore
  const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);
  const referenceLayerData = useSelector(
    // @ts-ignore
    (state) => state.referenceLayerData[referenceLayer?.identifier],
  );
  // @ts-ignore
  const filteredGeometries = useSelector((state) => state.filteredGeometries);

  const [countries, setCountries] = useState({});
  const [layerData, setLayerData] = useState({});
  const [unitParameter, setUnitParameter] = useState<UnitParametersProps[]>([]);
  const [timeParameter, setTimeParameter] =
    useState<TimeParametersProps | null>(null);

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
      const unitParameterUsed = unitParameter[0];
      if (!unitParameterUsed) {
        return;
      }
      if (!countries || [null, undefined].includes(selectedAdminLevel?.level)) {
        return;
      }
      const indicators = unitParameterUsed.indicators.map(
        (indicator: any) => indicator.id,
      );
      if (!indicators.length) {
        setLayerData({
          fetching: false,
          fetched: true,
          data: null,
          error: "No indicators found.",
        });
        return;
      }
      let params: any = {
        admin_level: selectedAdminLevel?.level,
        reference_dataset: referenceLayer?.identifier,
        indicator_id__in: indicators,
      };
      if (unitParameterUsed.geographic_units.length > 0) {
        params["geom_id__in"] = unitParameterUsed.geographic_units.map(
          (unit: UnitConfig) => unit.id,
        );
      }
      const dateTimeConfig = timeParameter.dateTimeConfig;
      if (dateTimeConfig && dateTimeConfig.minDateFilter) {
        params["date__gte"] = dateTimeConfig.minDateFilter.split("T")[0];
        if (dateTimeConfig.maxDateFilter) {
          // @ts-ignore
          params["date__lte"] = dateTimeConfig.maxDateFilter.split("T")[0];
        }
      }
      // Don't request if parameter with date
      if (!params["date__gte"]) {
        return;
      }
      const session = new Session("Widget request " + data.name);
      setLayerData({
        fetching: true,
        fetched: false,
        data: null,
        error: null,
      });
      const output = await fetchIndicatorData(params);
      if (!session.isValid) {
        return;
      }
      setLayerData(output);
    })();
  }, [selectedAdminLevel, countries, unitParameter, timeParameter]);

  // Fetch the data if it is using no filter or custom
  useEffect(() => {
    let indicatorData: any = null;
    if (layerData) {
      indicatorData = Object.assign({}, layerData);
      if (indicatorData?.fetched && indicatorData?.data) {
        indicatorData.data = indicatorData.data.filter((row: any) => {
          return (
            !filteredGeometries ||
            filteredGeometries?.includes(row.concept_uuid) ||
            filteredGeometries?.includes(row.geom_id)
          );
        });
      }
    }
    applyData(indicatorData);
  }, [filteredGeometries, layerData]);

  return (
    <>
      <UnitParameters
        config={config}
        parameter={unitParameter}
        setParameter={setUnitParameter}
      />
      <TimeParameter
        config={config}
        parameter={timeParameter}
        setParameter={setTimeParameter}
      />
    </>
  );
}
