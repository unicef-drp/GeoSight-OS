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
 * __date__ = '23/11/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   Mobile time slider: a collapsed card over the map, expandable to a
   bottom sheet with every time control.
   ========================================================================== */

import React from "react";
import { useTranslation } from "react-i18next";
import PlayControl from "../PlayControl";
import TimeTrack from "../TimeTrack";
import TimeSettings from "../TimeSettings";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TimeNextIcon,
  TimePauseIcon,
  TimePlayIcon,
  TimePreviousIcon
} from "../../../../../components/Icons";

import "./style.scss";

/**
 * Mobile time slider.
 * @param {object} playback From usePlayback.
 * @param {object} track Props for TimeTrack.
 * @param {object} settings Props for TimeSettings.
 */
export default function MobileTime(
  {
    playback,
    onReset,
    label,
    activeWindow,
    interval,
    intervalOptions,
    onChangeInterval,
    track,
    settings,
    sheetOpen,
    setSheetOpen,
  }
) {
  const { t } = useTranslation();
  const intervalName =
    intervalOptions.find((option) => option.value === interval)?.name ||
    interval;
  const position =
    playback.index >= 0
      ? t("dashboardPage.timeSlider.position", {
        current: playback.index + 1,
        total: playback.count,
      })
      : "";
  const playTitle = playback.isPlay
    ? t("dashboardPage.timeSlider.pause")
    : t("dashboardPage.timeSlider.play");

  if (!sheetOpen) {
    return (
      <div className="TimeCard" data-testid="time-slider-card">
        <div className="TimeCardRow">
          <button
            type="button"
            className={"TimeBarButton Large" + (playback.isPlay ? " Active" : "")}
            title={playTitle}
            aria-label={playTitle}
            aria-pressed={playback.isPlay}
            disabled={playback.disabled}
            onClick={playback.toggle}
            data-testid="time-slider-play"
          >
            {playback.isPlay ? <TimePauseIcon /> : <TimePlayIcon />}
          </button>
          <button
            type="button"
            className="TimeBarButton Large Plain"
            title={t("dashboardPage.timeSlider.previous")}
            aria-label={t("dashboardPage.timeSlider.previous")}
            disabled={playback.disabled}
            onClick={playback.previous}
            data-testid="time-slider-previous"
          >
            <TimePreviousIcon />
          </button>
          <div
            className="TimeCardLabel"
            title={activeWindow}
            data-testid="time-slider-date"
          >
            <div className="TimeCardPeriod">{label}</div>
            <div className="TimeCardMeta">
              {position ? intervalName + " · " + position : intervalName}
            </div>
          </div>
          <button
            type="button"
            className="TimeBarButton Large Plain"
            title={t("dashboardPage.timeSlider.next")}
            aria-label={t("dashboardPage.timeSlider.next")}
            disabled={playback.disabled}
            onClick={playback.next}
            data-testid="time-slider-next"
          >
            <TimeNextIcon />
          </button>
          <button
            type="button"
            className="TimeBarButton Large"
            title={t("dashboardPage.timeSlider.expand")}
            aria-label={t("dashboardPage.timeSlider.expand")}
            aria-expanded={false}
            onClick={() => setSheetOpen(true)}
            data-testid="time-slider-expand"
          >
            <ChevronUpIcon />
          </button>
        </div>
        <TimeTrack {...track} mini={true} />
      </div>
    );
  }

  return (
    <div
      className="TimeSheet"
      role="dialog"
      aria-label={t("dashboardPage.timeSlider.title")}
      data-testid="time-slider-sheet"
    >
      <div className="TimeSheetHeader">
        <span>{t("dashboardPage.timeSlider.title")}</span>
        <button
          type="button"
          className="TimeBarButton Large Plain"
          title={t("dashboardPage.timeSlider.collapse")}
          aria-label={t("dashboardPage.timeSlider.collapse")}
          aria-expanded={true}
          onClick={() => setSheetOpen(false)}
          data-testid="time-slider-collapse"
        >
          <ChevronDownIcon />
        </button>
      </div>
      <div className="TimeSheetPeriod" data-testid="time-slider-date">
        <div className="TimeSheetPeriodLabel">{label}</div>
        <div className="TimeSheetPeriodWindow">
          {position ? activeWindow + " · " + position : activeWindow}
        </div>
      </div>
      <TimeTrack {...track} />
      <PlayControl playback={playback} onReset={onReset} className="Sheet" />
      <div
        className="TimeSheetIntervals"
        role="group"
        aria-label={t("dashboardPage.timeSlider.interval")}
      >
        {intervalOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={option.value === interval ? "Active" : ""}
            aria-pressed={option.value === interval}
            onClick={() => onChangeInterval(option.value)}
            data-testid={"time-slider-interval-" + option.value.toLowerCase()}
          >
            {option.name}
          </button>
        ))}
      </div>
      <TimeSettings {...settings} inline={true} />
    </div>
  );
}
