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

import maplibregl from 'maplibre-gl';

const NON_ONCLICK_LAYER_IDS = ['indicator-label']

/**
 * Return if layer exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const hasLayer = (map, id) => {
  if (!map) {
    return false
  }
  return typeof map.getLayer(id) !== 'undefined'
}

/**
 * Return if layer exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const removeLayer = (map, id) => {
  if (hasLayer(map, id)) {
    map.removeLayer(id)
  }
}

/**
 * Return if source exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const hasSource = (map, id) => {
  return typeof map.getSource(id) !== 'undefined'
}
/**
 * Return if source exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const removeSource = (map, id) => {
  if (typeof map.getSource(id) !== 'undefined') {
    map.removeSource(id);
  }
}

/**
 * Load image to map
 */
export const loadImageToMap = (map, id, callback) => {
  if (map.listImages().includes(id)) {
    map.removeImage(id)
  }
  map.loadImage(
    id,
    function (error, image) {
      if (!error) {
        map.addImage(id, image);
      }
      callback(error, image)
    }
  );
}

/**
 * Update cursor on hovered
 */
const updateCursorOnHovered = (map) => {
  if (map.measurementMode) {
    map.getCanvas().style.cursor = 'crosshair';
  } else {
    map.getCanvas().style.cursor = 'pointer';
  }
}

/**
 * Update cursor on hovered
 */
const updateCursorOnLeave = (map) => {
  if (map.measurementMode) {
    map.getCanvas().style.cursor = 'crosshair';
  } else {
    map.getCanvas().style.cursor = '';
  }
}
/***
 * Add popup when click
 */
let popup = null
let functionPopup = {}
export const addPopup = (map, id, popupRenderFn) => {
  if (!functionPopup[id]) {
    functionPopup[id] = {}
  }
  map.off('mouseenter', id, functionPopup[id].mouseenter);
  functionPopup[id].mouseenter = function (e) {
    updateCursorOnHovered(map)
  }
  map.on('mouseenter', id, functionPopup[id].mouseenter);

  map.off('mouseleave', id, functionPopup[id].mouseleave);
  functionPopup[id].mouseleave = function () {
    updateCursorOnLeave(map)
  }
  map.on('mouseleave', id, functionPopup[id].mouseleave);

  map.off('click', id, functionPopup[id].click);
  functionPopup[id].click = function (e) {
    if (!map.measurementMode) {

      // Check the id that is the most top
      let clickedId = null
      let clickedIdIdx = null

      // Return clicked features
      // Check the most top
      // show the popup
      const ids = map.getStyle().layers.filter(layer => !NON_ONCLICK_LAYER_IDS.includes(layer.id)).map(layer => layer.id)
      var pointFeatures = map.queryRenderedFeatures(e.point);
      pointFeatures.map(feature => {
        const idx = ids.indexOf(feature.layer.id)
        if (!(idx < clickedIdIdx)) {
          clickedId = feature.layer.id
          clickedIdIdx = idx
        }
      })

      if (id === clickedId) {
        const popupHtml = popupRenderFn(e.features[0].properties)
        if (popup) {
          popup.remove()
        }
        popup = new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(popupHtml)
          .addTo(map);
      }
    }
  }
  map.on('click', id, functionPopup[id].click);
}
/**
 * Popup for marker
 */
export const addPopupEl = (map, el, latlng, properties, popupRenderFn, offset = {}) => {
  el.addEventListener('mouseenter', function (e) {
    updateCursorOnHovered(map)
  });

  el.addEventListener('mouseleave', function () {
    updateCursorOnLeave(map)
  });

  el.addEventListener('click', function (e) {
    if (!map.measurementMode) {
      const popupHtml = popupRenderFn(properties)
      if (popup) {
        popup.remove()
      }
      popup = new maplibregl.Popup({ offset: offset })
        .setLngLat(latlng)
        .setHTML(popupHtml)
        .addTo(map);
    }
  });
}