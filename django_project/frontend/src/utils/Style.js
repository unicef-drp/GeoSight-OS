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
 * __date__ = '13/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { isArray } from "chart.js/helpers";
import { dictDeepCopy } from "./main";
import { NO_DATA_RULE } from "../pages/Admin/Style/Form/StyleRules";
import { getLayerDataCleaned, SingleIndicatorTypes } from "./indicatorLayer";
import { fetchingData } from "../Requests";


export const STYLE_FORM_LIBRARY = 'Style from library.'
const DYNAMIC_QUANTITATIVE = 'Dynamic quantitative style.'
const DYNAMIC_QUALITATIVE = 'Dynamic qualitative style.'

const NATURAL_BREAKS = 'Natural breaks.'
const EQUIDISTANT = 'Equidistant.'
const QUANTILE = 'Quantile.'
const STD_DEFIATION = 'Std deviation.'
const ARITHMETIC_PROGRESSION = 'Arithmetic progression.'
const GEOMETRIC_PROGRESSION = 'Geometric progression.'


export const dynamicStyleTypes = [
  DYNAMIC_QUANTITATIVE, DYNAMIC_QUALITATIVE
]

export let COLOR_PALETTE_DATA = null

/**
 * Update color data
 */
export async function updateColorPaletteData() {
  return new Promise((resolve, reject) => {
    if (!COLOR_PALETTE_DATA) {
      fetchingData(
        `/api/color/palette/list`,
        {}, {}, (response, error) => {
          if (response) {
            COLOR_PALETTE_DATA = response
            resolve(response)
          } else {
            reject(error)
          }
        }
      )
    } else {
      resolve(COLOR_PALETTE_DATA)
    }
  });
}

/** Return layer style config */
export function returnLayerStyleConfig(layer, indicators) {
  let config = {}
  if (layer.id) {
    config = dictDeepCopy(layer)
    // Use layer rules
    // If not, use first indicator rules
    if (SingleIndicatorTypes.includes(layer.type)) {
      const indicatorDetail = indicators.find(indicator => indicator.id === layer?.indicators[0]?.id)
      if (!layer.override_style && indicatorDetail) {
        config = indicatorDetail
      }
    } else if (layer.indicators?.length > 1) {
      config.style = layer.indicators
    }
  }

  // If from style from library
  if (config.style_type === STYLE_FORM_LIBRARY && config.style_data) {
    config = config.style_data
  }
  return config
}


