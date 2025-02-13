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

function pollZonalAnalysis(analysisUUID: string, interval = 5000, maxRetries = 10) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    let result

    const checkStatus = async () => {
      console.log(`check status: ${analysisUUID}`)
      await DjangoRequests.get(
        `/api/context-layer/zonal-analysis/${analysisUUID}`,
      ).then(response => {
        const data = response.data
        if (data.status === "SUCCESS") {
          result = data.result;
          clearInterval(polling); // Stop polling
          resolve(result)
        } else if (attempts >= maxRetries) {
          result = 'Max retries reached. Stopping polling.';
          console.log(result);
          clearInterval(polling);
          resolve(result)
        } else if (data.status === "FAILED") {
          result = data.result;
          clearInterval(polling); // Stop polling
          resolve(result)
        }
        attempts++;
      }).catch(error => {
        throw Error(error.toString())
      })
    };

    const polling = setInterval(checkStatus, interval);
    checkStatus(); // Run immediately without waiting for the first interval
  });
}



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

  let value: string | null = null
  let data = new FormData();
  data.append("geometries", JSON.stringify(geometries));
  data.append("aggregation_field", analysisLayer.aggregatedField);
  let analysisUUID;

  await DjangoRequests.post(
    `/api/context-layer/${contextLayer.id}/zonal-analysis/${analysisLayer.aggregation.toLocaleLowerCase()}`,
    data
  ).then(async response => {
    const analysisUUID = response.data.uuid
     await pollZonalAnalysis(analysisUUID, 5000, 10).then((result: string) => {
      value = result
    });

  }).catch(error => {
    throw Error(error.toString())
  })
  console.log(`VALUE before return: ${value}`)
  return value
}