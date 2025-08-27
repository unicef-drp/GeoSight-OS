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
import { UnitConfig, WidgetConfig } from "../../../types/Widget";
import { SeriesDataType } from "../Definition";
import { Indicator } from "../../../types/Indicator";

export interface UnitParametersProps {
  indicators: UnitConfig[];
  geographic_units: UnitConfig[];
}

export interface Props {
  config: WidgetConfig;
  parameter: UnitParametersProps[];
  setParameter: (data: UnitParametersProps[]) => void;
}

/**Handling request config that return for requests. */
function UnitParameters({ config, parameter, setParameter }: Props) {
  // ------------------------------------------
  // Get the indicators
  // ------------------------------------------
  const selectedIndicatorLayer = useSelector(
    // @ts-ignore
    (state) => state.selectedIndicatorLayer,
  );
  const selectedIndicatorSecondLayer = useSelector(
    // @ts-ignore
    (state) => state.selectedIndicatorSecondLayer,
  );
  let indicators: UnitConfig[] = [];
  switch (config.indicatorsType) {
    case SeriesDataType.PREDEFINED: {
      indicators = config.indicators;
      break;
    }
    case SeriesDataType.SYNC: {
      selectedIndicatorLayer.indicators?.map((indicator: Indicator) => {
        indicators.push({
          id: indicator.id,
          name: indicator.name,
          color: null,
        });
      });
      selectedIndicatorSecondLayer.indicators?.map((indicator: Indicator) => {
        indicators.push({
          id: indicator.id,
          name: indicator.name,
          color: null,
        });
      });
      break;
    }
  }

  // Get units
  let units: UnitConfig[] = [];
  switch (config.geographicalUnitType) {
    case SeriesDataType.PREDEFINED: {
      units = config.geographicalUnit;
      break;
    }
  }

  // Fetch some default data
  useEffect(() => {
    const newRequestConfig: UnitParametersProps = {
      geographic_units: units,
      indicators: indicators,
    };
    if (JSON.stringify(parameter) !== JSON.stringify([newRequestConfig])) {
      setParameter([newRequestConfig]);
    }
  }, [indicators, units]);
  return <></>;
}

export default memo(UnitParameters);
