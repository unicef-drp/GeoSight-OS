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
   MAP CONFIG CONTAINER
   ========================================================================== */

import React, { useEffect, useState, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { removeLayer, removeSource } from "../../../Dashboard/MapLibre/utils";
import {
  contextLayerRendering
} from "../../../Dashboard/MapLibre/Layers/ContextLayers/index";
import 'mapboxgl-legend/dist/style.css';
import 'maplibre-gl/dist/maplibre-gl.css';

// Initialize cog
import { cogProtocol } from "@geomatico/maplibre-cog-protocol";
import { Variables } from "../../../../utils/Variables";
import {updateColorPaletteData} from "../../../../utils/Style";

maplibregl.addProtocol('cog', cogProtocol);

/**
 * Map Config component.
 */
export default function MapConfig({ data, setData, layerInput }) {
  const [map, setMap] = useState(null);
  const [isInit, setIsInit] = useState(true);
  const requestSent = useRef(false);

  /***
   * Render layer to maplibre
   * @param {String} id of layer
   * @param {Object} source Layer config options.
   * @param {Object} layer Layer config options.
   * @param {String} before Is the layer after it.
   */
  const renderLayer = (map, id, source, layer, before = null) => {
    removeLayer(map, id)
    removeSource(map, id)
    map.addSource(id, source);
    return map.addLayer(
      {
        ...layer,
        id: id,
        source: id,
      },
      before && map.getLayer(before) ? before : undefined
    );
  }

  useEffect(() => {
    if (!map) {
      const newMap = new maplibregl.Map({
        container: 'StyleMapConfig',
        style: {
          version: 8, sources: {}, layers: [],
          glyphs: "/static/fonts/{fontstack}/{range}.pbf"
        },
        center: [0, 0],
        zoom: 1,
        attributionControl: false
      });

      newMap.once("load", () => {
        renderLayer(
          newMap, 'basemap', {
            attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
            maxNativeZoom: 19,
            maxZoom: 24,
            noWrap: "true",
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png?noWrap=true'],
            type: "raster"
          },
          { type: "raster" }
        )
        setMap(newMap);
      })
    }
  }, [map]);

  // When layer input changed, remove from map
  useEffect(() => {
    if (map) {
      const id = data.id ? `context-layer-${data.id}` : 'context-layer'
      if (Variables.LAYER.LIST.LAYERS_NEED_PALETTE.includes(data.layer_type)) {
        removeLayer(map, id);
        // Await color palette
        (
          async () => {
            await updateColorPaletteData()
            contextLayerRendering(id, data, layerInput, map, null, setData, isInit, setIsInit, requestSent)
          }
        )()
      } else {
        contextLayerRendering(id, data, layerInput, map, null, setData, isInit, setIsInit, requestSent)
      }
    }
  }, [map, layerInput]);

  return <div id="StyleMapConfig"></div>
}