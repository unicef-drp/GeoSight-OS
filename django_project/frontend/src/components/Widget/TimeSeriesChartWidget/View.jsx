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

import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import LinearProgress from '@mui/material/LinearProgress';

import Chart from "./Chart";
import { SelectWithList } from "../../Input/SelectWithList";
import { SeriesDataType, SeriesType, TimeType } from "./Definition";
import { fetchingData } from "../../../Requests";
import { getRandomColor } from "../../../utils/main";
import { dateLabel } from "../../../utils/Dates";
import { indicatorLayerId } from "../../../utils/indicatorLayer";
import RequestData from "./RequestData";

import './style.scss';

/**
 * Selection of data.
 * @param {dict} config Widget Data
 * @param {dict} secondSeries Selected second series
 * @param {Function} setSecondSeries Set second series
 */
export function Selection(
  { list, secondSeries, setSecondSeries }
) {
  // When config changed
  useEffect(() => {
    if (!list.map(row => row.id).includes(secondSeries?.id) || !list.map(row => row.color).includes(secondSeries?.color)) {
      setSecondSeries(list[0])
    }
  }, [list])

  return <SelectWithList
    tabIndex="-1"
    list={list}
    value={secondSeries}
    onChange={evt => {
      setSecondSeries(evt.value)
    }}/>
}

/**
 * General widget to show time series widget.
 * @param {dict} data Widget Data
 */
