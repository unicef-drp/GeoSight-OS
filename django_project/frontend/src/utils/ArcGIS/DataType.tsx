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
 * __date__ = '27/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   ARCGIS Data Type Request
   ========================================================================== */

import { Feature } from "geojson";

export interface Payload {
  returnGeometry: boolean;
  outFields: string[];
  f?: 'json' | 'geojson';
  where?: string;
}

export class ArcGISGeometry {
  protected features: Feature[];
  protected type: string;
  protected esriGeometryType: string;
  protected esriGeometryKey: string;
  protected distance: number; // distance is in meters

  constructor(
    features: Feature[], distance: number,
    type: string, esriGeometryType: string, esriGeometryKey: string
  ) {
    this.features = features.filter(
      feature => feature.geometry.type === type
    );
    this.distance = distance;
    this.type = type;
    this.esriGeometryType = esriGeometryType;
    this.esriGeometryKey = esriGeometryKey;
  }

  geometry() {
    const output = {
      spatialReference: { "wkid": 4326 }
    }
    if (this.type === 'Polygon') {
      return {
        // @ts-ignore
        rings: this.features.map(feature => feature.geometry.coordinates[0]),
        spatialReference: { "wkid": 4326 }
      }
    }
    // @ts-ignore
    output[this.esriGeometryKey] = this.features.map(feature => feature.geometry.coordinates)
    return output
  }

  payload() {
    return {
      geometry: JSON.stringify(this.geometry()),
      geometryType: this.esriGeometryType,
      spatialRel: 'esriSpatialRelIntersects',
      distance: this.distance
    }
  }
}

export class ArcGISPolygon extends ArcGISGeometry {
  constructor(features: Feature[], distance: number) {
    super(features, distance, 'Polygon', 'esriGeometryPolygon', 'rings');
  }
}

export class ArcGISLine extends ArcGISGeometry {
  constructor(features: Feature[], distance: number) {
    super(features, distance, 'LineString', 'esriGeometryPolyline', 'paths');
  }
}

export class ArcGISPoint extends ArcGISGeometry {
  constructor(features: Feature[], distance: number) {
    super(features, distance, 'Point', 'esriGeometryMultipoint', 'points');
  }
}