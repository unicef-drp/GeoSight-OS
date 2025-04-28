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
import $ from "jquery";
import { datasetListFromDashboardData } from "../../../../utils/geometry";
import { dictDeepCopy } from "../../../../utils/main";
import { Actions } from "../../../../store/dashboard";
import { axiosGet, headers } from "../../../../utils/georepo";
import { apiReceive } from "../../../../store/reducers_api";
import { DjangoRequests } from "../../../../Requests";
import { InternalReferenceDatasets } from "../../../../utils/urls";
import { RefererenceLayerUrls } from "../../../../utils/referenceLayer";
import { ExecuteWebWorker } from "../../../../utils/WebWorker";
import worker from "./worker";

/**
 * Handling geometry data.
 */
export default function DatasetGeometryData() {
  const dispatch = useDispatch();
  const { data } = useSelector(state => state.dashboard);
  const referenceLayerDataState = useSelector(state => state.referenceLayerData)
  const datasets = datasetListFromDashboardData(data)
  const identifiers = datasets.map(dataset => dataset.identifier)

  /** Run script when data of dashboard changed */
  useEffect(() => {
    (
      async () => {
        // Fetch reference layer data
        dispatch(
          Actions.GlobalState.update({ datasets: identifiers })
        )

        const referenceLayerData = dictDeepCopy(referenceLayerDataState)
        for (let i = 0; i < datasets.length; i++) {
          const referenceLayer = datasets[i]
          const identifier = referenceLayer.identifier
          if (!referenceLayerData[identifier]) {
            dispatch(
              Actions.ReferenceLayerData.request(identifier)
            )

            // Fetch the data
            const url = RefererenceLayerUrls.ViewDetail(referenceLayer)
            try {
              if (referenceLayer.is_local) {
                await DjangoRequests.get(url).then(response => {
                  referenceLayerData[identifier] = apiReceive({
                    data: response.data,
                    error: null
                  })
                  dispatch(
                    Actions.ReferenceLayerData.receive(response.data, null, identifier)
                  )
                })
              } else {
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
            } catch (err) {
              console.log(err)
            }
          }

          // ------------------------------------------
          // ----------- CENTROID DATA ----------------
          // ------------------------------------------
          let url = `${preferences.georepo_api.api}/search/view/${identifier}/centroid/`
          if (datasets[i].is_local) {
            url = InternalReferenceDatasets.centroid(identifier)
          }
          await axiosGet(url).then(async centroidResponse => {
            const centroids = centroidResponse.data
            ExecuteWebWorker(
              worker,
              {
                domain: window.location.origin,
                centroids,
                identifier,
              },
              (response) => {
                const { identifier: _identifier, data } = response;
                dispatch(
                  Actions.DatasetGeometries.replaceData(
                    _identifier, data
                  )
                )
              },
              false
            )
          })
        }
      }
    )()
  }, [JSON.stringify(identifiers)]);

  return null
}