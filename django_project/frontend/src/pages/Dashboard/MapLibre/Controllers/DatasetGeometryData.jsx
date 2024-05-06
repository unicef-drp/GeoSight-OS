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
 * __date__ = '06/05/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Geometry Data Controller
   ========================================================================== */

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { datasetListFromDashboardData } from "../../../../utils/geometry";
import { dictDeepCopy } from "../../../../utils/main";
import { Actions } from "../../../../store/dashboard";
import {
  axiosGet,
  extractCode,
  GeorepoUrls,
  headers
} from "../../../../utils/georepo";
import { apiReceive } from "../../../../store/reducers_api";
import { fetchJSON } from "../../../../Requests";

/**
 * Handling geometry data.
 */
export default function DatasetGeometryData() {
  const dispatch = useDispatch();
  const { data } = useSelector(state => state.dashboard);
  const referenceLayerDataState = useSelector(state => state.referenceLayerData)
  const datasets = datasetListFromDashboardData(data)


  /** Run script when data of dashboard changed */
  useEffect(() => {
    (
      async () => {
        // Fetch reference layer data
        const referenceLayerData = dictDeepCopy(referenceLayerDataState)
        for (let i = 0; i < datasets.length; i++) {
          const identifier = datasets[i]
          if (!referenceLayerData[identifier]) {
            dispatch(
              Actions.ReferenceLayerData.request(identifier)
            )

            // Fetch the data
            const url = GeorepoUrls.ViewDetail(identifier)
            await axiosGet(url).then(response => {
              referenceLayerData[identifier] = apiReceive({
                data: response.data,
                error: null
              })
              dispatch(
                Actions.ReferenceLayerData.receive(response.data, null, identifier)
              )
            }).catch(async err => {
              headers.headers = preferences.georepo_api.public_headers
              preferences.georepo_api.headers = preferences.georepo_api.public_headers
              preferences.georepo_api.api_key = preferences.georepo_api.api_key_public.api_key
              preferences.georepo_api.api_key_email = preferences.georepo_api.api_key_public.email
              preferences.georepo_api.api_key_not_working = true
              $('#GeorepoApiKeyBtnUpdate').removeClass('Hidden')

              // We use public key
              await axiosGet(url).then(response => {
                  referenceLayerData[identifier] = apiReceive({
                    data: response.data,
                    error: null
                  })
                  dispatch(
                    Actions.ReferenceLayerData.receive(response.data, null, identifier)
                  )
                }
              ).catch(async err => {
                await axiosGet(url).then(response => {
                    referenceLayerData[identifier] = apiReceive({
                      data: null,
                      error: err
                    })
                    dispatch(
                      Actions.ReferenceLayerData.receive(null, err, identifier)
                    )
                  }
                )
              });
            });
          }
        }

        // Geometry data
        for (let i = 0; i < datasets.length; i++) {
          const identifier = datasets[i]
          const currGeometries = {}
          const geometryDataDict = {}
          const geometryMemberByUcode = {}
          const url = `${preferences.georepo_api.api}/search/view/${identifier}/centroid/`
          await axiosGet(url).then(async centroidResponse => {
            const centroids = centroidResponse.data
            for (let i = 0; i < centroids.length; i++) {
              const level = centroids[i]
              const response = await fetchJSON(level.url)
              const geoms = {}

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
                if (!geometryDataDict[level.level]) {
                  geometryDataDict[level.level] = {}
                }
                geometryDataDict[level.level][code] = {
                  label: name,
                  name: name,
                  code: code,
                  ucode: ucode,
                  concept_uuid: concept_uuid,
                  parents: parents,
                  members: parents.concat(memberData),
                }
                geometryMemberByUcode[ucode] = memberData
              })
              if (!currGeometries[level.level]) {
                currGeometries[level.level] = {}
              }
              currGeometries[level.level] = {
                ...currGeometries[level.level], ...geoms
              }
              dispatch(
                Actions.DatasetGeometries.addLevelData(
                  identifier, level.level, geometryDataDict[level.level]
                )
              )
            }
          })
        }
      }
    )()
  }, [JSON.stringify(datasets)]);

  return null
}