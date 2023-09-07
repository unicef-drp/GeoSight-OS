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

/* ==========================================================================
   Zoom To Geometries by Filters
   This is called and triggered when we do filters
   And "Zoom in automatically in filtered areas" is true
   ========================================================================== */

import React, { useEffect } from 'react';

import { useSelector } from "react-redux";
import { returnWhere } from "../../../../utils/queryExtraction";
import { fetchJson } from "../../../../utils/georepo";
import { Session } from "../../../../utils/Sessions";
import { GeometriesBBOX } from "../../../../utils/geometry";
import { dictDeepCopy } from "../../../../utils/main";

import './style.scss';

/**
 * Zoom To Geometries by Filters.
 */
export default function ZoomToFilteredGeometries({ map }) {
  const {
    referenceLayer,
    auto_zoom_to_filter
  } = useSelector(state => state.dashboard.data);
  const filteredGeometries = useSelector(state => state.filteredGeometries);
  const geometries = useSelector(state => state.geometries);
  const filtersData = useSelector(state => state.filtersData);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);

  useEffect(() => {
    (
      async () => {
        if (!map || !auto_zoom_to_filter) {
          return
        }
        const session = new Session('ZoomToGeometriesByFilters', 1000)

        const where = returnWhere(filtersData ? filtersData : [])
        const level = selectedAdminLevel?.level
        if (!filteredGeometries || !geometries[level] || !where) {
          return
        }
        const geoms = dictDeepCopy(geometries[level]);
        const usedGeometries = []
        for (let i = 0; i < filteredGeometries.length; i++) {
          const geom = filteredGeometries[i]
          const found = geoms[geom]
          if (found) {
            try {
              const response = await fetchJson(`/operation/view/${referenceLayer.identifier}/bbox/concept_uuid/${found.concept_uuid}/`)
              found.bbox = response
              usedGeometries.push(found)
            } catch (err) {

            }
          }
        }
        if (session.isValid) {
          const extent = GeometriesBBOX(usedGeometries)
          if (extent) {
            map.fitBounds([
                [extent[0], extent[1]],
                [extent[2], extent[3]]
              ],
              { padding: 20 }
            )
          }
        }
      }
    )()
  }, [filteredGeometries, filtersData]);

  return null
}