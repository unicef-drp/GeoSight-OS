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

export const Variables = {
  TERMS: {
    CLOUD_NATIVE_GIS: CLOUD_NATIVE_GIS
  },
  LIST: {
    VECTOR_TILE_TYPES: ['Related Table', 'Vector Tile', CLOUD_NATIVE_GIS],
    OVERRIDE_STYLES: ['ARCGIS', CLOUD_NATIVE_GIS]
  }
}