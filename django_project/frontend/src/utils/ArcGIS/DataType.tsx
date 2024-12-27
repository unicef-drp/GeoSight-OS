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

class ArcGISGeometry {
  protected features: Feature[];
  protected type: string;
  protected esriGeometryType: string;
  protected distance: number; // distance is in meters

  constructor(
    features: Feature[], distance: number,
    type: string, esriGeometryType: string
  ) {
    this.features = features.filter(
      feature => feature.geometry.type === type
    );
    this.distance = distance;
    this.type = type;
    this.esriGeometryType = esriGeometryType;
  }
}

export class ArcGISPolygon extends ArcGISGeometry {
  constructor(features: Feature[], distance: number) {
    super(features, distance, 'Polygon', 'esriGeometryPolygon');
  }
}

export class ArcGISLine extends ArcGISGeometry {
  constructor(features: Feature[], distance: number) {
    super(features, distance, 'LineString', 'esriGeometryPolyline');
  }
}

export class ArcGISPoint extends ArcGISGeometry {
  constructor(features: Feature[], distance: number) {
    super(features, distance, 'Point', 'esriGeometryMultipoint');
  }
}