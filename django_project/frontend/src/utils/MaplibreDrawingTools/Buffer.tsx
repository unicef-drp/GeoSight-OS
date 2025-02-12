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
 * __date__ = '11/02/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Map Drawing
   ========================================================================== */

import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { hasLayer, hasSource } from "../../pages/Dashboard/MapLibre/utils";
import { addLayerWithOrder } from "../../pages/Dashboard/MapLibre/Render";
import { Variables } from "../Variables";
import {
  buffer as turfBufffer,
  lineString,
  multiPolygon,
  point,
  polygon,
  simplify as turfSimplify
} from "@turf/turf";
import { dictDeepCopy } from "../main";

const drawingBufferId = 'DRAWING_BUFFER_ID'


export class BufferDrawing {
  public draw: MapboxDraw;
  private map: maplibregl.Map;
  private buffer: number;
  private setBufferCalculating: (value: boolean) => void;

  constructor(
    map: maplibregl.Map,
    setBufferCalculating: (value: boolean) => void
  ) {
    this.map = map;
    this.setBufferCalculating = setBufferCalculating;
  }

  createLayer() {
    const map = this.map

    // Create the shadow with buffer
    if (hasLayer(map, drawingBufferId)) {
      map.removeLayer(drawingBufferId)
    }
    if (hasSource(map, drawingBufferId)) {
      map.removeSource(drawingBufferId)
    }
    map.addSource(drawingBufferId, {
      'type': 'geojson',
      'data': {
        type: 'FeatureCollection',
        features: []
      }
    });

    addLayerWithOrder(
      map,
      {
        id: drawingBufferId,
        type: 'line',
        source: drawingBufferId,
        paint: {
          'line-color': '#374EA2',
          'line-width': 2,
          'line-dasharray': [1, 1],
        }
      },
      Variables.LAYER_CATEGORY.DRAW
    )
  }

  /** Update buffer */
  updateBuffer(features: any[], buffer: number = null, force = false) {
    this.setBufferCalculating(true)
    const that = this;
    features = features.filter((feature: any) => feature);
    const source = this.map.getSource(drawingBufferId);
    if (!source) {
      return
    }
    let usedFeatures: any = []
    if (buffer) {
      // If buffer changed, recalculate everything
      if (force || buffer !== this.buffer) {
        setTimeout(() => {
          usedFeatures = that.updateFeatures(features, buffer)
          this.buffer = buffer
          // @ts-ignore
          source.setData({
            type: 'FeatureCollection',
            features: usedFeatures
          });
          that.setBufferCalculating(false)
        }, 300);
      } else {
        const incomingIds = features.map((feature: any) => feature.id)
        incomingIds.sort()
        let currentFeatures = dictDeepCopy(this.getFeatures())
        const currentIds = currentFeatures.map((feature: any) => feature.id)
        currentIds.sort()
        if (JSON.stringify(incomingIds) === JSON.stringify(currentIds)) {
          return;
        }

        // Remove not in incoming
        currentFeatures = currentFeatures.filter(
          (feature: any) => incomingIds.includes(feature.id)
        )
        // @ts-ignore
        source.setData({
          type: 'FeatureCollection',
          features: currentFeatures
        });

        /** Adding using timeout **/
        setTimeout(() => {
          // Added
          features.map((feature: any) => {
            if (!currentIds.includes(feature.id)) {
              currentFeatures.push(this.updateFeature(feature, buffer))
            }
          })
          // @ts-ignore
          source.setData({
            type: 'FeatureCollection',
            features: currentFeatures
          });
          that.setBufferCalculating(false)
        }, 300);
      }
    } else {
      that.setBufferCalculating(false)
    }
  }

  /** Get feature for the buffer
   * @param feature
   * @param buffer */
  updateFeature(feature: any, buffer: number = null) {
    if (!feature.geometry.coordinates[0]) {
      return null
    }
    if (feature.geometry.type === "Polygon" && !feature.geometry.coordinates[0][0]) {
      return null
    }
    let geom = null;
    try {
      switch (feature.geometry.type) {
        case Variables.FEATURE_TYPE.MULTIPOLYGON:
          geom = multiPolygon(turfSimplify(feature.geometry, { tolerance: 0.5, highQuality: true }).coordinates);
          break;
        case Variables.FEATURE_TYPE.POLYGON:
          geom = polygon(turfSimplify(feature.geometry, { tolerance: 0.5, highQuality: true }).coordinates);
          break;
        case Variables.FEATURE_TYPE.LINESTRING:
          geom = lineString(turfSimplify(feature.geometry, { tolerance: 0.5, highQuality: true }).coordinates);
          break;
        case Variables.FEATURE_TYPE.POINT:
          geom = point(turfSimplify(feature.geometry, { tolerance: 0.5, highQuality: true }).coordinates);
          break;
      }
      // If it has buffer in km
      if (geom && buffer) {
        geom = turfBufffer(geom, buffer, { units: 'kilometers', steps: 8 });
      }
      geom.id = feature.id
      return geom
    } catch (err) {

    }
    return null
  }

  /** Get features from draw **/
  updateFeatures(features: any[], buffer: number = null) {
    const that = this;
    return features.map((feature: any) => {
      return that.updateFeature(feature, buffer)
    }).filter(feature => feature);
  }

  getFeatures() {
    const source = this.map.getSource(drawingBufferId);
    if (source) {
      // @ts-ignore
      const currentData = source._data;
      return currentData.features.filter((feature: any) => feature);
    }
    return []
  }

  deleteAll() {
    const source = this.map.getSource(drawingBufferId);
    if (source) {
      // @ts-ignore
      source.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }

  destroy() {
    if (hasLayer(this.map, drawingBufferId)) {
      this.map.removeLayer(drawingBufferId)
    }
    if (hasSource(this.map, drawingBufferId)) {
      this.map.removeSource(drawingBufferId)
    }
  }

}