export default function TimeSeriesChartWidget({ data }) {
  const {
    slug,
    default_time_mode
  } = useSelector(state => state.dashboard.data);
  const { referenceLayers } = useSelector(state => state.map)
  const referenceLayer = referenceLayers[0]
  const {
    use_only_last_known_value
  } = default_time_mode
  const [colorPalettes, setColorPalettes] = useState(null);
  const selectedGlobalTimeConfig = useSelector(state => state.selectedGlobalTimeConfig);
  const geometries = useSelector(state => state.datasetGeometries[referenceLayer?.identifier]);
  const filteredGeometries = useSelector(state => state.filteredGeometries);
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)
  const selectedIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer)
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);

  const [requestProgress, setRequestProgress] = useState({
    progress: 0,
    total: 1
  });
  const [indicatorsList, setIndicatorsList] = useState([]);
  const [unitList, setUnitList] = useState([]);

  const [secondSeries, setSecondSeries] = useState({});
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  const { name, config } = data
  const {
    dateTimeConfig,
    geographicalUnitPaletteColor,
    indicatorsPaletteColor
  } = config
  const dateTimeType = use_only_last_known_value ? TimeType.SYNC : config.dateTimeType

  // Get date data
  let { interval } = dateTimeConfig
  if (dateTimeType === TimeType.SYNC) {
    interval = selectedGlobalTimeConfig.interval
  }

  let geographicUnits = []
  switch (config.geographicalUnitType) {
    case SeriesDataType.PREDEFINED: {
      geographicUnits = config.geographicalUnitList
      break
    }
    case SeriesDataType.SYNC: {
      geographicUnits = unitList.filter(
        geom => !(filteredGeometries && !filteredGeometries.includes(geom.id))
      )
      break
    }
  }

  let indicatorSeries = []
  switch (config.indicatorsType) {
    case SeriesDataType.PREDEFINED: {
      indicatorSeries = config.indicatorsList
      break
    }
    case SeriesDataType.SYNC: {
      indicatorSeries = indicatorsList
      break
    }
  }

  // On init
  useEffect(() => {
    (
      async () => {
        await fetchingData(
          `/api/color/palette/list`,
          {}, {}, (response, error) => {
            setColorPalettes(response)
          }
        )
      }
    )()
  }, [])


  // Update indicator list
  useEffect(() => {
    if (colorPalettes === null) {
      return
    }
    const color = colorPalettes.find(color => color.id === indicatorsPaletteColor)
    let colors = null
    if (color) {
      colors = color.colors
    }
    let indicatorList = []
    if (selectedIndicatorLayer?.indicators?.length) {
      indicatorList = indicatorList.concat(
        selectedIndicatorLayer.indicators.map(indicator => {
          const indicatorInList = indicatorsList.find(row => row.id === indicator.id)
          if (!indicatorInList) {
            return {
              id: indicator.id,
              name: indicator.name,
              color: getRandomColor()
            }
          }
          return indicatorInList
        })
      )
    } else if (selectedIndicatorLayer?.id) {
      const id = indicatorLayerId(selectedIndicatorLayer)
      const indicatorInList = indicatorsList.find(row => row.id === id)
      if (!indicatorInList) {
        indicatorList.push({
          id: id,
          name: selectedIndicatorLayer.name,
          color: getRandomColor()
        })
      } else {
        indicatorList.push(indicatorInList)
      }
    }
    if (selectedIndicatorSecondLayer?.indicators?.length) {
      indicatorList = indicatorList.concat(
        selectedIndicatorSecondLayer.indicators.map(indicator => {
          const indicatorInList = indicatorsList.find(row => row.id === indicator.id)
          if (!indicatorInList) {
            return {
              id: indicator.id,
              name: indicator.name,
              color: getRandomColor()
            }
          }
          return indicatorInList
        })
      )
    } else if (selectedIndicatorSecondLayer?.id) {
      const id = indicatorLayerId(selectedIndicatorSecondLayer)
      const indicatorInList = indicatorsList.find(row => row.id === id)
      if (!indicatorInList) {
        indicatorList.push({
          id: id,
          name: selectedIndicatorSecondLayer.name,
          color: getRandomColor()
        })
      } else {
        indicatorList.push(indicatorInList)
      }
    }
    indicatorList.map((list, idx) => {
      if (colors?.length) {
        list.color = colors[idx % color.colors.length]
      }
    })
    setIndicatorsList(indicatorList)
  }, [selectedIndicatorLayer, selectedIndicatorSecondLayer, colorPalettes])

  // Geometries of data
  useEffect(() => {
    if (colorPalettes === null || !geometries) {
      return
    }
    const color = colorPalettes.find(color => color.id === geographicalUnitPaletteColor)
    let colors = null
    if (color) {
      colors = color.colors
    }
    const geometriesData = geometries[selectedAdminLevel.level]
    const newGeographicUnits = []
    if (geometriesData) {
      for (const [code, geom] of Object.entries(geometriesData)) {
        const geomInList = unitList.find(row => row.id === geom.concept_uuid)
        if (!geomInList) {
          newGeographicUnits.push({
            id: geom.concept_uuid,
            name: `${geom.name} (${geom.ucode})`,
            color: '' + getRandomColor(),
            reference_layer_uuid: referenceLayer.identifier
          })
        } else {
          newGeographicUnits.push(geomInList)
        }
      }
    }
    newGeographicUnits.map((list, idx) => {
      if (colors?.length) {
        list.color = colors[idx % color.colors.length]
      }
    })
    setUnitList(newGeographicUnits)
  }, [geometries, colorPalettes, selectedAdminLevel])

  const secondSeriesList = config.seriesType === SeriesType.INDICATORS ? geographicUnits : indicatorSeries

  if (error) {
    return <div
      className='widget__error'>
      {'' + ('' + error).replaceAll('Error: ', '')}
    </div>
  }
  return (
    <Fragment>
      <div className='widget__sw widget__sgw'>
        <div className='widget__title'>{name}</div>
        <div className='widget__content widget__time_series'>
          {
            requestProgress.total !== requestProgress.progress ?
              <LinearProgress
                variant="determinate"
                value={requestProgress.progress * 100 / requestProgress.total}/> : null
          }
          {
            secondSeriesList.length ? <Fragment>
                <Selection
                  list={secondSeriesList}
                  secondSeries={secondSeries}
                  setSecondSeries={setSecondSeries}/>
                <Chart
                  chartData={chartData}
                  selectedLabel={
                    selectedGlobalTimeConfig.selectedDatePoint ? dateLabel(new Date(selectedGlobalTimeConfig.selectedDatePoint), interval) : null
                  }/>
              </Fragment> :
              <div className='form-helptext'>
                {selectedIndicatorLayer?.id ? 'This indicator layer is not supported yet.' : 'No indicator layer is selected.'}
              </div>
          }
        </div>
      </div>
      <RequestData
        slug={slug}
        geographicUnits={geographicUnits}
        indicatorSeries={indicatorSeries}
        secondSeries={secondSeries}
        config={{
          ...config,
          dateTimeType: dateTimeType,
        }}
        setChartData={setChartData}
        setRequestProgress={setRequestProgress}
        setError={setError}
      />
    </Fragment>
  )
}
