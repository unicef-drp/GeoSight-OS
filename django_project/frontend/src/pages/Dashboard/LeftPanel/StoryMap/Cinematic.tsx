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
   Cinematic mode: full screen map with the page title, its description in a
   floating card and the playback bar. Header, map toolbar and left panel
   are hidden (html.StoryCinematic in style.scss); widgets are optional.
   ========================================================================== */

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useStoryPlayback } from "./StoryPlayback";
import {
  StoryCinematicButton,
  StoryLegendButton,
  StoryPageSelect,
  StoryProgress,
  StorySettings,
  StoryTransport,
} from "./Controls";
import { useStoryTitle } from "./index";

import "./style.scss";

/** Cinematic mode overlay; renders only while the mode is on. */
export default function StoryCinematic() {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  const pageTitle = useStoryTitle();

  // Keyboard: arrows for pages, space for play/pause, Esc to leave. Caught
  // before the map sees them (capture phase), so the arrows don't pan it.
  useEffect(() => {
    if (!playback.cinematic) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(target?.tagName)) {
        return;
      }
      let handled = true;
      if (event.key === "ArrowRight") {
        playback.next();
      } else if (event.key === "ArrowLeft") {
        playback.previous();
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        // No map panning in the cinematic mode.
      } else if (event.key === " " && target?.tagName !== "BUTTON") {
        playback.togglePlay();
      } else if (event.key === "Escape") {
        playback.setCinematic(false);
      } else {
        handled = false;
      }
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [playback]);

  if (!playback.cinematic || !playback.total) {
    return null;
  }
  const story = playback.stories[playback.current];

  return createPortal(
    <div className="StoryCinematicOverlay" data-testid="story-map-cinematic-view">
      <h1 className="StoryCinematicTitle" data-testid="story-map-cinematic-title">
        {pageTitle(story, playback.current)}
      </h1>
      {story?.description || story?.icon ? (
        <aside
          className="StoryCinematicCard"
          data-testid="story-map-cinematic-card"
        >
          {story.icon ? (
            <img src={story.icon} alt="" className="StoryCinematicImage" />
          ) : null}
          {story.description ? (
            <div className="StoryCinematicDescription">
              <Markdown remarkPlugins={[remarkGfm]}>
                {story.description}
              </Markdown>
            </div>
          ) : null}
        </aside>
      ) : null}
      <div
        className="StoryCinematicBar"
        role="toolbar"
        aria-label={t("dashboardPage.storyMap.playback")}
      >
        <StoryProgress />
        <StoryTransport big />
        <div className="StoryCinematicRule" />
        <StoryPageSelect />
        <div className="StoryMapCounter">
          {t("dashboardPage.storyMap.counter", {
            current: playback.current + 1,
            total: playback.total,
          })}
        </div>
        <div className="StoryCinematicRule" />
        <StoryLegendButton />
        <StorySettings placement="above" />
        <StoryCinematicButton />
      </div>
      {playback.autoPlay && !playback.isDataLoaded ? (
        <div className="StoryCinematicStatus">
          {t("dashboardPage.storyMap.waitingForData")}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
