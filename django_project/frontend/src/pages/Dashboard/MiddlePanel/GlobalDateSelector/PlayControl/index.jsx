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
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { allLayerDataIsReady } from "../../../../../utils/indicatorLayer";
import { returnWhere } from "../../../../../utils/queryExtraction";
import {
  TimeFirstIcon,
  TimeLastIcon,
  TimeNextIcon,
  TimePauseIcon,
  TimePlayIcon,
  TimePreviousIcon,
  TimeStopIcon
} from "../../../../../components/Icons";
import { selectIndicatorLayers } from "../../../../../selectors/indicatorLayers";

import './style.scss';

let playControlTimeout = null

/***
 * Play control
 */
export default function PlayControl(
  { dates, selectedDatePoint, setSelectedDatePoint, onReset }
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

  /** One transport button. */
  const button = (key, title, icon, onClick, extra = {}) => (
    <button
      type="button"
      className={'TimeBarButton' + (extra.active ? ' Active' : '')}
      title={title}
      aria-label={title}
      aria-pressed={extra.pressed}
      disabled={disabled && !extra.enabled}
      onClick={onClick}
      data-testid={'time-slider-' + key}
    >
      {icon}
    </button>
  )

  return <div
    className='GlobalDatePlaysControl'
    role="group"
    aria-label={t('dashboardPage.timeSlider.playback')}
  >
    {
      button('first', t('dashboardPage.timeSlider.first'), <TimeFirstIcon/>, () => {
        stop()
        setNextIdx(0)
      })
    }
    {
      button('previous', t('dashboardPage.timeSlider.previous'), <TimePreviousIcon/>, () => {
        stop()
        setNextIdx((idx - 1) >= 0 ? idx - 1 : (dates.length - 1))
      })
    }
    {
      button(
        'play',
        isPlay ? t('dashboardPage.timeSlider.pause') : t('dashboardPage.timeSlider.play'),
        isPlay ? <TimePauseIcon/> : <TimePlayIcon/>,
        isPlay ? stop : play,
        { active: !!isPlay, pressed: !!isPlay }
      )
    }
    {
      // Stop also resets the time slider to the project's default time settings.
      button('stop', t('dashboardPage.timeSlider.stop'), <TimeStopIcon/>, () => {
        stop()
        if (onReset) {
          onReset()
        }
      }, { enabled: true })
    }
    {
      button('next', t('dashboardPage.timeSlider.next'), <TimeNextIcon/>, () => {
        stop()
        next()
      })
    }
    {
      button('last', t('dashboardPage.timeSlider.last'), <TimeLastIcon/>, () => {
        stop()
        setNextIdx(dates.length - 1)
      })
    }
  </div>
}
