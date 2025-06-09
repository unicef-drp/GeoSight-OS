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
 * __date__ = '28/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
export default () => {
  self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
    if (!e) return;
    let {
      referenceLayers,
      datasetGeometries
    } = e.data;
    const currGeometries = {}
    referenceLayers.map(referenceLayer => {
      const geoms = datasetGeometries[referenceLayer]
      if (geoms) {
        for (const [level, data] of Object.entries(geoms)) {
          if (!currGeometries[level]) {
            currGeometries[level] = {}
          }
          currGeometries[level] = { ...currGeometries[level], ...data }
        }
      }
    })

    postMessage(currGeometries);
  })
}