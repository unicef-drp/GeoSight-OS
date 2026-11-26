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
 * __date__ = '26/11/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   Story Map controls, shared by the left panel and the presentation mode.
   Same button style and icons as the time slider.
   ========================================================================== */

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import {
  LayerIcon,
  ShrinkIcon,
  StoryPlayIcon,
  TimeNextIcon,
  TimePauseIcon,
  TimePlayIcon,
  TimePreviousIcon,
  TimeSettingsIcon,
  TimeStopIcon,
} from "../../../../components/Icons";
import { SPEED_OPTIONS, useStoryPlayback } from "./StoryPlayback";

interface ButtonProps {
  testId: string;
  title: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  pressed?: boolean;
  expanded?: boolean;
  className?: string;
}

/** One square button. */
export function StoryButton({
  testId,
  title,
  onClick,
  children,
  active,
  pressed,
  expanded,
  className = "",
}: ButtonProps) {
  return (
    <button
      type="button"
      className={
        "StoryButton" + (active ? " Active" : "") + " " + className
      }
      title={title}
      aria-label={title}
      aria-pressed={pressed}
      aria-expanded={expanded}
      data-testid={testId}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Previous, play/pause and next. */
export function StoryTransport({ big = false }: { big?: boolean }) {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  const playLabel = playback.autoPlay
    ? t("dashboardPage.storyMap.pause")
    : t("dashboardPage.storyMap.play");
  return (
    <div
      className="StoryTransport"
      role="group"
      aria-label={t("dashboardPage.storyMap.playback")}
    >
      <StoryButton
        testId="story-map-previous"
        title={t("dashboardPage.storyMap.previous")}
        onClick={playback.previous}
      >
        <TimePreviousIcon />
      </StoryButton>
      <StoryButton
        testId="story-map-play"
        title={playLabel}
        onClick={playback.togglePlay}
        active={playback.autoPlay}
        pressed={playback.autoPlay}
        className={big ? "Big" : ""}
      >
        {playback.autoPlay ? <TimePauseIcon /> : <TimePlayIcon />}
      </StoryButton>
      <StoryButton
        testId="story-map-stop"
        title={t("dashboardPage.storyMap.stop")}
        onClick={playback.stop}
      >
        <TimeStopIcon />
      </StoryButton>
      <StoryButton
        testId="story-map-next"
        title={t("dashboardPage.storyMap.next")}
        onClick={playback.next}
      >
        <TimeNextIcon />
      </StoryButton>
    </div>
  );
}

/** Settings button with its pop-over: time per page, widgets. */
export function StorySettings({ placement }: { placement: "below" | "above" }) {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on a click outside.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="StorySettingsWrapper" ref={ref}>
      <StoryButton
        testId="story-map-settings-button"
        title={t("dashboardPage.storyMap.settings")}
        onClick={() => setOpen(!open)}
        active={open}
        pressed={open}
        expanded={open}
      >
        <TimeSettingsIcon />
      </StoryButton>
      {open && (
        <div
          className={"StorySettings " + placement}
          role="dialog"
          aria-label={t("dashboardPage.storyMap.settings")}
          data-testid="story-map-settings"
        >
          <div className="StorySettingsTitle">
            {t("dashboardPage.storyMap.settings")}
          </div>
          <label className="StorySettingsField">
            <span>{t("dashboardPage.storyMap.timePerPage")}</span>
            <select
              value={playback.speed}
              data-testid="story-map-speed"
              onChange={(event) =>
                playback.setSpeed(parseInt(event.target.value))
              }
            >
              {SPEED_OPTIONS.map((seconds) => (
                <option key={seconds} value={seconds}>
                  {t("dashboardPage.storyMap.seconds", { count: seconds })}
                </option>
              ))}
            </select>
          </label>
          <FormControlLabel
            className="StorySettingsSwitch"
            labelPlacement="start"
            control={
              <Switch
                size="small"
                checked={playback.showWidgets}
                onChange={() => playback.setShowWidgets(!playback.showWidgets)}
              />
            }
            label={t("dashboardPage.storyMap.showWidgets")}
          />
        </div>
      )}
    </div>
  );
}

/** Enter or leave the presentation (full screen) mode. */
export function StoryPresentationButton() {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  if (!playback.presentationEnabled) {
    return null;
  }
  const title = playback.presentation
    ? t("dashboardPage.storyMap.exitPresentation")
    : t("dashboardPage.storyMap.presentation");
  return (
    <StoryButton
      testId={
        playback.presentation ? "story-map-presentation-exit" : "story-map-presentation"
      }
      title={title}
      onClick={() => playback.setPresentation(!playback.presentation)}
    >
      {playback.presentation ? <ShrinkIcon /> : <StoryPlayIcon />}
    </StoryButton>
  );
}

/** Time left on this page in autoplay: a bar from full to empty. */
export function StoryProgress() {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  if (!playback.autoPlay) {
    return null;
  }
  return (
    <div
      className="StoryProgress"
      role="progressbar"
      aria-label={t("dashboardPage.storyMap.timeLeft")}
      data-testid="story-map-progress"
    >
      {playback.countdownActive ? (
        <div
          key={playback.countdownKey}
          className="StoryProgressBar"
          style={{ animationDuration: `${playback.speed}s` }}
        />
      ) : (
        // Waiting for the map data: the bar stays full.
        <div className="StoryProgressBar Waiting" />
      )}
    </div>
  );
}

/** Show or hide the map legend (presentation mode). */
export function StoryLegendButton() {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  const title = playback.legendVisible
    ? t("dashboardPage.storyMap.hideLegend")
    : t("dashboardPage.storyMap.showLegend");
  return (
    <StoryButton
      testId="story-map-legend"
      title={title}
      onClick={playback.toggleLegend}
      active={playback.legendVisible}
      pressed={playback.legendVisible}
    >
      <LayerIcon />
    </StoryButton>
  );
}

/** Page picker: "2. Title". */
export function StoryPageSelect() {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  return (
    <select
      className="StoryPageSelect"
      aria-label={t("dashboardPage.storyMap.goToPage")}
      title={t("dashboardPage.storyMap.goToPage")}
      data-testid="story-map-page-select"
      value={playback.current}
      onChange={(event) => playback.applyStory(parseInt(event.target.value))}
    >
      {playback.stories.map((story, index) => (
        <option key={story.id} value={index}>
          {index + 1}.{" "}
          {story.name?.trim() ||
            t("dashboardPage.storyMap.pageFallbackTitle", {
              number: index + 1,
            })}
        </option>
      ))}
    </select>
  );
}
