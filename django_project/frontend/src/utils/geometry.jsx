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
 * __date__ = '07/09/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/** Return bbox of geometries */
export function GeometriesBBOX(geometries) {
  let output = null
  geometries.map(geom => {
    console.log(geom.bbox)
    if (!output) {
      output = geom.bbox
    } else {
      if (geom.bbox[0] < output[0]) {
        output[0] = geom.bbox[0]
      }
      if (geom.bbox[1] < output[1]) {
        output[1] = geom.bbox[1]
      }
      if (geom.bbox[2] > output[2]) {
        output[2] = geom.bbox[2]
      }
      if (geom.bbox[3] > output[3]) {
        output[3] = geom.bbox[3]
      }
    }
  })
  return output
}