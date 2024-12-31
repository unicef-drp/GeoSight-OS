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
 * __date__ = '26/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Map Drawing
   ========================================================================== */

import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import $ from "jquery";
import {
  area as turfArea,
  buffer,
  length as turfLength,
  lineString,
  point,
  polygon
} from "@turf/turf";
import polygonToLine from '@turf/polygon-to-line';
import { Variables } from "./Variables";

export class MapDrawing {
  public draw: MapboxDraw;
  public isDrawing: boolean;
  private map: maplibregl.Map;
  private mode: string;
  private setDrawState: () => void;

  constructor(
    map: maplibregl.Map, defaultMode: string, setDrawState: () => void
  ) {
    this.map = map;
    this.mode = defaultMode;
    this.setDrawState = setDrawState;
    this.draw = new MapboxDraw(
      {
        displayControlsDefault: false,
        controls: {
          polygon: true,
          line_string: true,
          trash: true
        },
        defaultMode: defaultMode
      }
    )
    const that = this;
    map.on('draw.create', (e) => {
      try {
        if (!that.isDrawing) {
          e.features.map((feature: {
            id: string;
          }) => that.draw.delete(feature.id))
        }
        that.stopDrawing()
      } catch (err) {

      }
    });
    map.on('draw.delete', setDrawState);
    map.on('draw.update', setDrawState);
    map.on('draw.selectionchange', (e) => {
      if (!that.draw) {
        return
      }
      that.setDrawState()
    });
    map.addControl(this.draw as any, 'top-left')
    this.start()

    // @ts-ignore
    map.drawingMode = true;
  }

  destroy() {
    this.map.off('draw.delete', this.setDrawState);
    this.map.off('draw.update', this.setDrawState);
    this.map.removeControl(this.draw as any)
    this.stopDrawing()
  }

  getFeatures() {
    // @ts-ignore
    return this.draw.getAll().features.filter(feature => {
      if (feature.geometry.type === "Polygon" && !feature.geometry.coordinates[0][0]) {
        return false
      }
      // @ts-ignore
      return feature.geometry.coordinates[0]
    });
  }

  changeMode(mode: string) {
    this.stop()
    this.draw.deleteAll();
    this.mode = mode
    this.start()
  }

  start() {
    this.draw.changeMode(this.mode);
    this.startDrawing()
  }

  stop() {
    this.draw.changeMode(this.draw.modes.SIMPLE_SELECT);
    this.stopDrawing()
  }

  startDrawing() {
    // @ts-ignore
    this.map.drawingMode = true;
    this.isDrawing = true;
    this.updateCursor('crosshair');
    this.setDrawState()
  }

  stopDrawing() {
    // @ts-ignore
    this.map.drawingMode = false;
    this.isDrawing = false;
    this.updateCursor('grab');
    this.setDrawState()
  }

  deleteSelected() {
    const draw = this.draw
    this.draw.getSelectedIds().map(id => {
      draw.delete(id)
    })
    this.setDrawState()
  }

  deleteFeatures() {
    this.draw.deleteAll();
    this.setDrawState();
  }

  selectedInformation = (bufferKm: number = 0) => {
    var data = this.draw.getAll();
    let area = 0
    let lengthMeters = 0
    let lengthMiles = 0
    let lengthTerm = 'Perimeter'
    let featureType = 'Polygon'

    const selected = this.draw.getSelectedIds()
    data.features.filter(
      (feature: any) => selected.includes(feature.id)
    ).map((feature: any) => {
      featureType = feature.geometry.type;

      let geom = null;
      let line = null;
      switch (feature.geometry.type) {
        case Variables.FEATURE_TYPE.POLYGON:
          geom = polygon(feature.geometry.coordinates);
          line = polygonToLine(geom);
          break;
        case Variables.FEATURE_TYPE.LINESTRING:
          geom = lineString(feature.geometry.coordinates);
          line = geom
          lengthTerm = 'Distance'
          break;
        case Variables.FEATURE_TYPE.POINT:
          geom = point(feature.geometry.coordinates);
          break;
      }
      // If it has buffer in km
      if (bufferKm) {
        geom = buffer(geom, bufferKm, { units: 'kilometers' });
        line = polygonToLine(geom);
        lengthTerm = 'Perimeter';
      }

      if (geom) {
        area += turfArea(geom)
        if (line) {
          lengthMeters += turfLength(line, { units: "meters" })
          lengthMiles += turfLength(line, { units: "miles" })
        }
      }
    })
    return {
      area: area,
      lengthMeters: lengthMeters,
      lengthMiles: lengthMiles,
      featureType: featureType,
      lengthTerm: lengthTerm
    }
  }

  updateCursor = (value: string) => {
    if (value === 'grab') {
      $('.maplibregl-canvas').removeClass('crosshairCursor');
      $('.maplibregl-canvas').addClass('grabCursor');
    } else if (value === 'crosshair') {
      $('.maplibregl-canvas').removeClass('grabCursor');
      $('.maplibregl-canvas').addClass('crosshairCursor');
    }
  }
}
