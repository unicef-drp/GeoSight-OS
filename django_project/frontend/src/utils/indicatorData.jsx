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

import { returnValueByGeometry } from "./referenceLayer";
import {
  createDynamicStyle,
  dynamicStyleTypes,
  STYLE_FORM_LIBRARY
} from "./Style";

/**
 * Update data with the style found
 * @param {Array} data Data that will be checked
 * @param {Object} config Layer data that own data
 */
export function UpdateStyleData(data, config) {
  // Update the style and label
  let otherDataRule = null
  let styleRules = []

  // If from style from library
  if (config.style_type === STYLE_FORM_LIBRARY && config.style_data) {
    config = config.style_data
  }
  if (dynamicStyleTypes.includes(config?.style_type)) {
    const styles = createDynamicStyle(data, config.style_type, config.style_config, config.style_data)
    data.forEach(function (data) {
      styleRules = styles[data.admin_level]
      if (styles[data.admin_level]) {
        const filteredRules = styleRules.filter(rule => {
          let ruleStr = rule.rule.replaceAll('x', data.value).replaceAll('and', '&&').replaceAll('or', '||')
          if (rule?.rule?.includes('includes')) {
            ruleStr = rule.rule.replaceAll('"x"', `"${data.value}"`).replaceAll('and', '&&').replaceAll('or', '||')
          }
          try {
            return eval(ruleStr)
          } catch (err) {
            return false
          }
        })
        data.style = filteredRules[0] ? filteredRules[0] : otherDataRule
        data.label = data.style?.name
      }
    })
    return data
  } else {
    let style = config.style
    if (style) {
      styleRules = style
      otherDataRule = style.filter(
        rule => rule.active
      ).find(rule => rule.rule.toLowerCase() === 'other data')
    }
    data.forEach(function (data) {
      const filteredRules = styleRules.filter(rule => {
        let ruleStr = rule.rule.replaceAll('x', data.value).replaceAll('and', '&&').replaceAll('or', '||')
        if (rule?.rule?.includes('includes')) {
          ruleStr = rule.rule.replaceAll('"x"', `"${data.value}"`).replaceAll('and', '&&').replaceAll('or', '||')
        }
        try {
          return eval(ruleStr)
        } catch (err) {
          return false
        }
      })
      data.style = filteredRules[0] ? filteredRules[0] : otherDataRule
      data.label = data.style?.name
    })
    return data
  }
}

/**
 * Update indicator layer with geography code for related table
 */
const updateIndicatorLayerWithGeographyCode = (indicatorLayer, relatedTables) => {
  // Check if current indicator layer is the related table
  if (indicatorLayer?.related_tables?.length) {
    const relatedTable = relatedTables.find(rt => rt.id === indicatorLayer.related_tables[0].id)
    if (relatedTable) {
      indicatorLayer.config.geography_code_field_name = relatedTable.geography_code_field_name
    }
  }
}

/**
 * Update indicator layer with geography code for related table
 */
export const getIndicatorValueByGeometry = (
  indicatorLayer, indicators, indicatorsData, relatedTables, relatedTableData,
  selectedGlobalTime, geoField, filteredGeometries
) => {
  updateIndicatorLayerWithGeographyCode(indicatorLayer, relatedTables)
  return returnValueByGeometry(
    indicatorLayer, indicators, indicatorsData, relatedTableData,
    selectedGlobalTime, geoField, filteredGeometries
  )
}