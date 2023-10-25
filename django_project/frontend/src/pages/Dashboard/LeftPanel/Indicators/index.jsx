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
import { fetchPagination } from "../../../../Requests";
import { removeElement } from "../../../../utils/Array";
import {
  filterIndicatorsData,
  UpdateStyleData
} from "../../../../utils/indicatorData";
import { LocalStorage } from "../../../../utils/localStorage";

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
   * Get All Data For and Indicator
   * Fetch it from storage or fetch it
   */
  const getData = (id, url) => {
    const allDataUrl = url.replace('latest', 'all')
    const storage = new LocalStorage(allDataUrl, allDataUrl + 'Version', 'version-1')
    const storageData = storage.get()
    if (!storageData) {
      fetchPagination(url.replace('latest', 'all')).then(response => {
        storage.save(response)
      }).catch(error => {

      })
    }
    return storageData
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
            const onResponse = (response, error) => {
              if (indicatorFetchingSession === session && response) {
                response = UpdateStyleData(response, indicator)
                dispatch(
                  Actions.IndicatorsData.receive(response, error, id)
                )
              }
              done(id)
            }
            // Fetch data, when 10, wait data
            const dataId = 'indicator-' + indicator.id
            // For data that has less than 10k data
            // Return all data first

            const metadata = indicatorLayerMetadata[dataId]
            /** TODO: We also save it per date range method. **/
            if (metadata?.count && metadata.count > MAX_COUNT_FOR_ALL_DATA) {
              fetchPagination(url, params).then(response => {
                onResponse(response, null)
              }).catch(error => {
                onResponse(null, error)
              })
            } else {
              const storageData = getData(dataId, url)
              if (storageData) {
                onResponse(
                  filterIndicatorsData(selectedGlobalTime.min, selectedGlobalTime.max, storageData)
                )
              } else {
                if (!storageData) {
                  fetchPagination(url, params).then(response => {
                    onResponse(response, null)
                  }).catch(error => {
                    onResponse(null, error)
                  })
                } else {
                  onResponse(storageData, null)
                }
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