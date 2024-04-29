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

import { queryingFromDictionary } from "./queryExtraction";

/**
 * Return data from indicators.
 * @param {int} layer_id ID Of Layer
 * @param {string} layer_used Layer that used.
 * @param {string} layer Layer that used.
 * @param {string} property_value Key of property that will be used.
 * @param {boolean} ignore_property_value Ignore property_value.
 */
export function cleanLayerData(
  layer_id, layer_used,
  layer, property_value,
  ignore_property_value
) {
  switch (layer_used) {
    case definition.WidgetLayerUsed.INDICATOR:
    case definition.WidgetLayerUsed.INDICATOR_LAYER:
      if (layer) {
        if (layer.fetched && layer.data) {
          const output = [];
          layer.data.forEach(function (layer) {
            if (ignore_property_value) {
              output.push(layer)
            } else if (layer[property_value] !== undefined) {
              output.push({
                ...layer,
                'value': layer[property_value],
              })
            }
          })
          return output;
        } else if (layer.error) {
          throw new Error(layer.error.data.detail);
        } else {
          return null;
        }
      } else {
        throw new Error(`${layer_used} with id '${layer_id}' does not exist.`);
      }
      return null;
    default:
      throw new Error(`Plugin using Layer : ${layer_used} does not work.`);
  }
}

export function filteredGeoms(indicators, query, level) {
  if (query) {
    let data = queryingFromDictionary(indicators, query)
    if (data[level]) {
      return data[level].filter(row => {
        return row
      }).map(row => {
        return row.concept_uuid
      })
    }
  }
  let geoms = []
  indicators.map(indicator => {
    if (indicator.fetched && indicator.data) {
      geoms = geoms.concat(indicator.data.map(data => data.concept_uuid))
    }
  })
}

export function allDataIsReady(indicatorsData) {
  let loaded = true
  for (const [key, value] of Object.entries(indicatorsData)) {
    if (!value?.fetched) {
      loaded = false
    }
  }
  return loaded
}