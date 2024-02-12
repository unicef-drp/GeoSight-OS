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
   BASEMAPS SELECTOR
   ========================================================================== */

import React, { Fragment } from 'react';
import { useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import { indicatorLayerStyle } from "../../../../utils/Style";
import { dictDeepCopy } from "../../../../utils/main";
import {
  getLayerData,
  indicatorHasData
} from "../../../../utils/indicatorLayer";

import './style.scss'
import { allDataIsReady } from "../../../../utils/indicators";


/**
 * Render indicator legend section
 * @param {dict} layer Layer that will be checked
 * @param {str} name Name of layer
 */
const RenderIndicatorLegendSection = ({ rules, name, opacity, onChangeOpacity }) => {
  console.log("RenderIndicatorLegendSection rules", rules);
  return (
    <div className='MapLegendSection'>
      <div className='MapLegendSectionTitle'>{name}</div>
      {
        rules !== null ?
          <Fragment>
            {
              rules.length ?
                <div className='IndicatorLegendSection'>
                  {
                    rules.map(rule => {
                      const border = `1px solid ${rule.outline_color}`
                      return <div className='IndicatorLegendRow'>
                        <div
                          className='IndicatorLegendRowBlock'
                          style={{
                            backgroundColor: rule.color,
                            border: border
                          }}>
                        </div>
                        <div className='IndicatorLegendRowName'
                             title={rule.name}>
                          {rule.name}
                        </div>
                      </div>
                    })
                  }
                </div> : null
            }
          </Fragment> : <div className='Throbber'>
            <CircularProgress/>
          </div>
      }
    </div>
  )
}
/**
 * Render indicator legend
 * @param {dict} layer Layer that will be checked
 * @param {str} name Name of layer
 */
const RenderIndicatorLegend = ({ layer, name }) => {
  console.log("RenderIndicatorLegend");
  const { indicators, geoField } = useSelector(state => state.dashboard.data)
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  const indicatorsData = useSelector(state => state.indicatorsData);
  const relatedTableData = useSelector(state => state.relatedTableData);
  const filteredGeometries = useSelector(state => state.filteredGeometries);

  console.log("layer.multi_indicator_mode", layer.multi_indicator_mode);
  const opacity = 0.6;
  const onChangeOpacity = (value) => {
    console.log('onChangeOpacity', value);
  };

  if (layer.multi_indicator_mode === 'Pin') {
    return layer.indicators.map(indicator => {
      const hasData = indicatorHasData(indicatorsData, indicator)
      let rules = null
      if (hasData) {
        let indicatorData = indicator
        if (!indicator.style) {
          const obj = indicators.find(ind => ind.id === indicator.id)
          if (obj) {
            indicatorData = dictDeepCopy(obj)
            indicatorData.indicators = [indicator]
          }
        }
        rules = indicatorLayerStyle(
          layer, indicators, indicatorsData, relatedTableData,
          selectedGlobalTime, geoField, selectedAdminLevel?.level, filteredGeometries,
          indicatorData
        )
      }
      return <RenderIndicatorLegendSection
        rules={rules}
        name={indicator.name}
        opacity={opacity}
        onChangeOpacity={onChangeOpacity}
      />
    })
  }
  const layerData = getLayerData(indicatorsData, relatedTableData, layer)
  const hasData = allDataIsReady(layerData)
  let rules = null
  if (hasData) {
    rules = indicatorLayerStyle(
      layer, indicators, indicatorsData, relatedTableData,
      selectedGlobalTime, geoField, selectedAdminLevel?.level, filteredGeometries
    )
  }
  return <RenderIndicatorLegendSection
      rules={rules} name={name}
      opacity={opacity}
      onChangeOpacity={onChangeOpacity}
  />
}
/** Map Legend.
 */
export default function MapLegend() {
  const { compareMode } = useSelector(state => state.mapMode)
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const selectedIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);

  return <div className='MapLegend'>
    {
      selectedIndicatorLayer.id ?
        <RenderIndicatorLegend
          layer={selectedIndicatorLayer}
          name={
            selectedIndicatorLayer.name + (compareMode ? " (Outline)" : "")
          }
        />
        : ""
    }
    {
      selectedIndicatorSecondLayer.id ?
        <RenderIndicatorLegend
          layer={selectedIndicatorSecondLayer}
          name={selectedIndicatorSecondLayer.name + " (Inner)"}
        />
        : ""
    }
  </div>
}
