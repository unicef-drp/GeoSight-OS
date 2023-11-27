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

import { getRelatedTableData } from "./relatedTable";
import { UpdateStyleData } from "./indicatorData";
import { extractCode } from "./georepo";
import {
  indicatorLayerId,
  isIndicatorLayerLikeIndicator
} from "./indicatorLayer";
import { dynamicStyleTypes, returnLayerStyleConfig } from "./Style";
import { dictDeepCopy } from "./main";

const temporary = {}

/**
 * Return value by geometry
 */
export function returnValueByGeometry(
  layer, indicators, indicatorsData, relatedTableData,
  selectedGlobalTime, geoField, filteredGeometries
) {
  const identifier = JSON.stringify(layer) + JSON.stringify(indicators) + JSON.stringify(indicatorsData) + JSON.stringify(relatedTableData) + JSON.stringify(selectedGlobalTime) + JSON.stringify(geoField) + JSON.stringify(filteredGeometries)
  const temp = temporary[identifier]
  if (temp) {
    return temp
  }
  indicatorsData = dictDeepCopy(indicatorsData)
  relatedTableData = dictDeepCopy(relatedTableData)

  let allData = []
  if (Object.keys(layer).length) {
    const id = indicatorLayerId(layer)
    // This is for non indicators
    if (indicatorsData[id]?.fetched) {
      indicatorsData[id]?.data.forEach(function (data) {
        data.indicatorLayer = layer
        allData.push(data);
      })
    }
    // This is for indicators
    if (layer.indicators.length) {
      layer.indicators.map(indicatorLayer => {
        const indicator = indicators.find(indicator => indicatorLayer.id === indicator.id)
        if (indicator && indicatorsData[indicator.id]?.fetched) {
          indicatorsData[indicator.id]?.data.forEach(function (data) {
            data.indicator = indicator
            allData.push(data);
          })
        }
      })
    } else if (layer.related_tables.length) {
      const { rows } = getRelatedTableData(
        relatedTableData[layer.related_tables[0].id]?.data,
        layer.config,
        selectedGlobalTime,
        geoField
      )
      if (rows) {
        const data = UpdateStyleData(rows, layer)
        data.forEach(function (rowData) {
          rowData.related_table = layer.related_tables[0]
          allData.push(rowData);
        })
      }
    }
  }

  let config = returnLayerStyleConfig(layer, indicators)
  if (dynamicStyleTypes.includes(config.style_type)) {
    if (config?.style_config?.sync_filter && filteredGeometries) {
      allData = allData.filter(row => filteredGeometries.includes(row.concept_uuid))
    }
    allData = UpdateStyleData(allData, config)
  }

  const byGeometry = {}
  allData.forEach(function (rowData) {
    const code = extractCode(rowData, geoField)
    if (!byGeometry[code]) {
      byGeometry[code] = []
    }
    byGeometry[code].push(rowData);
  })

  // Save to temporary
  temporary[identifier] = byGeometry
  return byGeometry
}

/**
 * Return style
 */
export function returnStyle(layer, values, noDataStyle) {
  let style = null
  if (layer?.indicators?.length === 1 || layer?.related_tables?.length === 1 || isIndicatorLayerLikeIndicator(layer)) {
    if (values) {
      const indicatorData = values[0];
      if (indicatorData) {
        style = indicatorData.style ? indicatorData.style : { hide: true }
      } else {
        style = noDataStyle;
      }
    } else {
      style = noDataStyle;
    }
  }
  return style
}
