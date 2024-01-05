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

  /*** Change code to ucode */
  const toUcode = (code) => {
    return code ? code : null
  }
  /*** Extracting ucode */
  const extractCode = (properties, geoField = 'concept_uuid') => {
    const geomFieldOnVectorTile = geoField === 'geometry_code' ? 'ucode' : geoField
    return toUcode(properties[geoField] ? properties[geoField] : properties[geomFieldOnVectorTile])
  }

  self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
    if (!e) return;
    let {
      geometriesData,
      usedIndicatorsData,
      usedFilteredGeometries
    } = e.data;

    // Create features
    let features = []
    let theGeometries = Object.keys(geometriesData)
    const indicatorsByGeom = {}
    for (const [indicatorId, indicatorData] of Object.entries(usedIndicatorsData)) {
      indicatorData.data.forEach(function (data) {
        const code = extractCode(data)
        if (!indicatorsByGeom[code]) {
          indicatorsByGeom[code] = []
        }
        indicatorsByGeom[code].push(data);
      })
    }
    theGeometries.map(geom => {
      const geometry = geometriesData[geom]
      const code = extractCode(geometry)
      const indicator = indicatorsByGeom[code] ? indicatorsByGeom[code][0] : null
      if (usedFilteredGeometries && !usedFilteredGeometries.includes(code)) {
        return
      }
      let properties = geometry
      if (geometry) {
        if (indicator) {
          properties = Object.assign({}, geometry, indicator)
          delete properties.geometry
        }
        features.push({
          "type": "Feature",
          "properties": properties,
          "geometry": geometry.geometry
        })
      }
    })

    postMessage(features);
  })
}