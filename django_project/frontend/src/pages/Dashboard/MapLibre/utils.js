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
import { FILL_LAYER_ID_KEY } from "./Layers/ReferenceLayer";

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
  map.getStyle().layers.filter(layer => layer.source === id).map(layer => {
    removeLayer(map, layer.id)
  })
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
  if (map.drawingMode) {
    map.getCanvas().style.cursor = 'crosshair';
  } else {
    map.getCanvas().style.cursor = 'pointer';
  }
}

/**
 * Update cursor on hovered
 */
const updateCursorOnLeave = (map) => {
  if (map.drawingMode) {
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
    if (!map.drawingMode) {

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
        let popupHtml = popupRenderFn(e.features[0].properties)
        if (!popupHtml) {
          popupHtml = ''
        }
        if (popup) {
          popup.remove()
        }
        popup = new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(popupHtml)
          .addTo(map);
        popup.addClassName('ContextPopup')
      }
    }
  }
  map.on('click', id, functionPopup[id].click);
}
/**
 * Add popup by properties
 * @param map
 * @param lngLat
 * @param popupRenderFn
 * @param properties
 * @param session
 */
export const addStandalonePopup = (map, lngLat, popupRenderFn, properties, session) => {
  let popupHtml = popupRenderFn(properties)
  if (!popupHtml) {
    popupHtml = ''
  }
  if (popup) {
    popup.remove()
  }
  popup = new maplibregl.Popup()
    .setLngLat(lngLat)
    .setHTML(popupHtml)
    .addTo(map);
  popup.addClassName(`${session}`)
}
/**
 * Remove click event
 */
export const removeClickEvent = (map, layerId, functionId) => {
  if (functionPopup[functionId]?.click) {
    if (layerId) {
      map.off('click', layerId, functionPopup[functionId].click);
    } else {
      map.off('click', functionPopup[functionId].click);
    }
  }
}
/**
 * Add click event
 */
export const addClickEvent = (map, layerId, functionId, listenerFn) => {
  removeClickEvent(map, layerId, functionId)
  if (!functionPopup[functionId]) {
    functionPopup[functionId] = {}
  }
  functionPopup[functionId].click = listenerFn
  if (layerId) {
    map.on('click', layerId, functionPopup[functionId].click);
  } else {
    map.on('click', functionPopup[functionId].click);
  }

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
    if (!map.drawingMode) {
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
/*** Create element ***/
export const createElement = (
  tag,
  options
) => {
  const { classes, styles, attributes, events, content, appendTo } = options;
  const el = document.createElement(tag);
  if (classes) classes.forEach(cls => el.classList.add(cls));
  if (styles) Object.entries(styles).forEach(prop => el.style.setProperty(...prop));
  if (attributes) Object.entries(attributes).forEach(([name, value]) => {
    if (value || value === 0) el.setAttribute(name, `${value}`);
    else el.removeAttribute(name);
  });
  if (events) Object.entries(events).forEach(([e, listener]) => el.addEventListener(e, listener));
  if (content) el.append(...(content.filter(Boolean)));
  if (appendTo) appendTo.appendChild(el);
  return el;
};

/**
 * Get before layer
 * @param map
 * @param layerId
 * @param contextLayerOrder
 * @returns {undefined|string}
 */
export const getBeforeLayerId = (map, layerId, contextLayerOrder) => {
  if (contextLayerOrder) {
    const contextLayerIdx = contextLayerOrder.indexOf(layerId)
    for (let idx = 0; idx < contextLayerOrder.length; idx++) {
      if (map && idx > contextLayerIdx) {
        const currentId = 'context-layer-' + contextLayerOrder[idx] + '-line'
        if (hasLayer(map, currentId)) {
          return currentId;
        }
      }
    }
  } else {
    return undefined;
  }
};

/**
 * Get layer id of reference layer
 * @param map
 * @returns {undefined|string}
 */
export const getLayerIdOfReferenceLayer = (map) => {
  const first = map.getStyle().layers.filter(layer => layer.id.includes(FILL_LAYER_ID_KEY))[0]
  return first?.id
};

export const hexToRgba = (hex, alpha = 1, format = 'array') => {
  // Remove the hash if present
  const hexClean = hex.replace("#", "");

  // Parse the R, G, and B values
  const r = parseInt(hexClean.substring(0, 2), 16);
  const g = parseInt(hexClean.substring(2, 4), 16);
  const b = parseInt(hexClean.substring(4, 6), 16);
  alpha = hexClean.length == 8 ? parseInt(hexClean.substring(6, 8), 16) : alpha

  // Return in RGBA format
  if (format == 'array') {
    return [r, g, b, alpha]
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// /**
//  * Convert RGBA to hex
//  * @param rgba object
//  * @returns hex color with alpha
//  */
// export const rgbaToHex = (rgba) => {
//   const toHex = (value) => {
//     const hex = Math.round(value).toString(16);
//     return hex.padStart(2, "0");
//   };

  // const alpha = Math.round(rgba.a * 255); // Convert alpha to a value between 0-255

//   // Combine RGBA components into a single HEX string
//   return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}${toHex(alpha)}`;
// }