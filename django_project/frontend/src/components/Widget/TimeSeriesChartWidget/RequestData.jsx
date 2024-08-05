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
   SHOW DATA IN TIME SERIES IN CHART WIDGET
   ========================================================================== */

import { useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { SeriesType, TimeType } from "./Definition";
import { fetchingData } from "../../../Requests";
import { dateLabel, getDatesInRange, INTERVALS } from "../../../utils/Dates";
import {
  dynamicLayerData,
  dynamicLayerIndicatorList,
  indicatorLayerId,
  indicatorLayersLikeIndicator
} from "../../../utils/indicatorLayer";

/**
 * Request data for time series widget.
 */
export default function RequestDataIndicator(
  {
    slug,
    geographicUnits,
    indicatorSeries,
    secondSeries,
    config,
    setChartData,
    setRequestProgress
  }
) {
  const prevState = useRef();
  const {
    indicators,
    indicatorLayers,
    default_time_mode
  } = useSelector(state => state.dashboard.data);
  const {
    use_only_last_known_value
  } = default_time_mode
  const selectedGlobalTimeConfig = useSelector(state => state.selectedGlobalTimeConfig);
  const {
    seriesType,
    dateTimeConfig,
    dateTimeType
  } = config
  let { interval, maxDateFilter, minDateFilter } = dateTimeConfig
  if (dateTimeType === TimeType.SYNC) {
    interval = selectedGlobalTimeConfig.interval
    maxDateFilter = selectedGlobalTimeConfig.maxDate
    minDateFilter = selectedGlobalTimeConfig.minDate
  }
  if (use_only_last_known_value) {
    interval = INTERVALS.DAILY
    minDateFilter = null
  }


  // When selected id changed, do request
  useEffect(() => {
    // We put the seond series based on the series type
    if (!secondSeries?.id) {
      return;
    }
    if (seriesType === SeriesType.INDICATORS) {
      geographicUnits = [secondSeries]
    } else if (seriesType === SeriesType.GEOGRAPHICAL_UNITS) {
      indicatorSeries = [secondSeries]
    } else {
      return
    }

    // If no series, we skip it
    if (!geographicUnits.length || !indicatorSeries.length || !interval) {
      return
    }
    const requestConfig = {
      indicatorSeries: indicatorSeries,
      geographicUnits: geographicUnits,
      selectedGlobalTimeConfig: selectedGlobalTimeConfig,
      otherIndicatorLayersConfig: indicatorLayersLikeIndicator(indicatorLayers).map(indicatorLayer => indicatorLayer.config),
      use_only_last_known_value: use_only_last_known_value
    }
    if (JSON.stringify(requestConfig) === JSON.stringify(prevState.requestConfig)) {
      return;
    }
    prevState.requestConfig = requestConfig
    prevState.session = new Date().getTime()

    const session = prevState.session;
    // Request all data
    (
      async () => {
        setChartData(null)

        // Request data
        const newDatasets = []
        let min = null
        let max = null

        const total = indicatorSeries.length * geographicUnits.length;
        for (var x = 0; x < indicatorSeries.length; x++) {
          const indicator = indicatorSeries[x]
          if (!indicator.id) {
            return
          }
          for (var y = 0; y < geographicUnits.length; y++) {
            if (prevState.session !== session) {
              return
            }

            const unit = geographicUnits[y]
            if (!unit.id) {
              return
            }
            const parameters = {
              concept_uuid: unit.id,
              frequency: interval,
              time__lte: maxDateFilter ? maxDateFilter : new Date().toISOString()
            }
            if (unit.reference_layer_uuid) {
              parameters.reference_layer_uuid = unit.reference_layer_uuid
            }
            if (minDateFilter) {
              parameters['time__gte'] = minDateFilter
            }
            // ------------------------------------------------
            // This is for the data from indicator
            // ------------------------------------------------
            let response = []
            if (!('' + indicator.id).includes('layer_')) {
              await fetchingData(
                `/api/dashboard/${slug}/indicator/${indicator.id}/values`,
                parameters, {}, (output, error) => {
                  if (output) {
                    response = output.map(row => {
                      const time = row.time * 1000
                      if (!min || time < min) {
                        min = time
                      }
                      if (!max || time > max) {
                        max = time
                      }
                      return {
                        time: dateLabel(new Date(time), interval),
                        value: row.value
                      }
                    })
                  }
                }
              )
            } else {
              // ------------------------------------------------
              // This is for the data from indicator layer
              // ------------------------------------------------
              const indicatorLayer = indicatorLayersLikeIndicator(indicatorLayers).find(layer => indicatorLayerId(layer) === indicator.id);
              if (indicatorLayer) {
                const dynamicLayerIndicators = dynamicLayerIndicatorList(indicatorLayer, indicators)
                const contextByDate = {}
                for (let x = 0; x < dynamicLayerIndicators.length; x++) {
                  const indicator = dynamicLayerIndicators[x]
                  await fetchingData(
                    `/api/dashboard/${slug}/indicator/${indicator.id}/values`,
                    parameters, {}, (output, error) => {
                      if (output) {
                        output.map(row => {
                          const time = row.time * 1000
                          if (!min || time < min) {
                            min = time
                          }
                          if (!max || time > max) {
                            max = time
                          }
                          const label = dateLabel(new Date(time), interval)
                          if (!contextByDate[label]) {
                            contextByDate[label] = {}
                          }
                          contextByDate[label][indicator.shortcode] = row.value
                        })
                      }
                    }
                  )
                }
                for (const [date, value] of Object.entries(contextByDate)) {
                  response.push({
                    time: date,
                    value: dynamicLayerData(indicatorLayer, { values: value })
                  })
                }
              }
            }

            if (prevState.session === session) {
              let name = null
              let color = null
              if (seriesType === SeriesType.INDICATORS) {
                name = indicator.name
                color = indicator.color
              } else if (seriesType === SeriesType.GEOGRAPHICAL_UNITS) {
                name = unit.name
                color = unit.color
              }
              if (name && response && color) {
                newDatasets.push({
                  label: name,
                  data: response.map(row => {
                    return {
                      x: row.time,
                      y: row.value
                    }
                  }),
                  borderColor: color,
                  backgroundColor: color
                })
              }

              // Update progress
              setRequestProgress({
                progress: (x + 1) * (y + 1),
                total: total
              })
            }
          }
        }
        if (prevState.session === session) {
          const labels = [
            ...new Set(
              getDatesInRange(new Date(min), new Date(max), interval)
            )
          ]
          setChartData({
            labels: labels,
            datasets: newDatasets
          })
        }
      }
    )()
  }, [
    secondSeries, config, selectedGlobalTimeConfig, indicatorSeries, geographicUnits, indicatorLayers, use_only_last_known_value
  ])

  return null
}
