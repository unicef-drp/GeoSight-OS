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

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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

// The widget list (its scroll container) in the right panel.
const WIDGET_COLUMN = ".DashboardMiddlePanel .RightContent section.right";
const PHONE = "(max-width: 1000px)";

/** Cinematic mode overlay; renders only while the mode is on. */
export default function StoryCinematic() {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  const pageTitle = useStoryTitle();
  const cardRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  // With widgets: the card sits on top of the widget column, same width.
  const [column, setColumn] = useState<{ left: number; width: number } | null>(
    null,
  );
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const docked = playback.cinematic && playback.showWidgets && !!column;

  // A new page starts with its description collapsed.
  useEffect(() => {
    setExpanded(false);
  }, [playback.navigation]);

  // Place the card over the widget column and move the widgets below it.
  useLayoutEffect(() => {
    const html = document.documentElement;
    if (!playback.cinematic || !playback.showWidgets) {
      setColumn(null);
      html.style.removeProperty("--story-card-height");
      return;
    }
    const measure = () => {
      const target = document.querySelector(WIDGET_COLUMN);
      const phone = window.matchMedia && window.matchMedia(PHONE).matches;
      if (!target || phone) {
        setColumn(null);
        html.style.removeProperty("--story-card-height");
        return;
      }
      const rect = target.getBoundingClientRect();
      setColumn((old) =>
        old && old.left === rect.left && old.width === rect.width
          ? old
          : { left: rect.left, width: rect.width },
      );
      const height = cardRef.current?.offsetHeight || 0;
      html.style.setProperty("--story-card-height", `${height}px`);
      const text = textRef.current;
      setOverflowing(!!text && text.scrollHeight > text.clientHeight + 1);
    };
    measure();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (observer && cardRef.current) {
      observer.observe(cardRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      html.style.removeProperty("--story-card-height");
    };
  }, [
    playback.cinematic,
    playback.showWidgets,
    playback.current,
    expanded,
    !!cardRef.current,
  ]);

  // Without widgets: still tell whether the text is cut off.
  useLayoutEffect(() => {
    const text = textRef.current;
    setOverflowing(!!text && text.scrollHeight > text.clientHeight + 1);
  }, [playback.current, playback.cinematic, expanded, docked]);

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
          ref={cardRef}
          className={
            "StoryCinematicCard" +
            (docked ? " Docked" : "") +
            (expanded ? " Expanded" : "")
          }
          style={
            docked && column
              ? { left: column.left, width: column.width, right: "auto" }
              : undefined
          }
          data-testid="story-map-cinematic-card"
        >
          {story.icon ? (
            <img src={story.icon} alt="" className="StoryCinematicImage" />
          ) : null}
          {story.description ? (
            <>
              <div
                ref={textRef}
                className={
                  "StoryCinematicDescription" + (expanded ? "" : " Collapsed")
                }
              >
                <Markdown remarkPlugins={[remarkGfm]}>
                  {story.description}
                </Markdown>
              </div>
              {overflowing || expanded ? (
                <button
                  type="button"
                  className="StoryCinematicMore"
                  data-testid="story-map-cinematic-more"
                  aria-expanded={expanded}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded
                    ? t("dashboardPage.storyMap.less")
                    : t("dashboardPage.storyMap.more")}
                </button>
              ) : null}
            </>
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
