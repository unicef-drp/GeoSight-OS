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
  length as turfLength,
  lineString,
  multiPolygon,
  point,
  polygon,
  truncate
} from "@turf/turf";
import polygonToLine from '@turf/polygon-to-line';
import { Variables } from "../Variables";
import { BufferDrawing } from "./Buffer";

export class MaplibreDrawingTools {
  public draw: MapboxDraw;
  public isDrawing: boolean;
  private map: maplibregl.Map;
  private mode: string;
  private setDrawState: () => void;
  private bufferDraw: BufferDrawing;


  constructor(
    map: maplibregl.Map, defaultMode: string, setDrawState: () => void,
    setBufferCalculating: (value: boolean) => void
  ) {
    this.map = map;
    this.mode = defaultMode;
    this.setDrawState = setDrawState;
    this.bufferDraw = new BufferDrawing(map, setBufferCalculating);
    this.draw = map._controls.find(c => c instanceof MapboxDraw);
    this.deleteFeatures()
    this.draw.changeMode(defaultMode);
    map.on('draw.create', this.onDrawCreate);
    map.on('draw.delete', this.setDrawState);
    map.on('draw.update', this.setDrawState);
    map.on('draw.selectionchange', this.onSelectionChange);
    this.start()

    // @ts-ignore
    map.drawingMode = true;
    this.bufferDraw.createLayer()
  }

  onDrawCreate = (e: any) => {
    const that = this;
    try {
      if (!this.isDrawing) {
        e.features.map((feature: { id: string }) =>
          that.draw.delete(feature.id),
        );
      }
      this.stopDrawing(true);
    } catch (err) {

    }
  };

  onSelectionChange = (e: any) => {
    if (!this.draw) {
      return;
    }
    this.setDrawState();
    this.stopDrawing();
  };

  redraw(features: any) {
    this.draw.deleteAll();
    features.forEach((feature: any) => {
      this.draw.add(feature);
    });
  }

  destroy() {
    this.map.off('draw.create', this.onDrawCreate);
    this.map.off('draw.selectionchange', this.onSelectionChange);
    this.map.off('draw.delete', this.setDrawState);
    this.map.off('draw.update', this.setDrawState);
    this.deleteFeatures()
    this.stopDrawing()
    this.bufferDraw.destroy()
    delete this.bufferDraw
  }

  /** Update feature **/
  updateBuffer(buffer: number = null, force = false) {
    this.bufferDraw.updateBuffer(this.draw.getAll().features, buffer, force)
  }

  getFeatures(buffer: number = null) {
    const that = this;
    // @ts-ignore
    if (!buffer) {
      return this.draw.getAll().features.filter(
        feature => {
          try {
            if (feature.geometry.type === Variables.FEATURE_TYPE.POINT) {
              // @ts-ignore
              return feature.geometry.coordinates.length && feature.geometry.coordinates[0] != null
            } else {
              // @ts-ignore
              return feature.geometry.coordinates.length && feature.geometry.coordinates[0][0] != null
            }
          } catch (err) {
            return true
          }
        }
      )
    } else {
      return this.bufferDraw.getFeatures()
    }
  }

  changeMode(mode: string) {
    this.stop()
    this.draw.deleteAll();
    this.bufferDraw.deleteAll();
    this.mode = mode
    this.start()
  }

  start() {
    this.draw.changeMode(this.draw.modes.SIMPLE_SELECT);
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

  toggleGeometry(geometry: any) {
    const ids = this.draw.getAll().features.map((feature: any) => feature.id)
    if (ids.includes(geometry.id)) {
      this.draw.delete(geometry.id)
    } else {
      this.draw.add(truncate(geometry, { precision: 5 }))
    }
    this.setDrawState()
  }

  stopDrawing(onCreate: boolean = false) {
    if (onCreate && this.mode === this.draw?.modes.DRAW_POINT) {
      // @ts-ignore
      this.map.drawingMode = true;
    } else {
      // @ts-ignore
      this.map.drawingMode = false;
    }
    // @ts-ignore
    this.isDrawing = false;
    this.updateCursor('grab');
    this.setDrawState()
  }

  deleteSelected() {
    const draw = this.draw
    this.draw.getSelectedIds().map(id => {
      draw.delete(id)
    })
    this.setDrawState();
  }

  deleteFeatures() {
    this.draw.deleteAll();
    this.bufferDraw.deleteAll()
    this.setDrawState();
  }

  selectedInformation = (buffer: number = null, justSelected: boolean = true) => {
    const features = this.getFeatures();
    let area = 0
    let lengthMeters = 0
    let lengthMiles = 0
    let lengthTerm = 'Perimeter'
    let featureType = 'Polygon'
    if (!features.length) {
      return null
    }
    features.map((feature: any) => {
      try {
        featureType = feature.geometry.type;

        let geom = null;
        let line = null;
        switch (feature.geometry.type) {
          case Variables.FEATURE_TYPE.MULTIPOLYGON:
            geom = multiPolygon(feature.geometry.coordinates);
            line = polygonToLine(geom);
            break;
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
        if (geom) {
          area += turfArea(geom)
          if (line) {
            lengthMeters += turfLength(line, { units: "meters" })
            lengthMiles += turfLength(line, { units: "miles" })
          }
        }
      } catch (err) {

      }
    })
    return {
      count: features.length,
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
