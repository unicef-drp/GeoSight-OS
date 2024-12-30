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
 * __date__ = '06/06/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

const CLOUD_NATIVE_GIS = 'Cloud Native GIS Layer';
const RASTER_COG = 'Raster COG';
const RASTER_TILE = 'Raster Tile';
const RELATED_TABLE = 'Related Table';
const VECTOR_TILE = 'Vector Tile';
const ARCGIS = 'ARCGIS';
const GEOJSON = 'Geojson';

export const Variables = {
  LAYER: {
    TYPE: {
      CLOUD_NATIVE_GIS: CLOUD_NATIVE_GIS,
      RASTER_TILE: RASTER_TILE,
      RASTER_COG: RASTER_COG,
      RELATED_TABLE: RELATED_TABLE,
      VECTOR_TILE: VECTOR_TILE,
      ARCGIS: ARCGIS,
      GEOJSON: GEOJSON,
    },
    LIST: {
      VECTOR_TILE_TYPES: [RELATED_TABLE, VECTOR_TILE, CLOUD_NATIVE_GIS],
      RASTER_TYPES: [RASTER_COG, RASTER_TILE],
      OVERRIDE_STYLES: [ARCGIS],
      LAYERS_NEED_PALETTE: [RASTER_COG],
    }
  },
  DASHBOARD: {
    TOOL: {
      VIEW_3D: "3D view",
      COMPARE_LAYERS: "Compare layers",
      MEASUREMENT: "Measurement",
      ZONAL_ANALYSIS: "Zonal analysis",
    }
  }
}