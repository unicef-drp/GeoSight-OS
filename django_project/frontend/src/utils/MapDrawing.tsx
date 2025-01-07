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

const orange = '#FF5733'
const customDrawStyles = [
  {
    'id': 'gl-draw-polygon-fill-inactive',
    'type': 'fill',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'fill-color': orange,
      'fill-outline-color': orange,
      'fill-opacity': 0.5
    }
  },
  {
    'id': 'gl-draw-polygon-fill-active',
    'type': 'fill',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': orange,
      'fill-outline-color': orange,
      'fill-opacity': 0.5
    }
  },
  {
    'id': 'gl-draw-polygon-midpoint',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 3,
      'circle-color': orange
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-inactive',
    'type': 'line',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': orange,
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-active',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': orange,
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-line-inactive',
    'type': 'line',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': orange,
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-line-active',
    'type': 'line',
    'filter': ['all',
      ['==', '$type', 'LineString'],
      ['==', 'active', 'true']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': orange,
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#fff'
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 3,
      'circle-color': orange
    }
  },
  {
    'id': 'gl-draw-point-point-stroke-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff'
    }
  },
  {
    'id': 'gl-draw-point-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 3,
      'circle-color': orange
    }
  },
  {
    'id': 'gl-draw-point-stroke-active',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['==', 'active', 'true'],
      ['!=', 'meta', 'midpoint']
    ],
    'paint': {
      'circle-radius': 7,
      'circle-color': '#fff'
    }
  },
  {
    'id': 'gl-draw-point-active',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['!=', 'meta', 'midpoint'],
      ['==', 'active', 'true']],
    'paint': {
      'circle-radius': 5,
      'circle-color': orange
    }
  },
  {
    'id': 'gl-draw-polygon-fill-static',
    'type': 'fill',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.5
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-line-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-point-static',
    'type': 'circle',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#404040'
    }
  }
];

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

    let features = data.features.filter(
      feature => {
        try {
          // @ts-ignore
          return feature.geometry.coordinates[0][0] != null
        } catch (err) {
          return true
        }
      }
    )
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
