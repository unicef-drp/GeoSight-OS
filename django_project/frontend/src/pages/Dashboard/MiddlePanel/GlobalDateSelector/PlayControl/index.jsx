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

import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  TimeFirstIcon,
  TimePreviousIcon,
  TimePlayIcon,
  TimeStopIcon,
  TimeNextIcon,
  TimeLastIcon,
} from "../../../../../components/Icons";
import { ThemeButton } from "../../../../../components/Elements/Button";
import { allLayerDataIsReady } from "../../../../../utils/indicatorLayer";
import { returnWhere } from "../../../../../utils/queryExtraction";

import { selectIndicatorLayers } from "../../../../../selectors/indicatorLayers";

import './style.scss';

let playControlTimeout = null

/***
 * Play control
 */
export default function PlayControl(
  { dates, selectedDatePoint, setSelectedDatePoint, children }
) {
  const { t } = useTranslation();
  const {
    filters,
    referenceLayer,
    indicatorLayers
  } = useSelector(state => state.dashboard.data)
  const indicatorsData = useSelector(state => state.indicatorsData)
  const relatedTableData = useSelector(state => state.relatedTableData)
  const selectedIndicatorLayers = useSelector(selectIndicatorLayers)
  const indicatorLayersData = useSelector((state) => state.indicatorLayersData)

  // Speed it 2 second for 0%
  const minSpeed = 10; // second
  const [speed, setSpeed] = useState(5);
  const [nextIdx, setNextIdx] = useState(-1);

  // Set play control
  const [isPlay, setIsPlay] = useState(null);
  const disabled = dates.length <= 1
  const idx = dates.indexOf(selectedDatePoint)

  /**
   * Control functions
   */
  const play = () => {
    setIsPlay(true)
    next()
  }
  const stopTimeout = () => {
    if (playControlTimeout) {
      clearTimeout(playControlTimeout);
    }
    playControlTimeout = null
  }
  const stop = () => {
    stopTimeout()
    setIsPlay(null)
  }
  const next = () => {
    const nextIdx = (idx + 1) < dates.length ? idx + 1 : 0
    setNextIdx(nextIdx)
  }

  /**
   * Change date if play
   */
  useEffect(() => {
    if (isPlay) {
      const speedTime = minSpeed * 1000 / speed;
      const where = returnWhere(filters ? filters : [])
      let layers = selectedIndicatorLayers
      if (where) {
        layers = indicatorLayers
      }
      const ready = allLayerDataIsReady(
        indicatorsData, relatedTableData, layers, referenceLayer, indicatorLayersData
      )
      if (ready) {
        stopTimeout()
        const currentPlayControlTimeout = setTimeout(function () {
          if (isPlay && currentPlayControlTimeout === playControlTimeout) {
            next()
          }
        }, speedTime);
        playControlTimeout = currentPlayControlTimeout
      }
    }
  }, [indicatorsData, relatedTableData, selectedDatePoint, isPlay, nextIdx]);

  /**
   * If is play and nextIDX changed
   */
  useEffect(() => {
    if (dates[nextIdx]) {
      setSelectedDatePoint(dates[nextIdx])
    } else {
      stop()
    }
  }, [nextIdx]);

  return <div className='GlobalDatePlaysControl'>
    <ThemeButton
      tabIndex="-1"
      title={t('dashboardPage.playControl.start')}
      variant={'secondary Basic Reverse'}
      disabled={disabled}
      onClick={() => {
        stop()
        setNextIdx(0)
      }}>
      <TimeFirstIcon/>
    </ThemeButton>
    <ThemeButton
      tabIndex="-1"
      title={t('dashboardPage.playControl.previous')}
      variant={'secondary Basic Reverse'}
      disabled={disabled}
      onClick={() => {
        stop()
        const nextIdx = (idx - 1) >= 0 ? idx - 1 : (dates.length - 1)
        setNextIdx(nextIdx)
      }}>
      <TimePreviousIcon/>
    </ThemeButton>
    <ThemeButton
      tabIndex="-1"
      title={t('dashboardPage.playControl.play')}
      variant={'secondary Basic ' + (!isPlay ? 'Reverse' : '')}
      disabled={disabled} onClick={play}>
      <TimePlayIcon/>
    </ThemeButton>
    <ThemeButton
      tabIndex="-1"
      title={t('dashboardPage.playControl.stop')}
      variant={'secondary Basic Reverse'}
      disabled={disabled || !isPlay} onClick={stop}>
      <TimeStopIcon/>
    </ThemeButton>
    <ThemeButton
      tabIndex="-1"
      title={t('dashboardPage.playControl.next')}
      variant={'secondary Basic Reverse'}
      disabled={disabled}
      onClick={() => {
        stop()
        next()
      }}>
      <TimeNextIcon/>
    </ThemeButton>
    <ThemeButton
      tabIndex="-1"
      title={t('dashboardPage.playControl.end')}
      variant={'secondary Basic Reverse'}
      disabled={disabled}
      onClick={() => {
        stop()
        setNextIdx(dates.length - 1)
      }}>
      <TimeLastIcon/>
    </ThemeButton>
    {children}
  </div>
}