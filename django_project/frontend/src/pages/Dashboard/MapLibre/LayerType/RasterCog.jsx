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
 * __date__ = '31/10/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */


import {
  getBeforeLayerId,
  getLayerIdOfReferenceLayer,
  removeLayer,
  removeSource
} from "../utils";

/***
 * Render Raster Cog
 */
export default function rasterCogLayer(map, id, data, contextLayerData, popupFeatureFn, contextLayerOrder) {
  (
    async () => {
      console.log(data)
      // Create source
      removeSource(map, id)
      const sourceParams = Object.assign({}, data.params, {
        url: `cog://${data.url}#color:["#ffeda0","#feb24c","#f03b20"],0,100,c`,
        type: 'raster',
        tileSize: 256
      })
      map.addSource(id, sourceParams);

      // We find the before layers
      let before = getLayerIdOfReferenceLayer(map)
      if (contextLayerOrder) {
        const beforeOrder = getBeforeLayerId(map, id, contextLayerOrder)
        if (beforeOrder) {
          before = beforeOrder
        }
      }

      removeLayer(map, id)
      map.addLayer(
        {
          id: id,
          source: id,
          type: 'raster'
        },
        before
      );
      console.log(map.getStyle())
    }
  )()

}