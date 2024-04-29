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
import { dictDeepCopy } from "./main";
import { referenceLayerIndicatorLayer } from "./indicatorLayer";

/**
 * Update data with the style found
 * @param {Array} inputData Data that will be checked
 * @param {Object} config Layer data that own data
 */
export function UpdateStyleData(inputData, config) {
  // Update the style and label
  let otherDataRule = null
  let styleRules = []
  inputData = dictDeepCopy(inputData)

  // If from style from library
  if (config.style_type === STYLE_FORM_LIBRARY && config.style_data) {
    config = config.style_data
  }
  if (dynamicStyleTypes.includes(config?.style_type)) {
    const styles = createDynamicStyle(inputData, config.style_type, config.style_config, config.style_data)
    const stylesInStr = {}
    for (const [key, value] of Object.entries(styles)) {
      stylesInStr[key] = JSON.stringify(value)
    }
    inputData.forEach(function (data) {
      styleRules = styles[data.admin_level]
      if (styleRules) {
        if (stylesInStr[data.admin_level] === data.styles) {
          return
        }
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
        data.styles = JSON.stringify(styleRules)
        data.label = data.style?.name
      }
    })
    return inputData
  } else {
    let style = config.style
    if (style) {
      styleRules = style
      otherDataRule = style.filter(
        rule => rule.active
      ).find(rule => rule.rule.toLowerCase() === 'other data')
    }
    inputData?.forEach(function (data) {
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
      data.styles = filteredRules[0] ? filteredRules[0] : otherDataRule
      data.label = data.style?.name
    })
    return inputData
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
  selectedGlobalTime, geoField, filteredGeometries, referenceLayer
) => {
  updateIndicatorLayerWithGeographyCode(indicatorLayer, relatedTables)
  return returnValueByGeometry(
    indicatorLayer, indicators, indicatorsData, relatedTableData,
    selectedGlobalTime, geoField, filteredGeometries, referenceLayer
  )
}

/**
 * Update indicator layer with geography code for related table
 */
export const filterIndicatorsData = (time_min, time_max, data) => {
  const geom_found = [];
  if (!time_min || !time_max) {
    return data
  }
  const min = time_min ? (new Date(time_min).getTime()) / 1000 : null
  const max = time_max ? (new Date(time_max).getTime()) / 1000 : null
  data = data.filter(row => {
    if (!row) {
      return false
    }
    const geomFound = geom_found.includes(row.geometry_code)
    const used = !geomFound && row.time >= min && row.time <= max
    if (used) {
      geom_found.push(row.geometry_code)
    }
    return used
  })
  return data
}
/**
 * Return Indicator Data Id
 * @param id
 * @param referenceLayerIdentifier
 * @param referenceLayerOfIndicatorIdentifier
 * @returns {*|string}
 */
export const getIndicatorDataId = (id, referenceLayerIdentifier, referenceLayerOfIndicatorIdentifier) => {
  return referenceLayerOfIndicatorIdentifier === referenceLayerIdentifier ? id : id + '-' + referenceLayerOfIndicatorIdentifier
}

/**
 * Return Indicator Data by Dataset
 * @param id
 * @param indicatorsData
 * @param layer
 * @param referenceLayer
 * @returns {*|string}
 */
export const getIndicatorDataByLayer = (id, indicatorsData, layer, referenceLayer) => {
  const referenceLayerOfIndicator = referenceLayerIndicatorLayer(referenceLayer, layer)
  const _id = getIndicatorDataId(id, referenceLayer.identifier, referenceLayerOfIndicator.identifier)
  return indicatorsData[_id]
}