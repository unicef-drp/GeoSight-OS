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
import { fetchingData } from "../../../../Requests";
import { removeElement } from "../../../../utils/Array";
import { UpdateStyleData } from "../../../../utils/indicatorData";

/** Indicators data. */
let indicatorFetchingSession = null
export let indicatorFetchingIds = []

export default function Indicators() {
  const prevState = useRef();
  const dispatch = useDispatch();
  const {
    indicators,
    indicatorLayers
  } = useSelector(state => state.dashboard.data);
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


  /** Fetch all data */
  const fetchData = () => {
    if (!selectedGlobalTime.max) {
      return
    }
    indicatorFetchingSession = new Date().getTime()
    const session = indicatorFetchingSession

    // Get queue
    let defaultIds = []
    indicatorLayers.filter(layer => layer.visible_by_default).map(
      layer => defaultIds = defaultIds.concat(layer.indicators.map(indicator => indicator.id))
    )
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
            if (idx % 10 === 0) {
              await fetchingData(url, params, {}, onResponse)
            } else {
              fetchingData(url, params, {}, onResponse)
            }
          } else {
            done(id)
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