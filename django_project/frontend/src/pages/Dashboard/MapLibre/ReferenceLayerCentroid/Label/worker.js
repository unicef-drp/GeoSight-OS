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
 * __date__ = '05/01/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
export default () => {
  self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
    if (!e) return;
    let {
      geometriesData,
      mapGeometryValue,
      usedFilteredGeometries
    } = e.data;

    // Create features
    let features = []

    for (const [geom, geometry] of Object.entries(geometriesData)) {
      if (!geometry) {
        continue
      }
      const indicator = mapGeometryValue[geometry.ucode] ? mapGeometryValue[geometry.ucode][0] : mapGeometryValue[geometry.concept_uuid] ? mapGeometryValue[geometry.concept_uuid] : {};
      if (
        usedFilteredGeometries && !usedFilteredGeometries.includes(geometry.ucode) && !usedFilteredGeometries.includes(geometry.concept_uuid)
      ) {
        continue
      }
      let properties = geometry
      if (geometry) {
        if (indicator) {
          properties = Object.assign({}, indicator, geometry)
          delete properties.geometry
        }
        features.push({
          "type": "Feature",
          "properties": properties,
          "geometry": geometry.geometry
        })
      }
    }

    postMessage(features);
  })
}