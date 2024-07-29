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
   Geometry Center
   ========================================================================== */

import { hasLayer, hasSource, removeLayer } from "../../utils";
import { BEFORE_LAYER, CONTEXT_LAYER_ID } from "../../Layers/ReferenceLayer";

const INDICATOR_LABEL_ID = 'indicator-label'
let lastFeatures = null;

/** Remove label **/
export const resetLabel = (map) => {
  lastFeatures = null;
  if (hasLayer(map, INDICATOR_LABEL_ID)) {
    removeLayer(map, INDICATOR_LABEL_ID);
  }
}

/** Show Label **/
export const showLabel = (map) => {
  if (hasLayer(map, INDICATOR_LABEL_ID)) {
    map.setLayoutProperty(INDICATOR_LABEL_ID, 'visibility', 'visible');
  }
}

/** Hide Label **/
export const hideLabel = (map) => {
  if (hasLayer(map, INDICATOR_LABEL_ID)) {
    map.setLayoutProperty(INDICATOR_LABEL_ID, 'visibility', 'none');
  }
}

/** Render label **/
export const renderLabel = (map, features, config) => {
  if (JSON.stringify(features) === JSON.stringify(lastFeatures)) {
    return
  }
  lastFeatures = features
  const layout = {
    'text-anchor': 'bottom',
    'text-size': 14,
    'text-variable-anchor': ['center'],
  }
  const paint = {
    'text-halo-blur': 2
  }
  let minZoom = 0
  let maxZoom = 24

  // Check the style
  const { text, style } = config
  if (text && style) {
    minZoom = style.minZoom ? style.minZoom : minZoom
    maxZoom = style.maxZoom ? style.maxZoom : maxZoom
    paint['text-color'] = style.fontColor.replaceAll('##', '#')
    if (style.fontFamily) {
      const font = style.fontFamily.split(',')[0].replaceAll('"', '')
      layout['text-font'] = [font, font]
    } else {
      layout['text-font'] = ['Arial', 'Arial']
    }
    layout['text-size'] = style.fontSize
    paint['text-halo-color'] = style.haloColor.replaceAll('##', '#')
    paint['text-halo-width'] = style.haloWeight ? 1 : 0

    const textField = ['format']
    const formattedText = text.replaceAll('{', ' {{').replaceAll('}', '}} ')
    const separators = [' {', '} '];
    formattedText.split('\n').map((label, idx) => {
      label.split(new RegExp(separators.join('|'), 'g')).map(row => {
        if (row.includes('{')) {
          textField.push(['get', row.replace('{', '').replace('}', '')])
        } else if (row.includes('round')) {
          const property = textField[textField.length - 1][1]
          if (property) {
            const decimalNumber = row.split(/.round\(|\)/)
            if (decimalNumber[0]) {
              textField.push(row)
            } else if (!isNaN(parseInt(decimalNumber[1]))) {
              const decimalPlace = parseInt(decimalNumber[1])
              if (decimalNumber[2]) {
                textField.push(decimalNumber[2])
              }
              features.map(feature => {
                if (feature.properties[property]) {
                  try {
                    feature.properties[property] = feature.properties[property].round(decimalPlace)
                  } catch (err) {

                  }
                }
              })
            }
          }
        } else if (row) {
          textField.push(row)
        }
      })
      textField.push('\n')
    })
    layout['text-field'] = textField
  }
  if (hasLayer(map, INDICATOR_LABEL_ID)) {
    map.removeLayer(INDICATOR_LABEL_ID)
  }
  if (hasSource(map, INDICATOR_LABEL_ID)) {
    map.removeSource(INDICATOR_LABEL_ID)
  }
  map.addSource(INDICATOR_LABEL_ID, {
    'type': 'geojson',
    'data': {
      type: 'FeatureCollection',
      features: features
    }
  });
  const contextLayerIds = map.getStyle().layers.filter(
    layer => layer.id.includes(CONTEXT_LAYER_ID) || layer.id === BEFORE_LAYER
  )
  map.addLayer(
    {
      id: "indicator-label",
      type: 'symbol',
      source: INDICATOR_LABEL_ID,
      filter: ['==', '$type', 'Point'],
      layout: layout,
      paint: paint,
      maxzoom: maxZoom,
      minzoom: minZoom

    },
    contextLayerIds[0]?.id
  );
}