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
   DATE SELECTOR
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Slider from '@mui/material/Slider';
import Switch from "@mui/material/Switch";
import CircularProgress from '@mui/material/CircularProgress';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import KeyboardDoubleArrowDownIcon
  from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon
  from "@mui/icons-material/KeyboardDoubleArrowUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { fetchingData } from "../../../../Requests";
import { Actions } from "../../../../store/dashboard";
import { formatDate, formatDateTime, nowUTC } from "../../../../utils/main";
import {
  dateLabel,
  getDatesInRange,
  INTERVALS
} from "../../../../utils/Dates";
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import PlayControl from "./PlayControl";
import { ThemeButton } from "../../../../components/Elements/Button";

import './style.scss';

/**
 * Indicator data.
 */
export default function GlobalDateSelector() {
  const dispatch = useDispatch();
  const { globalDateSelectorOpened } = useSelector(state => state.globalState)
  const {
    indicators,
    indicatorLayers,
    default_time_mode
  } = useSelector(state => state.dashboard.data);
  const indicatorLayerDates = useSelector(state => state.indicatorLayerDates);
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const relatedTableData = useSelector(state => state.relatedTableData);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const currentIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);

  const [dates, setDates] = useState([])
  const [selectedDatePointSelected, setSelectedDatePointSelected] = useState(false)
  const {
    default_interval,
    fit_to_current_indicator_range,
    show_last_known_value_in_range
  } = default_time_mode
  const [isInLatestValue, setIsInLatestValue] = useState(show_last_known_value_in_range === undefined ? false : show_last_known_value_in_range)
  const [isFitToIndicatorRange, setIsFitToIndicatorRange] = useState(fit_to_current_indicator_range === undefined ? false : fit_to_current_indicator_range)
  const [selectedDatePoint, setSelectedDatePoint] = useState(null)
  const [interval, setInterval] = useState(default_interval ? default_interval : INTERVALS.MONTHLY)
  const [minDate, setMinDate] = useState(null)
  const [maxDate, setMaxDate] = useState(null)

  const prevState = useRef();

  /** Update time **/
  const updateTime = (min, max) => {
    const newSelectedGlobalStr = JSON.stringify({
      min: min,
      max: max
    })
    if (newSelectedGlobalStr !== prevState.selectedGlobalTimeStr) {
      prevState.selectedGlobalTimeStr = newSelectedGlobalStr
      dispatch(Actions.SelectedGlobalTime.change(min, max))
    }
  }

  /**
   *  Update dates time
   * **/
  const updateDatesTime = (newMinDate) => {
    // if it is in filter
    if (selectedDatePoint) {
      let min = null
      let max = selectedDatePoint

      let selectedMinDateStr = selectedDatePoint
      let selectedMaxDateStr = selectedDatePoint
      // Override with min date
      if (isInLatestValue) {
        if (newMinDate) {
          selectedMinDateStr = newMinDate
        } else if (minDate) {
          selectedMinDateStr = minDate
        }
      }

      const selectedMinDate = new Date(selectedMinDateStr)
      const minYear = selectedMinDate.getFullYear()
      const minMonth = selectedMinDate.getMonth()
      const minDay = selectedMinDate.getDate()

      const selectedMaxDate = new Date(selectedMaxDateStr)
      const maxYear = selectedMaxDate.getFullYear()
      const maxMonth = selectedMaxDate.getMonth()
      const maxDay = selectedMaxDate.getDate()

      // construct min/max
      switch (interval) {
        case INTERVALS.YEARLY:
          min = new Date(Date.UTC(minYear, 0, 1, 0, 0, 0)).toISOString()
          max = new Date(Date.UTC(maxYear, 11, 31, 23, 59, 59)).toISOString()
          break
        case INTERVALS.MONTHLY:
          min = new Date(Date.UTC(minYear, minMonth, 1, 0, 0, 0)).toISOString()
          max = new Date(Date.UTC(maxYear, maxMonth + 1, 0, 23, 59, 59)).toISOString()
          break
        case INTERVALS.DAILY:
          min = new Date(Date.UTC(minYear, minMonth, minDay, 0, 0, 0)).toISOString()
          max = new Date(Date.UTC(maxYear, maxMonth, maxDay, 23, 59, 59)).toISOString()
          break
      }
      updateTime(min, max)
    }
  }

  // Indicator configs
  let indicatorLayersSelected = [
    currentIndicatorLayer?.id,
    currentIndicatorSecondLayer?.id,
  ]
  if (!isFitToIndicatorRange) {
    indicatorLayersSelected = indicatorLayers.map(indicator => indicator.id)
  }
  indicatorLayersSelected.sort()

  /**
   * Return dates list of data
   * **/
  let errorMessage = ''
  const formatDates = () => {
    let newDates = []
    indicatorLayersSelected.map(id => {
      const indicatorLayer = indicatorLayers.find(layer => layer.id === id)
      if (indicatorLayer) {
        indicatorLayer?.indicators?.map(indicator => {
          const indicatorDates = indicatorLayerDates['indicator-' + indicator.id]
          if (typeof indicatorDates === 'string' && indicatorDates.includes('Error')) {
            errorMessage = indicatorDates
          }
          if (Array.isArray(indicatorDates)) {
            newDates = newDates.concat(indicatorDates)
          }
        })

        // For indicator layer
        const indicatorDates = indicatorLayerDates[id]
        if (typeof indicatorDates === 'string' && indicatorDates.includes('Error')) {
          errorMessage = indicatorDates
        }
        if (Array.isArray(indicatorDates)) {
          newDates = newDates.concat(indicatorDates)
        }
      }
    })
    newDates = [...new Set(newDates)]
    newDates = newDates.reverse()

    // Check interval and create dates
    const intervalGroupDates = {}
    newDates.map(newDate => {
      let group = ''
      const date = new Date(newDate)
      switch (interval) {
        case INTERVALS.YEARLY:
          group = date.getUTCFullYear()
          break
        case INTERVALS.MONTHLY:
          group = date.getUTCFullYear() + '-' + date.getUTCMonth()
          break
        case INTERVALS.DAILY:
          group = formatDate(date, true, true)
          break
      }
      if (!intervalGroupDates[group]) {
        intervalGroupDates[group] = []
      }
      intervalGroupDates[group].push(newDate)
    })

    // We sort
    newDates = []
    for (const [key, dates] of Object.entries(intervalGroupDates)) {
      newDates.push(dates[0])
    }
    newDates.sort()
    return newDates;
  }

  /**
   * CURRENT DATES
   * **/
  const currentDates = formatDates()
  const options = currentDates.map(date => {
    return {
      name: dateLabel(new Date(date), interval),
      value: date
    }
  })

  /**
   * Update Global Dates
   */
  useEffect(() => {
      updateDatesTime()
      if (!minDate || !currentDates.includes(minDate) || minDate > maxDate) {
        setMinDate(currentDates[0])
      }
      if (!maxDate || !currentDates.includes(maxDate) || minDate > maxDate) {
        setMaxDate(currentDates[currentDates.length - 1])
      }
    },
    [
      selectedDatePoint, interval, relatedTableData,
      isInLatestValue
    ]
  );

  /**
   * Update config date when indicator selected
   */
  useEffect(() => {
      if (JSON.stringify(prevState.indicatorLayersSelected) !== JSON.stringify(indicatorLayersSelected)) {
        if (isFitToIndicatorRange) {
          setMinDate(currentDates[0])
          setMaxDate(currentDates[currentDates.length - 1])
        }
      }
    },
    [
      currentIndicatorLayer, currentIndicatorSecondLayer
    ]
  );


  /**
   * Update Global Dates
   */
  useEffect(() => {
      if (isInLatestValue) {
        updateDatesTime(currentDates[0])
      }
      setMinDate(currentDates[0])
      setMaxDate(currentDates[currentDates.length - 1])
    },
    [isFitToIndicatorRange, interval]
  );

  /**
   * Update global config
   */
  useEffect(() => {
      dispatch(Actions.SelectedGlobalTimeConfig.change({
        selectedDatePoint, interval, minDate, maxDate, isInLatestValue
      }))
    },
    [selectedDatePoint, interval, minDate, maxDate]
  );

  /**
   * Update Global Dates
   */
  useEffect(() => {
    if (!selectedDatePointSelected || (!(selectedDatePoint >= minDate && selectedDatePoint <= maxDate))) {
      setSelectedDatePoint(maxDate)
    }
    if (isInLatestValue && selectedGlobalTime?.min !== minDate) {
      updateDatesTime()
    }
  }, [minDate, maxDate]);

  /**
   * Update indicator dates
   */
  useEffect(() => {
    indicators.map(indicator => {
      const id = 'indicator-' + indicator.id
      if (!indicatorLayerDates[id]) {
        indicatorLayerDates[id] = null

        fetchingData(
          indicator.url.replace('/values/latest', '/dates'), {}, {}, function (response, error) {
            if (!error) {
              if (!response?.length) {
                response = [nowUTC().toISOString()]
              }
              dispatch(Actions.IndicatorLayerDates.add(id, response))
            } else {
              dispatch(Actions.IndicatorLayerDates.add(id, error.toString()))
            }
          }
        )
      }
    })
  }, [indicators]);

  /**
   * Update dates
   */
  useEffect(() => {
      if (
        JSON.stringify(prevState.currentDates) !== JSON.stringify(currentDates) ||
        JSON.stringify(prevState.indicatorLayersSelected) !== JSON.stringify(indicatorLayersSelected)
      ) {
        let newDates = currentDates
        setDates([...newDates])
        prevState.currentDates = currentDates

        // Check current min/max
        let max = selectedGlobalTime.max
        if (newDates && newDates.indexOf(selectedGlobalTime.max) < 0) {
          max = newDates[newDates.length - 1]
        }
        if (!newDates.includes(selectedDatePoint)) {
          setSelectedDatePoint(max)
        } else if (currentIndicatorSecondLayer?.id && prevState.indicatorLayersSelected && !prevState.indicatorLayersSelected.includes(currentIndicatorSecondLayer?.id)) {
          setSelectedDatePoint(max)
        }
        prevState.indicatorLayersSelected = indicatorLayersSelected
      }
    },
    [
      indicatorLayerDates, currentIndicatorLayer, currentIndicatorSecondLayer, interval, isFitToIndicatorRange
    ]
  );

  // Update the inputs
  let currentSelectedDatePointMark = 0
  let usedDates = dates
  let actualMarks = []
  if (minDate && maxDate) {
    usedDates = usedDates.filter(date => date >= minDate && date <= maxDate)
    actualMarks = getDatesInRange(new Date(minDate), new Date(maxDate), interval)
  }
  const marks = usedDates.map(date => {
    let label = dateLabel(new Date(date), interval)
    const idx = actualMarks.indexOf(label)
    if (date === selectedDatePoint) {
      currentSelectedDatePointMark = idx
    }
    return {
      value: idx,
      date: date,
      label: label,
    }
  })
  return <div
    className={'GlobalDateSelection ' + (globalDateSelectorOpened ? 'Open' : '')}>
    <div className='UpperFloating'>
      <div className='Separator'/>
      <PlayControl
        dates={marks.map(mark => mark.date)}
        selectedDatePoint={selectedDatePoint}
        setSelectedDatePoint={setSelectedDatePoint}
      >
        <ThemeButton
          tabIndex="-1"
          variant={'secondary Basic Reverse'}
          className='GlobalDateSelectionIcon'
          onClick={_ => {
            dispatch(
              Actions.GlobalState.update({ globalDateSelectorOpened: !globalDateSelectorOpened })
            )
          }}>
          {
            globalDateSelectorOpened ?
              <KeyboardDoubleArrowDownIcon/> :
              <KeyboardDoubleArrowUpIcon/>
          }
          <AccessTimeIcon/>
          {
            globalDateSelectorOpened ?
              <KeyboardDoubleArrowDownIcon/> :
              <KeyboardDoubleArrowUpIcon/>
          }
        </ThemeButton>
      </PlayControl>
      <div className='Separator'/>
    </div>
    <div
      className={'GlobalDateSelectionOuterWrapper'}>
      <div className='GlobalDateSelectionWrapper'>
        {
          errorMessage ?
            <div className='LoadingElement'>
              <div className='Throbber error'>
                {errorMessage}
              </div>
            </div> :
            selectedDatePoint && minDate && maxDate ?
              <Fragment>
                <div className='UpperSection'>
                  <div className='TimeSelection'>
                    {
                      selectedGlobalTime.min && selectedGlobalTime.min !== selectedGlobalTime.max ?
                        <b>
                          {
                            formatDateTime(new Date(selectedGlobalTime.min), true, true)
                          }
                        </b> :
                        "-"
                    }
                    <div>Active Window Start</div>
                  </div>
                  <div className='UpperSectionMiddle'>
                    <div style={{ display: "flex" }}>
                      <div className='Separator'/>
                      {/* Other control */}
                      <SelectWithList
                        tabIndex="-1"
                        list={marks}
                        required={true}
                        value={currentSelectedDatePointMark}
                        classNamePrefix={'ReactSelect'}
                        onChange={evt => {
                          const selectedMark = marks.find(mark => mark.value === evt.value)
                          if (selectedMark) {
                            setSelectedDatePoint(selectedMark.date)
                            setSelectedDatePointSelected(true)
                          }
                        }}/>
                      &nbsp;&nbsp;
                      <SelectWithList
                        tabIndex="-1"
                        list={[INTERVALS.DAILY, INTERVALS.MONTHLY, INTERVALS.YEARLY]}
                        required={true}
                        value={interval}
                        classNamePrefix={'ReactSelect'}
                        onChange={evt => {
                          setInterval(evt.value)
                        }}/>
                      <div className='Separator'/>
                    </div>
                  </div>
                  <div className='TimeSelection'
                       style={{ textAlign: "right" }}>
                    <b>
                      {
                        formatDateTime(new Date(selectedGlobalTime.max), true, true)
                      }
                    </b>
                    <div>Active Window End</div>
                  </div>
                </div>
                <div className='GlobalDateSelectionSliderWrapper'>
                  <div className='TimeSelection'>
                    <div style={{ textAlign: "left" }}>Range Start</div>
                    <SelectWithList
                      tabIndex="-1"
                      className='Selection'
                      list={options}
                      required={true}
                      value={minDate}
                      classNamePrefix={'ReactSelect'}
                      onChange={evt => {
                        if (evt.value > maxDate) {
                          setMinDate(maxDate)
                        } else {
                          setMinDate(evt.value)
                        }
                      }}/>
                  </div>
                  <div className='Middle'>
                    <div className='Options'>
                      <div className='Separator'/>
                      <FormGroup style={{ marginRight: "2rem" }}>
                        <FormControlLabel control={
                          <Switch
                            tabIndex="-1"
                            size="small"
                            className='Secondary'
                            checked={isFitToIndicatorRange}
                            onChange={() => {
                              setIsFitToIndicatorRange(!isFitToIndicatorRange)
                            }}
                          />
                        } label="Fit to current indicator range"/>
                      </FormGroup>
                      <FormGroup>
                        <FormControlLabel control={
                          <Switch
                            tabIndex="-1"
                            size="small"
                            className='Secondary'
                            checked={isInLatestValue}
                            onChange={() => {
                              setIsInLatestValue(!isInLatestValue)
                            }}
                          />
                        } label="Show last known value in range"/>
                      </FormGroup>
                      <div className='Separator'/>
                    </div>
                    <div
                      className={'GlobalDateSelectionSlider ' + (marks.length <= 1 ? 'Single' : '')}>
                      <Slider
                        tabIndex="-1"
                        value={currentSelectedDatePointMark}
                        max={actualMarks.length - 1}
                        step={null}
                        track={false}
                        valueLabelDisplay="auto"
                        marks={marks}
                        valueLabelFormat={value => {
                          const selectedMark = marks.find(mark => mark.value === value)
                          if (selectedMark) {
                            return dateLabel(new Date(selectedMark.date), interval)
                          }
                          return ''
                        }}
                        onChange={(evt) => {
                          const selectedMark = marks.find(mark => mark.value === evt.target.value)
                          if (selectedMark) {
                            setSelectedDatePoint(selectedMark.date)
                            setSelectedDatePointSelected(true)
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className='TimeSelection'>
                    <div style={{ textAlign: "right" }}>Range End</div>
                    <SelectWithList
                      tabIndex="-1"
                      className='Selection'
                      list={options}
                      required={true}
                      value={maxDate}
                      classNamePrefix={'ReactSelect'}
                      onChange={evt => {
                        if (evt.value < minDate) {
                          setMaxDate(minDate)
                        } else {
                          setMaxDate(evt.value)
                        }
                      }}/>
                  </div>
                </div>
              </Fragment> : <div className='LoadingElement'>
                <div className='Throbber'>
                  <CircularProgress/>
                  Preparing time control...
                </div>
              </div>
        }
      </div>
    </div>
  </div>
}