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

import React from 'react';
import { useSelector } from "react-redux";
import { getLayerDataCleaned } from "../../../../utils/indicatorLayer";
import {
  createDynamicStyle,
  dynamicStyleTypes,
  returnLayerStyleConfig
} from "../../../../utils/Style";
import { NO_DATA_RULE } from "../../../Admin/Style/Form/StyleRules";

import './style.scss'

/**
 * Get rules of data.
 */
const rulesLayer = (
  layer, indicators, indicatorsData,
  relatedTableData, selectedGlobalTime, geoField, admin_level, filteredGeometries
) => {
  // Get rules
  let config = returnLayerStyleConfig(layer, indicators)
  let style = config.style
  if (dynamicStyleTypes.includes(config.style_type)) {
    let data = getLayerDataCleaned(
      indicatorsData, relatedTableData, layer, selectedGlobalTime, geoField,
      config?.style_config?.sync_filter ? filteredGeometries : null
    )
    style = createDynamicStyle(data[0]?.data, config.style_type, config.style_config, config.style_data)
    if (style[admin_level]) {
      const adminStyle = style[admin_level].filter(st => st.name !== NO_DATA_RULE)
      adminStyle.reverse()
      style = [...adminStyle, ...style['NoData']]
    } else {
      style = style['NoData']
    }
  }
  if (style) {
    style = style.filter(st => st.active)
  }
  return style
}
/**
 * Render indicator legend
 * @param {dict} layer Layer that will be checked
 * @param {str} name Name of layer
 */
const RenderIndicatorLegend = ({ layer, name }) => {
  const { indicators, geoField } = useSelector(state => state.dashboard.data)
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  const indicatorsData = useSelector(state => state.indicatorsData);
  const relatedTableData = useSelector(state => state.relatedTableData);
  const filteredGeometries = useSelector(state => state.filteredGeometries);

  let rules = rulesLayer(
    layer, indicators, indicatorsData, relatedTableData,
    selectedGlobalTime, geoField, selectedAdminLevel?.level, filteredGeometries
  )
  return (
    <div className='MapLegendSection'>
      <div className='MapLegendSectionTitle'>{name}</div>
      {
        rules && rules.length ?
          <div className='IndicatorLegendSection'>
            {
              rules.map(rule => {
                const border = `1px solid ${rule.outline_color === '#FFFFFF' ? '#DDDDDD' : rule.outline_color}`
                return <div key={rule.name} className='IndicatorLegendRow'>
                  <div
                    className='IndicatorLegendRowBlock'
                    style={{ backgroundColor: rule.color }}>
                  </div>
                  <div className='IndicatorLegendRowName' title={rule.name}>
                    {rule.name}
                  </div>
                </div>
              })
            }
          </div> : ""
      }
    </div>
  )
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
