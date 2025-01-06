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
 * __date__ = '31/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { FetchingZonalAnalysisResultProps } from "./index.d";
import { Variables } from "../../utils/Variables";
import { DjangoRequests } from "../../Requests";

export const fetchFromAPIValues = async (
  {
    contextLayer,
    analysisLayer,
    features
  }: FetchingZonalAnalysisResultProps) => {
  if (
    ![
      Variables.LAYER.TYPE.RASTER_COG,
      Variables.LAYER.TYPE.RASTER_TILE,
      Variables.LAYER.TYPE.CLOUD_NATIVE_GIS
    ].includes(contextLayer.layer_type)
  ) {
    throw Error(`Can't calculate for ${contextLayer.layer_type}`)
  }
  let geometries = [];
  for (let i = 0; i < features.length; i++) {
    const feature = features[i]
    // @ts-ignore
    geometries.push(feature.geometry)
  }

  let value: number | null = null
  let data = new FormData();
  data.append("geometries", JSON.stringify(geometries));
  data.append("aggregation_field", analysisLayer.aggregatedField);
  await DjangoRequests.post(
    `/api/context-layer/${contextLayer.id}/zonal-analysis/${analysisLayer.aggregation.toLocaleLowerCase()}`,
    data
  ).then(response => {
    value = parseFloat(response.data)
  }).catch(error => {
    throw Error(error.toString())
  })
  return value
}