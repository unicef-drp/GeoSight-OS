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

import maplibregl from "maplibre-gl";
import { FILL_LAYER_ID_KEY } from "./Layers/ReferenceLayer";

const MOBILE_BREAKPOINT = 1000;
const centerMapOnMobile = (map, lngLat) => {
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    map.easeTo({ center: lngLat, offset: [0, 100] });
  }
};

/**
 * Return if layer exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const hasLayer = (map, id) => {
  if (!map) {
    return false;
  }
  return typeof map.getLayer(id) !== "undefined";
};

/**
 * Return if layer exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const removeLayer = (map, id) => {
  if (hasLayer(map, id)) {
    map.removeLayer(id);
  }
};

/**
 * Return if source exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const hasSource = (map, id) => {
  return typeof map.getSource(id) !== "undefined";
};
/**
 * Return if source exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const removeSource = (map, id) => {
  map
    .getStyle()
    .layers.filter((layer) => layer.source === id)
    .map((layer) => {
      removeLayer(map, layer.id);
    });
  if (typeof map.getSource(id) !== "undefined") {
    map.removeSource(id);
  }
};

/**
 * Load image to map
 */
export const loadImageToMap = async (map, id, callback) => {
  if (map.listImages().includes(id)) {
    map.removeImage(id);
  }
  const url = id;
  let image = null;
  let error = null;
  try {
    image = await map.loadImage(url);
    map.addImage(url, image.data);
  } catch (err) {
    error = err;
  }
  if (callback) {
    callback(error, image);
  }
  return image;
};

/**
 * Update cursor on hovered
 */
const updateCursorOnHovered = (map) => {
  if (map.drawingMode) {
    map.getCanvas().style.cursor = "crosshair";
  } else {
    map.getCanvas().style.cursor = "pointer";
  }
};

/**
 * Update cursor on hovered
 */
const updateCursorOnLeave = (map) => {
  if (map.drawingMode) {
    map.getCanvas().style.cursor = "crosshair";
  } else {
    map.getCanvas().style.cursor = "";
  }
};
/** Return the selectable layer that can be selected or clicked
 * @param {maplibregl.Map} map Map
 * **/
export const selectableLayers = (map) => {
  return map.getStyle().layers.filter((layer) => !layer.id.includes("-label"));
};
/***
 * Add popup when click
 */
let popup = null;
let functionPopup = {};
export const addPopup = (map, id, popupRenderFn) => {
  if (!functionPopup[id]) {
    functionPopup[id] = {};
  }
  map.off("mouseenter", id, functionPopup[id].mouseenter);
  functionPopup[id].mouseenter = function (e) {
    updateCursorOnHovered(map);
  };
  map.on("mouseenter", id, functionPopup[id].mouseenter);

  map.off("mouseleave", id, functionPopup[id].mouseleave);
  functionPopup[id].mouseleave = function () {
    updateCursorOnLeave(map);
  };
  map.on("mouseleave", id, functionPopup[id].mouseleave);

  map.off("click", id, functionPopup[id].click);
  map.off("touchend", id, functionPopup[id].click);
  functionPopup[id].click = function (e) {
    if (!map.drawingMode) {
      // Check the id that is the most top
      let clickedId = null;
      let clickedIdIdx = null;

      // Return clicked features
      // Check the most top
      // show the popup
      const layers = selectableLayers(map).reverse();
      const ids = selectableLayers(map).map((layer) => layer.id);
      var pointFeatures = map.queryRenderedFeatures(e.point);
      pointFeatures.map((feature) => {
        const idx = ids.indexOf(feature.layer.id);
        if (!(idx < clickedIdIdx)) {
          clickedId = feature.layer.id;
          clickedIdIdx = idx;
        }
      });
      const lastRasterLayerIdxInLayers = layers.findIndex(
        (obj) => obj.type === "raster",
      );
      const lastRasterLayerInLayers = layers.find(
        (obj) => obj.type === "raster",
      );
      const clickedIdxInLayers = layers.findIndex(
        (obj) => obj.id === clickedId,
      );
      if (lastRasterLayerIdxInLayers < clickedIdxInLayers) {
        // This is for
        if (functionPopup[lastRasterLayerInLayers.id]?.click) {
          clickedId = lastRasterLayerInLayers.id;
        }
      }

      if (id === clickedId) {
        let popupHtml = popupRenderFn(e.features[0].properties);
        if (!popupHtml) {
          popupHtml = "";
        }
        if (popup) {
          popup.remove();
        }
        popup = new maplibregl.Popup({
          anchor: "bottom",
          offset: [0, 0],
        })
          .setLngLat(e.lngLat)
          .setHTML(popupHtml)
          .addTo(map);
        popup.addClassName("ContextPopup");
        centerMapOnMobile(map, e.lngLat);
      }
    }
  };
  map.on("click", id, functionPopup[id].click);
  map.on("touchend", id, functionPopup[id].click);
};
/**
 * Add popup by properties
 * @param map
 * @param lngLat
 * @param popupRenderFn
 * @param properties
 * @param session
 */
export const addStandalonePopup = (
  map,
  lngLat,
  popupRenderFn,
  properties,
  session,
) => {
  let popupHtml = popupRenderFn(properties);
  if (!popupHtml) {
    popupHtml = "";
  }
  if (popup) {
    popup.remove();
  }
  popup = new maplibregl.Popup({
    anchor: "bottom",
    offset: [0, 0],
  })
    .setLngLat(lngLat)
    .setHTML(popupHtml)
    .addTo(map);
  if (session) {
    popup.addClassName(`${session}`);
  }
  popup.addClassName(`ContextPopup`);
  centerMapOnMobile(map, lngLat);
};
/**
 * Remove click event
 */
