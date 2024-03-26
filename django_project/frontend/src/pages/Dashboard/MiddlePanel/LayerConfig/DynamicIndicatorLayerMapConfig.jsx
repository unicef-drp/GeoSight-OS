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

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { dictDeepCopy } from "../../../../utils/main";
import WhereInput
  from "../../../../components/SqlQueryGenerator/WhereQueryGenerator/WhereInput";
import { Actions } from "../../../../store/dashboard";

/**
 * Dynamic Indicator config.
 */
export default function DynamicIndicatorLayerMapConfig() {
  const dispatch = useDispatch();
  const { indicatorLayers } = useSelector(state => state.dashboard.data)
  const selectedDynamicIndicatorLayer = useSelector(state => state.selectedDynamicIndicatorLayer)

  const [open, setOpen] = useState(false);

  /** When selected is changed **/
  useEffect(() => {
    setOpen(selectedDynamicIndicatorLayer !== null)
  }, [selectedDynamicIndicatorLayer]);

  let config;
  const layer = indicatorLayers.find(layer => layer.id && layer.id === selectedDynamicIndicatorLayer)
  if (layer) {
    config = dictDeepCopy(layer.config)
  }

  return <div
    className={'IndicatorLayerMiddleConfig ' + (open ? 'Open' : '')}>
    <div className='WhereConfiguration'>
      <div className='WhereConfigurationQueryGroup'>
        {
          config ?
            config.exposedVariables.map((data, idx) => {
              return <WhereInput
                key={idx}
                where={data}
                upperWhere={null}
                updateWhere={() => {
                  if (JSON.stringify(layer.config) !== JSON.stringify(config)) {
                    layer.config = config
                    dispatch(Actions.IndicatorLayers.update(layer))
                  }
                }}
                fields={[
                  {
                    "name": data.field,
                    "type": "number",
                    "value": data.value,
                    "options": data.values
                  }
                ]}
                isAll={true}
                disabledChanges={{ remove: true }}
              />
            }) : null
        }
      </div>
    </div>
  </div>
}