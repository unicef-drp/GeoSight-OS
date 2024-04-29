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

import { useEffect, useRef } from 'react';
import $ from "jquery";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../store/dashboard";
import { fetchPaginationInParallel } from "../../../../Requests";
import { removeElement } from "../../../../utils/Array";
import {
  getIndicatorDataId,
  UpdateStyleData
} from "../../../../utils/indicatorData";
import { dictDeepCopy } from "../../../../utils/main";
import {
  referenceLayerIndicatorLayer
} from "../../../../utils/indicatorLayer";

/** Indicators data. */
let indicatorFetchingSession = null
export let indicatorFetchingIds = []
const MAX_COUNT_FOR_ALL_DATA = 10000
const allRequestStatus = {}

export default function Indicators() {
  const prevState = useRef();
  const dispatch = useDispatch();
  const {
    referenceLayer,
    indicators,
    indicatorLayers,
    default_time_mode
  } = useSelector(state => state.dashboard.data);
  const {
    use_only_last_known_value
  } = default_time_mode
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
  }, [indicators, indicatorLayerMetadata]);

  /** Loading data **/
  const loading = (id) => {
    const indicatorLayer = indicatorLayers.filter(layer => layer.indicators.map(indicator => indicator.id).includes(id))
    indicatorLayer.map(indicatorLayer => {
      indicatorFetchingIds.push(indicatorLayer.id);
      $('#Indicator-Radio-' + indicatorLayer.id).addClass('Loading')
    })
    dispatch(Actions.IndicatorsData.request(id))

    // get metadata and update progress
    const dataId = 'indicator-' + id
    const metadata = indicatorLayerMetadata[dataId]
    if (metadata?.version) {
      dispatch(
        Actions.IndicatorsMetadata.progress(id, {
          total_page: Math.ceil(metadata.count / 100),
          page: 0
        })
      )
    }
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
  const getDataByDate = async (id, url, params, currentGlobalTime, dataVersion, onProgress, usingCache) => {
    return await fetchPaginationInParallel(url, params, onProgress)
  }

  /***
   * Get Data function for just returning data
   */
  const getDataFn = async (id, url, params, currentGlobalTime, dataVersion, onResponse, onProgress, doAll, referenceLayerIdentifier) => {
    const identifier = url + '?reference_layer_uuid=' + referenceLayerIdentifier
    if (allRequestStatus[identifier] !== 'done') {
      params.reference_layer_uuid = referenceLayerIdentifier
      params.version = dataVersion
      const dateResponse = await getDataByDate(id, url, params, dictDeepCopy(selectedGlobalTime), dataVersion, onProgress)
      onResponse(dateResponse)
    }
    if (doAll) {
      const allDataResponse = await fetchPaginationInParallel(url, {
        reference_layer_uuid: referenceLayerIdentifier,
        version: dataVersion,
        last_value: false
      })
      allRequestStatus[identifier] = 'done'
      onResponse(allDataResponse, null, true)
    }
  }

  /***
   * Get All Data For and Indicator
   * Fetch it from storage or fetch it
   */
  const getDataPromise = async (id, url, params, currentGlobalTime, dataVersion, onResponse, onProgress, doAll, referenceLayerIdentifier) => {
    return new Promise((resolve, reject) => {
      (
        async () => {
          try {
            await getDataFn(id, url, params, currentGlobalTime, dataVersion, onResponse, onProgress, doAll, referenceLayerIdentifier)
          } catch (error) {
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
    if (!referenceLayer?.identifier) {
      return
    }
    indicatorFetchingSession = new Date().getTime()
    const session = indicatorFetchingSession

    const indicatorsWithDataset = [];
    [currentIndicatorLayer, currentIndicatorSecondLayer].concat(indicatorLayers).map(layer => {
      const identifier = referenceLayerIndicatorLayer(referenceLayer, layer)?.identifier;
      layer?.indicators?.map(_ => {
        const data = indicatorsWithDataset.find(row => row.id === _.id)
        if (!data) {
          indicatorsWithDataset.push({
            id: _.id,
            datasets: [identifier]
          })
        } else {
          data.datasets.push(identifier)
        }
      })
    })
    indicators.map(_ => {
      const data = indicatorsWithDataset.find(row => row.id === _.id)
      if (!data) {
        indicatorsWithDataset.push({
          id: _.id,
          datasets: [referenceLayer.identifier]
        })
      } else {
        data.datasets.push(referenceLayer.identifier)
      }
    })

    // Get parameter
    const params = {
      'time__lte': selectedGlobalTime.max
    }
    if (selectedGlobalTime.min) {
      params['time__gte'] = selectedGlobalTime.min
    }
    indicatorFetchingIds = [];

    //   Fetch all indicator data
    (
      async () => {
        // Create loading
        // TODO:
        //  Loading by datasets
        indicatorsWithDataset.map(row => {
          const indicator = indicators.find(
            indicator => indicator.id === row.id
          )
          if (indicator) {
            const { id } = indicator
            const referenceLayerIdentifier = referenceLayer?.identifier;
            loading(id, referenceLayerIdentifier)
          }

        })

        // Create request state
        for (var idx = 0; idx <= indicatorsWithDataset.length - 1; idx++) {
          const { id: _id, datasets } = indicatorsWithDataset[idx]
          const indicator = indicators.find(
            indicator => indicator.id === _id
          )
          const referenceDatasets = Array.from(new Set(datasets))
          if (indicator) {
            const { id, url } = indicator
            for (var idxY = 0; idxY <= referenceDatasets.length - 1; idxY++) {
              const referenceLayerIdentifier = referenceDatasets[idxY]
              const indicatorDataId = getIndicatorDataId(id, referenceLayer.identifier, referenceLayerIdentifier)

              // On Response
              const onResponse = (response, error, force) => {
                if ((indicatorFetchingSession === session && response) || force) {
                  response = UpdateStyleData(response, indicator)
                  dispatch(
                    Actions.IndicatorsData.receive(response, error, indicatorDataId)
                  )
                  dispatch(
                    Actions.IndicatorsMetadata.progress(
                      id, {
                        total_page: Math.ceil(response.length / 100),
                        page: Math.ceil(response.length / 100)
                      }
                    )
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
                const doAll = !use_only_last_known_value && metadata?.count && metadata.count < MAX_COUNT_FOR_ALL_DATA

                // If index is 1, waiting for this to be done
                getDataPromise(
                  dataId, url, params, dictDeepCopy(selectedGlobalTime), version, onResponse, onProgress, doAll, referenceLayerIdentifier
                ).catch(error => {
                  onResponse(null, error)
                })
              }
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