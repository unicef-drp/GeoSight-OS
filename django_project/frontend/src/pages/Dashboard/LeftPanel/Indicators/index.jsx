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
import { fetchingData, fetchJSON } from "../../../../Requests";
import { removeElement } from "../../../../utils/Array";
import {
  filterIndicatorsData,
  UpdateStyleData
} from "../../../../utils/indicatorData";

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
  const indicatorsAllData = useSelector(state => state.indicatorsAllData);
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
  const getData = async (id, url) => {
    if (indicatorsAllData[id].count < MAX_COUNT_FOR_ALL_DATA) {
      let data = indicatorsAllData[id].data
      if (!indicatorsAllData[id].data) {
        data = await fetchJSON(url.replace('latest', 'all'), {})
        dispatch(Actions.IndicatorsAllData.addData(id, data))
      }
    }
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
              if (indicatorFetchingSession === session) {
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
            if (!indicatorsAllData[dataId].count > MAX_COUNT_FOR_ALL_DATA) {
              fetchingData(url, params, {}, onResponse)
            } else {
              const data = indicatorsAllData[dataId].data
              if (data && dataId === 'indicator-318') {
                onResponse(filterIndicatorsData(selectedGlobalTime.min, selectedGlobalTime.max, data))
              } else {
                fetchingData(url, params, {}, onResponse)
                getData(dataId, url, onResponse)
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