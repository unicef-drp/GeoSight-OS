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
import { SeriesType, TimeType } from "../Definition";
import { dateLabel, getDatesInRange, INTERVALS } from "../../../utils/Dates";
import {
  dynamicLayerData,
  dynamicLayerIndicatorList,
  indicatorLayerId,
  indicatorLayersLikeIndicator
} from "../../../utils/indicatorLayer";
import { Indicator } from "../../../class/Indicator";
import { isUUID } from "../../../utils/main";

/**
 * Request data for time series widget.
 */
export default function RequestDataIndicator(
  {
    geographicUnits,
    indicatorSeries,
    secondSeries,
    config,
    setChartData,
    setRequestProgress,
    setError
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
        try {
          setChartData(null)
          setError('')

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
            const indicatorObj = new Indicator({ id: indicator.id });
            for (var y = 0; y < geographicUnits.length; y++) {
              if (prevState.session !== session) {
                return
              }

              const unit = geographicUnits[y]
              if (!unit.id) {
                return
              }
              const parameters = {
                frequency: interval,
                date__lte: dateLabel(maxDateFilter ? new Date(maxDateFilter) : new Date())
              }
              try {
                parameters.geom_id = unit.name.split('(')[1].replace(')', '')
              } catch (err) {
                if(isUUID(unit.id)) {
                  parameters.concept_uuid = unit.id
                }else {
                  parameters.geom_id = unit.id
                }
              }
              if (minDateFilter) {
                parameters['date__gte'] = dateLabel(new Date(minDateFilter))
              }
              // ------------------------------------------------
              // This is for the data from indicator
              // ------------------------------------------------
              let response = []
              if (!('' + indicator.id).includes('layer_')) {
                const output = await indicatorObj.values(parameters);
                response = output.map(row => {
                  const date = new Date(row.date)
                  const time = new Date(row.date).getTime()
                  const label = dateLabel(date, interval)
                  if (!min || time < min) {
                    min = time
                  }
                  if (!max || time > max) {
                    max = time
                  }
                  return {
                    time: label,
                    value: row.value
                  }
                })
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
                    const output = await (new Indicator({ id: indicator.id })).values(parameters);
                    output.map(row => {
                      const date = new Date(row.date)
                      const time = new Date(row.date).getTime()
                      const label = dateLabel(date, interval)
                      if (!min || time < min) {
                        min = time
                      }
                      if (!max || time > max) {
                        max = time
                      }
                      if (!contextByDate[label]) {
                        contextByDate[label] = {}
                      }
                      contextByDate[label][indicator.shortcode] = row.value
                    })
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
        } catch (err) {
          setError(err.response?.data?.detail ? err.response?.data?.detail : err.message)
        }
      }
    )()
  }, [
    secondSeries, config, selectedGlobalTimeConfig, indicatorSeries, geographicUnits, indicatorLayers, use_only_last_known_value
  ])

  return null
}
