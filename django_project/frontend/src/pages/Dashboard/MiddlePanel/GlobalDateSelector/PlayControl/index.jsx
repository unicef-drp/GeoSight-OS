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
   Playback buttons: first, previous, play/pause, stop (reset), next, last.
   State lives in usePlayback (one per time slider).
   ========================================================================== */

import React from 'react';
import { useTranslation } from "react-i18next";
import {
  TimeFirstIcon,
  TimeLastIcon,
  TimeNextIcon,
  TimePauseIcon,
  TimePlayIcon,
  TimePreviousIcon,
  TimeStopIcon
} from "../../../../../components/Icons";

import './style.scss';

export { usePlayback } from "./usePlayback";

/***
 * Play control
 * @param {object} playback From usePlayback.
 * @param {function} onReset Stop also resets to the default time settings.
 * @param {string} className Extra class (e.g. the mobile sheet layout).
 */
export default function PlayControl({ playback, onReset, className = '' }) {
  const { t } = useTranslation();
  const { isPlay, disabled } = playback;

  /** One transport button. */
  const button = (key, title, icon, onClick, extra = {}) => (
    <button
      type="button"
      className={
        'TimeBarButton' + (extra.active ? ' Active' : '') +
        (extra.className ? ' ' + extra.className : '')
      }
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
    className={'GlobalDatePlaysControl ' + className}
    role="group"
    aria-label={t('dashboardPage.timeSlider.playback')}
  >
    {button('first', t('dashboardPage.timeSlider.first'), <TimeFirstIcon/>, playback.first)}
    {button('previous', t('dashboardPage.timeSlider.previous'), <TimePreviousIcon/>, playback.previous)}
    {
      button(
        'play',
        isPlay ? t('dashboardPage.timeSlider.pause') : t('dashboardPage.timeSlider.play'),
        isPlay ? <TimePauseIcon/> : <TimePlayIcon/>,
        playback.toggle,
        { active: isPlay, pressed: isPlay, className: 'Play' }
      )
    }
    {
      // Stop also resets the time slider to the project's default time settings.
      button('stop', t('dashboardPage.timeSlider.stop'), <TimeStopIcon/>, () => {
        playback.stop()
        if (onReset) {
          onReset()
        }
      }, { enabled: true })
    }
    {button('next', t('dashboardPage.timeSlider.next'), <TimeNextIcon/>, playback.next)}
    {button('last', t('dashboardPage.timeSlider.last'), <TimeLastIcon/>, playback.last)}
  </div>
}