export const removeClickEvent = (map, layerId, functionId) => {
  if (functionPopup[functionId]?.click) {
    if (layerId) {
      map.off("click", layerId, functionPopup[functionId].click);
      map.off("touchend", layerId, functionPopup[functionId].click);
    } else {
      map.off("click", functionPopup[functionId].click);
      map.off("touchend", functionPopup[functionId].click);
    }
  }
};
/**
 * Add click event
 */
export const addClickEvent = (map, layerId, functionId, listenerFn) => {
  removeClickEvent(map, layerId, functionId);
  if (!functionPopup[functionId]) {
    functionPopup[functionId] = {};
  }
  functionPopup[functionId].click = listenerFn;
  if (layerId) {
    map.on("click", layerId, functionPopup[functionId].click);
    map.on("touchend", layerId, functionPopup[functionId].click);
  } else {
    map.on("click", functionPopup[functionId].click);
    map.on("touchend", functionPopup[functionId].click);
  }
};
/**
 * Popup for marker
 */
export const addPopupEl = (
  map,
  el,
  latlng,
  properties,
  popupRenderFn,
  offset = {},
) => {
  el.addEventListener("mouseenter", function (e) {
    updateCursorOnHovered(map);
  });

  el.addEventListener("mouseleave", function () {
    updateCursorOnLeave(map);
  });
  const clickFn = function (e) {
    if (!map.drawingMode) {
      const popupHtml = popupRenderFn(properties);
      if (popup) {
        popup.remove();
      }

      let conf = offset;
      if (!offset) {
        conf = {
          anchor: "bottom",
          offset: [0, 0],
        };
      }
      popup = new maplibregl.Popup(conf)
        .setLngLat(latlng)
        .setHTML(popupHtml)
        .addTo(map);
      centerMapOnMobile(map, latlng);
    }
  };
  el.addEventListener("click", clickFn);
  el.addEventListener("touchend", clickFn);
};
/*** Create element ***/
export const createElement = (tag, options) => {
  const { classes, styles, attributes, events, content, appendTo } = options;
  const el = document.createElement(tag);
  if (classes) classes.forEach((cls) => el.classList.add(cls));
  if (styles)
    Object.entries(styles).forEach((prop) => el.style.setProperty(...prop));
  if (attributes)
    Object.entries(attributes).forEach(([name, value]) => {
      if (value || value === 0) el.setAttribute(name, `${value}`);
      else el.removeAttribute(name);
    });
  if (events)
    Object.entries(events).forEach(([e, listener]) =>
      el.addEventListener(e, listener),
    );
  if (content) el.append(...content.filter(Boolean));
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
    let existingLayers = [];
    const contextLayerIdx = contextLayerOrder.indexOf(layerId);
    for (let idx = 0; idx < contextLayerOrder.length; idx++) {
      if (map && idx > contextLayerIdx) {
        const contextLayerId = contextLayerOrder[idx];
        const layers = map
          .getStyle()
          .layers.filter((layer) => layer.id.includes(contextLayerId));
        if (layers.length > 0) {
          const currentId = layers[0].id;
          existingLayers.push(currentId);
        }
      }
    }
    return existingLayers.length > 0 ? existingLayers[0] : undefined;
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
  const first = map
    .getStyle()
    .layers.filter((layer) => layer.id.includes(FILL_LAYER_ID_KEY))[0];
  return first?.id;
};

export const hexToRgba = (hex, alpha = 1, format = "array") => {
  if (!hex) {
    return;
  }
  // Remove the hash if present
  const hexClean = hex.replace("#", "");

  // Parse the R, G, and B values
  const r = parseInt(hexClean.substring(0, 2), 16);
  const g = parseInt(hexClean.substring(2, 4), 16);
  const b = parseInt(hexClean.substring(4, 6), 16);
  alpha =
    hexClean.length == 8 ? parseInt(hexClean.substring(6, 8), 16) / 255 : alpha;

  // Return in RGBA format
  if (format == "array") {
    return [r, g, b, alpha];
  } else if (format == "object") {
    return {
      r: r,
      g: g,
      b: b,
      a: alpha,
    };
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
/**
 * Change transparency
 * @param map
 * @param layerId
 * @param transparentValue
 */
export const changeTransparency = (map, layerId, transparentValue) => {
  const layer = map.getLayer(layerId);
  if (!layer) {
    console.warn(`Layer "${layerId}" not found.`);
    return;
  }

  switch (layer.type) {
    case "fill":
      map.setPaintProperty(layer.id, "fill-opacity", transparentValue);
      break;
    case "line":
      map.setPaintProperty(layer.id, "line-opacity", transparentValue);
      break;
    case "circle":
      map.setPaintProperty(layer.id, "circle-opacity", transparentValue);
      map.setPaintProperty(layer.id, "circle-stroke-opacity", transparentValue);
      break;
    case "symbol":
      map.setPaintProperty(layer.id, "icon-opacity", transparentValue);
      map.setPaintProperty(layer.id, "text-opacity", transparentValue);
      break;
    case "raster":
      map.setPaintProperty(layer.id, "raster-opacity", transparentValue);
      break;
    case "fill-extrusion":
      map.setPaintProperty(
        layer.id,
        "fill-extrusion-opacity",
        transparentValue,
      );
      break;
    case "heatmap":
      map.setPaintProperty(layer.id, "heatmap-opacity", transparentValue);
      break;
    default:
      console.warn(`Layer type "${layer.type}" is not handled.`);
  }
};
