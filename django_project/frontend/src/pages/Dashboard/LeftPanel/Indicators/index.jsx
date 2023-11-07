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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   INDICATOR
   ========================================================================== */

import React, { useEffect, useRef } from 'react';
import $ from "jquery";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../store/dashboard";
import {
  fetchPagination,
  fetchPaginationInParallel
} from "../../../../Requests";
import { removeElement } from "../../../../utils/Array";
import {
  filterIndicatorsData,
  UpdateStyleData
} from "../../../../utils/indicatorData";
import {
  LocalStorage,
  LocalStorageData
} from "../../../../utils/localStorage";
import { dictDeepCopy, jsonToUrlParams } from "../../../../utils/main";
import { Session } from "../../../../utils/Sessions";

/** Indicators data. */
let indicatorFetchingSession = null
export let indicatorFetchingIds = []
const MAX_COUNT_FOR_ALL_DATA = 10000

export default function Indicators() {
  const prevState = useRef();
  const dispatch = useDispatch();
  const {
    indicators,
    indicatorLayers
  } = useSelector(state => state.dashboard.data);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const currentIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);
  const indicatorLayerMetadata = useSelector(state => state.indicatorLayerMetadata);
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const selectedGlobalTimeStr = JSON.stringify(selectedGlobalTime);

  /**
   * Change selected time when selected global time changed and correct.
   * */
  useEffect(() => {
    if (selectedGlobalTime.max && selectedGlobalTimeStr !== prevState.selectedGlobalTimeStr) {
      prevState.selectedGlobalTimeStr = selectedGlobalTimeStr
      fetchData()
    }
  }, [selectedGlobalTime]);

  /** Change queue when indicators changed*/
  useEffect(() => {
    if (selectedGlobalTime) {
      fetchData()
    }
  }, [indicators]);

  /** At first time, put loading. */
  useEffect(() => {
    indicators.map(indicator => loading(indicator.id));
  }, []);

  /** Loading data **/
  const loading = (id) => {
    const indicatorLayer = indicatorLayers.filter(layer => layer.indicators.map(indicator => indicator.id).includes(id))
    indicatorLayer.map(indicatorLayer => {
      indicatorFetchingIds.push(indicatorLayer.id);
      $('#Indicator-Radio-' + indicatorLayer.id).addClass('Loading')
    })
    dispatch(Actions.IndicatorsData.request(id))
  }

  /** Done data **/
  const done = (id) => {
    const indicatorLayer = indicatorLayers.filter(layer => layer.indicators.map(indicator => indicator.id).includes(id))
    indicatorLayer.map(indicatorLayer => {
      removeElement(indicatorFetchingIds, indicatorLayer.id)
      $('#Indicator-Radio-' + indicatorLayer.id).removeClass('Loading')
    })
  }

  /***
   * Get Data For and Indicator by dates
   * Fetch it from storage or fetch it
   */
  const getDataByDate = async (id, url, params, currentGlobalTime, dataVersion, onProgress) => {
    const storage = new LocalStorageData(url, dataVersion)
    const storageData = storage.get()
    // Check if the request is already requested before
    let doRequest = false
    const requestKey = url + '?' + jsonToUrlParams(params) + '-Version'
    if (storageData) {
      const requestStorage = new LocalStorage(requestKey)
      if (requestStorage.get() !== '' + dataVersion) {
        doRequest = true
      }
    } else {
      doRequest = true
    }

    if (doRequest) {
      const response = await fetchPaginationInParallel(url, params, onProgress)
      storage.appendData(response)
      new LocalStorage(requestKey).set(dataVersion)
      return response
    } else {
      return storageData
    }
  }

  /***
   * Get All Data For and Indicator
   * Fetch it from storage or fetch it
   */
  const getData = async (id, url, params, currentGlobalTime, dataVersion, onResponse, onProgress, doAll) => {
    return new Promise((resolve, reject) => {
      (
        async () => {
          try {
            const storage = new LocalStorageData(url, dataVersion)
            let storageData = storage.get()

            // Check if we need to request all
            let doRequestAll = false
            if (doAll) {
              const requestKey = url.replace('latest', 'all') + '-Version'
              if (storageData) {
                const requestStorage = new LocalStorage(requestKey)
                if (requestStorage.get() !== '' + dataVersion) {
                  doRequestAll = true
                }
              } else {
                doRequestAll = true
              }
            }

            // Get quick data on current date
            // But if it says doing request All
            if (!storageData || doRequestAll) {
              storageData = await getDataByDate(id, url, params, dictDeepCopy(selectedGlobalTime), dataVersion, onProgress)
            }

            // Do Request all if the data version is already ALL data
            {
              if (doRequestAll) {
                let doRequest = false
                const requestKey = url.replace('latest', 'all') + '-Version'
                if (storageData) {
                  const requestStorage = new LocalStorage(requestKey)
                  if (requestStorage.get() !== '' + dataVersion) {
                    doRequest = true
                  }
                } else {
                  doRequest = true
                }
                const session = new Session(url, 0, true)
                if (session.isValid) {
                  if (doRequest) {
                    // Fetch all data
                    fetchPagination(url.replace('latest', 'all')).then(response => {
                      storage.replaceData(response)
                      new LocalStorage(requestKey).set(dataVersion)
                    }).catch(error => {

                    })
                  }
                }
              }
            }
            resolve(storageData)
          } catch (error) {
            console.log(error)
            reject(error)
          }
        }
      )()
    });
  }

  /** Fetch all data */
  const fetchData = () => {
    if (!selectedGlobalTime.max) {
      return
    }
    indicatorFetchingSession = new Date().getTime()
    const session = indicatorFetchingSession

    // Get queue
    let defaultIds = []
    if (currentIndicatorLayer?.indicators) {
      defaultIds = defaultIds.concat(currentIndicatorLayer?.indicators?.map(_ => _.id))
    }
    if (currentIndicatorSecondLayer?.indicators) {
      defaultIds = defaultIds.concat(currentIndicatorSecondLayer?.indicators?.map(_ => _.id))
    }
    const requestQueue = defaultIds.concat(
      indicators.filter(
        indicator => !defaultIds.includes(indicator.id)
      ).map(indicator => indicator.id)
    )

    // Get parameter
    const params = {
      'time__lte': selectedGlobalTime.max
    }
    if (selectedGlobalTime.min) {
      params['time__gte'] = selectedGlobalTime.min
    }
    indicatorFetchingIds = []
    requestQueue.map(id => loading(id));

    //   Fetch all indicator data
    (
      async () => {
        // Create request state
        for (var idx = 1; idx <= requestQueue.length; idx++) {
          const indicator = indicators.find(
            indicator => indicator.id === requestQueue[idx - 1]
          )
          if (indicator) {
            const { id, url, style } = indicator

            // On Response
            const onResponse = (response, error) => {
              if (indicatorFetchingSession === session && response) {
                response = UpdateStyleData(response, indicator)
                dispatch(
                  Actions.IndicatorsData.receive(filterIndicatorsData(selectedGlobalTime.min, selectedGlobalTime.max, response), error, id)
                )
              }
              done(id)
            }

            // On Progress
            const onProgress = (progress) => {
              if (indicatorFetchingSession === session) {
                dispatch(
                  Actions.IndicatorsMetadata.progress(id, progress)
                )
              }
            }
            // Fetch data, when 10, wait data
            const dataId = 'indicator-' + indicator.id
            // For data that has less than 10k data
            // Return all data first

            const metadata = indicatorLayerMetadata[dataId]
            if (metadata?.version) {
              const version = metadata?.version

              getData(
                dataId, url, params, dictDeepCopy(selectedGlobalTime), version, onResponse, onProgress,
                metadata?.count && metadata.count < MAX_COUNT_FOR_ALL_DATA
              ).then(response => {
                onResponse(response, null)
              }).catch(error => {
                onResponse(null, error)
              })
            }
          }
          if (indicatorFetchingSession !== session) {
            break
          }
        }
      }
    )()
  }

  return null
}