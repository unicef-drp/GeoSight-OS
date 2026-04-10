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
import { UnitConfig, Widget } from "../../../types/Widget";
import UnitParameters, { UnitParametersProps } from "./UnitParameters";
import TimeParameter, { TimeParametersProps } from "./TimeParameter";
import { CountryDatasetView } from "../../../types/DatasetView";
import { ParameterProps } from "../../../class/IndicatorData";
import Match from "../../../utils/Match";
import { isProjectUsingConceptUUID } from "../../../selectors/dashboard";

export interface Props {
  widget: Widget;
  setParameter: (parameter: ParameterProps) => void;
}

/**Base widget that handler widget rendering. */
export default function RequestParameter({ widget, setParameter }: Props) {
  const { config } = widget;

  const isUsingConceptUUID = useSelector(isProjectUsingConceptUUID());

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
    let params: any = {
      admin_level: selectedAdminLevel?.level,
      indicator_id__in: indicators,
    };

    // Check filtered geometries
    if (filteredGeometries && filteredGeometries.length > 0) {
      const isUUID = Match.String.isUUID(filteredGeometries[0]);
      if (isUUID) {
        params["concept_uuid__in"] = filteredGeometries;
      } else {
        params["geom_id__in"] = filteredGeometries;
      }
    } else {
      // --------------------------------
      // Features:
      //  Switch parameter by concept_uuid
      if (!isUsingConceptUUID) {
        // @ts-ignore
        params["country_geom_id__in"] =
          referenceLayerData?.data?.countries?.map(
            (country: CountryDatasetView) => country.ucode,
          );
      } else {
        // @ts-ignore
        params["country_concept_uuid__in"] =
          referenceLayerData?.data?.countries?.map(
            (country: CountryDatasetView) => country.concept_uuid,
          );
      }
    }
    // --------------------------------
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
    setParameter(params);
  }, [
    filteredGeometries,
    selectedAdminLevel,
    countries,
    unitParameter,
    timeParameter,
  ]);

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
