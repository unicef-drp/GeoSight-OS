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
  buffer as turfBufffer,
  length as turfLength,
  lineString,
  multiPolygon,
  point,
  polygon
} from "@turf/turf";
import polygonToLine from '@turf/polygon-to-line';
import { Variables } from "./Variables";
import { hasLayer, hasSource } from "../pages/Dashboard/MapLibre/utils";

const drawingBufferId = 'DRAWING_BUFFER_ID'

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
    const customDrawStyles = [
      {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
              'fill-color': '#FF5733', // Custom fill color
              'fill-opacity': 0.5, // Custom fill opacity
          },
      },
      {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
              'line-color': '#FF5733', // Custom stroke color
              'line-width': 2,
          },
      },
      {
          id: 'gl-draw-line-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          paint: {
              'line-color': '#FF5733', // Custom line color
              'line-width': 2,
          },
      },
      {
          id: 'gl-draw-point-point',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
          paint: {
              'circle-radius': 5,
              'circle-color': '#FF5733',
          },
      }
  ];
    this.draw = new MapboxDraw(
      {
        displayControlsDefault: false,
        styles: customDrawStyles,
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
        that.stopDrawing(true)
      } catch (err) {

      }
    });
    map.on('draw.delete', () => {
      that.setDrawState()
    });
    map.on('draw.update', () => {
      that.setDrawState()

    });
    map.on('draw.selectionchange', (e) => {
      if (!that.draw) {
        return
      }
      that.setDrawState()
      that.stopDrawing()
    });
    map.addControl(this.draw as any, 'top-left')
    this.start()

    // @ts-ignore
    map.drawingMode = true;

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
    map.addLayer(
      {
        id: drawingBufferId,
        type: 'line',
        source: drawingBufferId,
        paint: {
          'line-color': '#374EA2',
          'line-width': 2,
          'line-dasharray': [1, 1],
        }
      }
    );
  }

  destroy() {
    this.map.off('draw.delete', this.setDrawState);
    this.map.off('draw.update', this.setDrawState);
    this.map.removeControl(this.draw as any)
    this.stopDrawing()
    if (hasLayer(this.map, drawingBufferId)) {
      this.map.removeLayer(drawingBufferId)
    }
    if (hasSource(this.map, drawingBufferId)) {
      this.map.removeSource(drawingBufferId)
    }
  }

  updateBuffer(buffer: number = null) {
    let features: any = []
    if (buffer) {
      features = this.getFeatures(buffer)
    }
    const source = this.map.getSource(drawingBufferId);
    if (source) {
      // @ts-ignore
      source.setData({
        type: 'FeatureCollection',
        features: features
      });
    }
  }

  getFeatures(buffer: number = null) {
    // @ts-ignore
    return this.draw.getAll().features.map((feature: any) => {
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
            geom = multiPolygon(feature.geometry.coordinates);
            break;
          case Variables.FEATURE_TYPE.POLYGON:
            geom = polygon(feature.geometry.coordinates);
            break;
          case Variables.FEATURE_TYPE.LINESTRING:
            geom = lineString(feature.geometry.coordinates);
            break;
          case Variables.FEATURE_TYPE.POINT:
            geom = point(feature.geometry.coordinates);
            break;
        }
        // If it has buffer in km
        if (geom && buffer) {
          geom = turfBufffer(geom, buffer, { units: 'kilometers' });
        }
      } catch (err) {

      }
      return geom
    }).filter(feature => feature);
  }

  changeMode(mode: string) {
    this.stop()
    this.draw.deleteAll();
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
      this.draw.add(geometry)
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
    this.setDrawState();
  }

  selectedInformation = (buffer: number = null, justSelected: boolean = true) => {
    var data = this.draw.getAll();
    let area = 0
    let lengthMeters = 0
    let lengthMiles = 0
    let lengthTerm = 'Perimeter'
    let featureType = 'Polygon'

    let features = data.features
    if (justSelected) {
      const selected = this.draw.getSelectedIds()
      features = data.features.filter(
        (feature: any) => selected.includes(feature.id)
      )
    }
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
        // If it has buffer in km
        if (buffer) {
          geom = turfBufffer(geom, buffer, { units: 'kilometers' });
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
      } catch (err) {

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