/** Getting style of layer ***/
export const indicatorLayerStyle = (
  layer, indicators, indicatorsData,
  relatedTableData, selectedGlobalTime, geoField, admin_level, filteredGeometries,
  initConfig, referenceLayer
) => {
  // Get rules
  let config = returnLayerStyleConfig(layer, indicators)
  if (initConfig) {
    config = initConfig
  }
  let style = config.style
  if (dynamicStyleTypes.includes(config.style_type)) {
    let data = getLayerDataCleaned(
      indicatorsData, relatedTableData, layer, selectedGlobalTime, geoField,
      config?.style_config?.sync_filter ? filteredGeometries : null,
      referenceLayer, admin_level
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
 * Create colors from palette
 * @param colors
 * @param classNum
 */
export function createColors(colors, classNum) {
  const out = []
  for (let idx = 0; idx < classNum; idx++) {
    let idxInColors = (colors.length - 1) * idx / (classNum - 1)
    if (isNaN(idxInColors)) {
      idxInColors = 0
    }
    const before = Math.floor(idxInColors)
    const after = Math.ceil(idxInColors)
    out.push(
      middleColor(colors[before], colors[after], (idxInColors - before))
    )
  }
  return out
}

/**
 * Create colors from palette
 * @param paletteId
 * @param classNum
 */
export function createColorsFromPaletteId(paletteId, classNum, isReverse) {
  let colors = []
  let palette = null;
  if (COLOR_PALETTE_DATA) {
    palette = COLOR_PALETTE_DATA.find(data => data.id === paletteId)
  }
  if (!palette || isNaN(classNum)) {
    colors = []
  } else {
    colors = createColors(palette.colors, classNum)
  }
  if (isReverse) {
    colors.reverse()
  }
  return colors
}

/***
 * Create dynamic style using style config.
 * @param data List of data that will be used.
 * @param styleType Type of style.
 * @param config Dictionary of configuration.
 * @param styleData Dictionary of style data.
 * @returns {*[]}
 */
export function createDynamicStyle(data, styleType, config, styleData) {
  debugger
  if (config?.no_data_rule?.outline_size) {
    config.no_data_rule.outline_size = parseFloat(config.no_data_rule.outline_size)
    if (isNaN(config.no_data_rule.outline_size)) {
      config.no_data_rule.outline_size = 0
    }
  }
  // If library, override the config
  if (styleType === STYLE_FORM_LIBRARY) {
    styleType = styleData.style_type
    config = styleData.style_config
  }
  let valuesByAdmin = {}
  let uniqueValues = []
  const output = {}
  if (!(
    !data || !isArray(data) || !config || config?.color_palette === undefined ||
    config?.dynamic_classification === undefined ||
    !dynamicStyleTypes.includes(styleType))
  ) {
    let numClass = 1
    data.map(row => {
      if (!valuesByAdmin[row.admin_level]) {
        valuesByAdmin[row.admin_level] = []
      }
      if (![undefined, null].includes(row.value)) {
        valuesByAdmin[row.admin_level].push(row.value)
      }
    })
    for (let [admin_level, values] of Object.entries(valuesByAdmin)) {
      let styles = []
      values.sort()


      let classifications = []
      if (values?.length) {
        if (values.length === 1) {
          values.push(values[0])
        }
        if (styleType === DYNAMIC_QUALITATIVE) {
          uniqueValues = Array.from(new Set(values))
          values = Array.from(new Set(values))
          numClass = values.length
        } else if (styleType === DYNAMIC_QUANTITATIVE) {
          uniqueValues = Array.from(new Set(values))
          numClass = config.dynamic_class_num > uniqueValues.length - 1 ? uniqueValues.length - 1 : config.dynamic_class_num
        }
        const colors = createColorsFromPaletteId(config.color_palette, numClass, config.color_palette_reverse)
        numClass = colors.length

        /** Generate qualitative styles**/
        if (styleType === DYNAMIC_QUALITATIVE) {
          colors.map((color, idx) => {
            const usedValue = values[idx]
            styles.push(
              {
                id: idx,
                name: usedValue,
                rule: `x==${usedValue}`,
                color: color,
                outline_color: !config.sync_outline ? config.outline_color : color,
                outline_size: config.outline_size,
                order: idx,
                active: true
              }
            )
          })
        }
        /** Generate quantitative styles**/
        else if (styleType === DYNAMIC_QUANTITATIVE) {
          values = values.filter(val => !isNaN(val))
          // If the unique values are just 2
          // We can show exactly 2 classification
          if (uniqueValues.length <= 2) {
            const colors = createColorsFromPaletteId(config.color_palette, uniqueValues.length, config.color_palette_reverse)
            colors.map((color, idx) => {
              const usedValue = uniqueValues[idx]
              styles.push(
                {
                  id: idx,
                  name: usedValue,
                  rule: `x==${usedValue}`,
                  color: color,
                  outline_color: !config.sync_outline ? config.outline_color : color,
                  outline_size: config.outline_size,
                  order: idx,
                  active: true
                }
              )
            })
          } else {
            if (values.length) {
              const series = new geostats(values)
              console.log(series)
              switch (config.dynamic_classification) {
                case NATURAL_BREAKS:
                  classifications = series.getClassJenks(numClass)
                  break
                case EQUIDISTANT:
                  classifications = series.getEqInterval(numClass)
                  break
                case QUANTILE:
                  classifications = series.getQuantile(numClass)
                  break
                case STD_DEFIATION:
                  classifications = series.getStdDeviation(numClass)
                  break
                case ARITHMETIC_PROGRESSION:
                  classifications = series.getArithmeticProgression(numClass)
                  break
                case GEOMETRIC_PROGRESSION:
                  classifications = series.getGeometricProgression(numClass)
                  break
              }

              // Create classification
              for (let idx = 0; idx < classifications.length; idx++) {
                if (idx !== 0) {
                  if ([classifications[idx - 1], classifications[idx]].includes(undefined)) {
                    continue
                  }
                  const below = classifications[idx - 1];
                  const top = classifications[idx];
                  const belowLabel = below.toFixed(2);
                  const topLabel = top.toFixed(2);
                  const color = colors[idx - 1]
                  styles.push(
                    {
                      id: idx,
                      name: below === top ? belowLabel : `${belowLabel} - ${topLabel}`,
                      rule: below === top ? `x==${below}` : `x>=${below} and x<=${top}`,
                      color: color,
                      outline_color: !config.sync_outline ? config.outline_color : color,
                      outline_size: config.outline_size,
                      order: idx,
                      active: true
                    }
                  )
                }
              }
              console.log(styles)
            }
          }
        }
      }
      if (config?.no_data_rule?.active) {
        styles.push(config?.no_data_rule)
      }
      output[admin_level] = styles
    }
  }
  if (config?.no_data_rule?.active) {
    output['NoData'] = [config?.no_data_rule]
  } else {
    output['NoData'] = []
  }
  return output
}

/**
 * Return no data style
 */
export function returnNoDataStyle(layer, indicators) {
  let noDataRule = null
  let config = returnLayerStyleConfig(layer, indicators)
  let style = config.style
  if (dynamicStyleTypes.includes(config.style_type)) {
    const style = createDynamicStyle([], config.style_type, config.style_config, config.style_data)
    return style['NoData'][0]
  } else {
    if (style) {
      noDataRule = style.filter(
        rule => rule.active
      ).find(rule => rule.rule.toLowerCase() === 'no data')
    }
    return noDataRule
  }
}

/***
 * FInd middle color
 * @param color1
 * @param color2
 * @param ratio
 * @returns {*}
 */
function middleColor(color1, color2, ratio) {
  color1 = color1.replace('#', '')
  color2 = color2.replace('#', '')
  const hex = (color) => {
    const colorString = color.toString(16);
    return colorString.length === 1 ? `0${colorString}` : colorString;
  };

  const r = Math.ceil(
    parseInt(color2.substring(0, 2), 16) * ratio
    + parseInt(color1.substring(0, 2), 16) * (1 - ratio),
  );
  const g = Math.ceil(
    parseInt(color2.substring(2, 4), 16) * ratio
    + parseInt(color1.substring(2, 4), 16) * (1 - ratio),
  );
  const b = Math.ceil(
    parseInt(color2.substring(4, 6), 16) * ratio
    + parseInt(color1.substring(4, 6), 16) * (1 - ratio),
  );

  return '#' + hex(r) + hex(g) + hex(b);
};