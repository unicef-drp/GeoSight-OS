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
  const toUcode = (code) => {
    return code ? code : null
  }
  const extractCode = (properties, geoField = 'concept_uuid') => {
    const geomFieldOnVectorTile = geoField === 'geometry_code' ? 'ucode' : geoField
    return toUcode(properties[geoField] ? properties[geoField] : properties[geomFieldOnVectorTile])
  }

  async function fetchJSON(url, options, useCache = true) {
    try {
      const response = await fetch(url, options);
      let json = null;
      try {
        json = await response.json();
      } catch (error) {
        json = {
          message: response.status + ' ' + response.statusText,
          detail: response.status + ' ' + response.statusText
        }
      }
      if (response.status >= 400) {
        const err = new Error(json.message ? json.message : json.detail);
        err.data = json;
        throw err;
      }
      return json;
    } catch (error) {
      throw error;
    }
  }

  self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
    if (!e) return;
    let {
      domain,
      centroids,
      identifier
    } = e.data;
    const currGeometries = {};
    const geometryDataDict = {};
    const geometryMemberByUcode = {};

    (
      async () => {
        for (let i = 0; i < centroids.length; i++) {
          const level = centroids[i]
          let url = level.url
          if (!url.includes('http')) {
            url = domain + url;
          }
          try {
            const response = await fetchJSON(url);
            const geoms = {}

            const data = {}
            response.features.map(feature => {
              const name = feature.properties.n
              const ucode = feature.properties.u
              const concept_uuid = feature.properties.c
              const parentsUcode = feature.properties.pu
              const properties = {
                concept_uuid: feature.properties.c,
                name: name,
                ucode: ucode,
                geometry: feature.geometry
              }
              const code = extractCode(properties)
              if (!code) {
                return
              }
              properties.code = code
              geoms[code] = properties

              // Check parents
              let parents = []
              if (parentsUcode) {
                parents = parentsUcode.map(parent => geometryMemberByUcode[parent]).filter(parent => !!parent)
              }

              // Save for geometries
              const memberData = {
                name: name,
                ucode: ucode,
                code: code,
              }
              data[code] = {
                label: name,
                name: name,
                code: code,
                ucode: ucode,
                concept_uuid: concept_uuid,
                parents: parents,
                members: parents.concat(memberData),
                properties: properties,
                geometry: feature.geometry,
              }
              geometryMemberByUcode[ucode] = memberData
            })
            if (!currGeometries[level.level]) {
              currGeometries[level.level] = {}
            }
            currGeometries[level.level] = {
              ...currGeometries[level.level], ...geoms
            }

            // Update members of parents
            for (const [code, geom] of Object.entries(data)) {
              geom.parents.map((parent, geomLevel) => {
                if (geometryDataDict[geomLevel] && geometryDataDict[geomLevel][parent.code]) {
                  geometryDataDict[geomLevel][parent.code].members.push({
                    name: geom.name,
                    ucode: geom.ucode,
                    code: code,
                  })
                }
              })
            }
            geometryDataDict[level.level] = data;
            postMessage(
              {
                identifier: identifier,
                data: geometryDataDict
              }
            );
          } catch (e) {
            console.log(e)
          }
        }
        postMessage({ isDone: true });
      }
    )();
  })
}