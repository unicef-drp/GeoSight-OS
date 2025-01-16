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
 * __date__ = '02/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { FetchingFunctionProp } from "./index.d";
import * as turf from '@turf/turf';
import { Variables } from "../../utils/Variables";

export const fetchGeoJsonValues = async (
  {
    map,
    contextLayer,
    features,
    setData
  }: FetchingFunctionProp) => {
  if (
    ![
      Variables.LAYER.TYPE.RELATED_TABLE,
      Variables.LAYER.TYPE.GEOJSON
    ].includes(contextLayer.layer_type)
  ) {
    setData(null, `Can't calculate for ${contextLayer.layer_type}`)
    return;
  }
  try {
    const source = map.getStyle().sources[`context-layer-${contextLayer.id}`]
    if (!source) {
      setData(
        null, 'The layer is currently not activated. Please ensure it is turned on before proceeding with the analysis.'
      )
      return;
    }
    // @ts-ignore
    const targetCollection = turf.featureCollection(source.data.features);
    const filterByCollection = turf.featureCollection(features);
    const filteredFeatures = targetCollection.features.filter(targetFeature => {
        return filterByCollection.features.some(filterFeature => {
          // @ts-ignore
          return turf.booleanIntersects(targetFeature, filterFeature)
        })
      }
    );
    // @ts-ignore
    setData(filteredFeatures.map(feature => feature.properties), null)
  } catch (error) {
    setData(null, error.toString())
  }
}