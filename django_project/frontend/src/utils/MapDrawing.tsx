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
import { area as turfArea, length as turfLength } from "@turf/turf";
import { lineString as turfLineString } from "@turf/helpers";

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
        that.updateCursor('grab');
        if (!that.isDrawing) {
          e.features.map((feature: {
            id: string;
          }) => that.draw.delete(feature.id))
        }
        that.isDrawing = false;
        that.setDrawState()
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
    // @ts-ignore
    this.map.drawingMode = true;
  }

  changeMode(mode: string) {
    this.stop()
    this.draw.deleteAll();
    this.mode = mode
    this.start()
  }

  start() {
    this.draw.changeMode(this.mode);
    this.updateCursor('crosshair');
    this.isDrawing = true;
    this.setDrawState()
  }

  stop() {
    this.isDrawing = false;
    this.draw.changeMode(this.draw.modes.SIMPLE_SELECT);
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

  selectedInformation = () => {
    var data = this.draw.getAll();
    let area = 0
    let lengthMeters = 0
    let lengthMiles = 0
    let lengthTerm = 'Perimeter'
    let featureType = 'Polygon'
    const selected = this.draw.getSelectedIds()
    data.features.filter((feature: any) => selected.includes(feature.id)).map((feature: any) => {
      let coordinates = null;
      if (feature.geometry.type === 'Polygon') {
        area += turfArea(feature)
        coordinates = feature.geometry.coordinates[0]
      } else if (feature.geometry.type === 'LineString') {
        coordinates = feature.geometry.coordinates
        lengthTerm = 'Distance'
        featureType = 'LineString'
      }
      lengthMeters += turfLength(
        turfLineString(coordinates),
        { units: "meters" }
      )
      lengthMiles += turfLength(
        turfLineString(coordinates),
        { units: "miles" }
      )
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
