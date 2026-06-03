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
 * __date__ = '28/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   RELATED TABLE LAYER FILTER
   ========================================================================== */

import React from "react";
import { useDispatch } from "react-redux";
import { dictDeepCopy } from "../../../../utils/main";
import WhereInput
  from "../../../../components/SqlQueryGenerator/WhereQueryGenerator/WhereInput";
import { Actions } from "../../../../store/dashboard";

/**
 * Dynamic Indicator config.
 */
export default function DynamicIndicatorLayerMapConfig({ indicatorLayer }) {
  const dispatch = useDispatch();

  let config;
  if (indicatorLayer) {
    config = dictDeepCopy(indicatorLayer.config);
  }

  return (
    <div className={"IndicatorLayerMiddleConfig " + (open ? "Open" : "")}>
      <div className="WhereConfiguration">
        <div className="WhereConfigurationQueryGroup">
          {config
            ? config.exposedVariables.map((data, idx) => {
                return (
                  <WhereInput
                    key={idx}
                    where={data}
                    upperWhere={null}
                    updateWhere={() => {
                      if (
                        JSON.stringify(indicatorLayer.config) !==
                        JSON.stringify(config)
                      ) {
                        indicatorLayer.config = config;
                        dispatch(
                          Actions.IndicatorLayers.update(indicatorLayer),
                        );
                      }
                    }}
                    fields={[
                      {
                        name: data.field,
                        type: "number",
                        value: data.value,
                        options: data.values,
                      },
                    ]}
                    isAll={true}
                    disabledChanges={{ remove: true }}
                  />
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
}
