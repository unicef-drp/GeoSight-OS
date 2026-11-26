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
 * __author__ = 'ishaan.jain@emory.edu'
 * __date__ = '15/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { DashboardStory } from "../../../../types/Story";
import { ChevronDownIcon, ChevronUpIcon } from "../../../../components/Icons";
import { useStoryPlayback } from "./StoryPlayback";
import {
  StoryCinematicButton,
  StorySettings,
  StoryTransport,
} from "./Controls";

import "./style.scss";

/** Title of a page, or "Page n". */
export function useStoryTitle() {
  const { t } = useTranslation();
  return (story: DashboardStory | undefined, index: number) =>
    story?.name?.trim() ||
    t("dashboardPage.storyMap.pageFallbackTitle", { number: index + 1 });
}

/** Story Map panel (left panel tab; full screen tab on phones). */
export default function StoryMap() {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  const pageTitle = useStoryTitle();
  const ref = useRef<HTMLDivElement>(null);
  // Pages showing their thumbnail and description.
  const [expanded, setExpanded] = useState<number[]>([]);

  // Every page change (play, next, previous, page pick) shows only the
  // current page; the others collapse to their title.
  useEffect(() => {
    const story = playback.stories[playback.current];
    if (playback.navigation && story) {
      setExpanded([story.id]);
    }
  }, [playback.navigation]);

  const toggle = (id: number) => {
    setExpanded((ids) =>
      ids.includes(id) ? ids.filter((row) => row !== id) : ids.concat(id),
    );
  };

  // Open the first page when the panel is shown (desktop tab or phone panel).
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        playback.start();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [playback.total, playback.activeIndex === null]);

  if (!playback.total) {
    return (
      <div className="StoryMapPanel Empty" ref={ref}>
        <div className="StoryMapEmpty">
          {t("dashboardPage.storyMap.empty")}
        </div>
      </div>
    );
  }

  return (
    <div className="StoryMapPanel" data-testid="story-map-panel" ref={ref}>
      <div className="StoryMapControls">
        <StoryTransport />
        <StoryCinematicButton />
        <div className="StoryMapCounter" data-testid="story-map-counter">
          {t("dashboardPage.storyMap.counter", {
            current: playback.current + 1,
            total: playback.total,
          })}
        </div>
        <StorySettings placement="below" />
      </div>
      {playback.autoPlay && !playback.isDataLoaded ? (
        <div className="StoryMapStatus">
          {t("dashboardPage.storyMap.waitingForData")}
        </div>
      ) : null}
      <div className="StoryMapList">
        {playback.stories.map((story, index) => {
          const active = index === playback.activeIndex;
          const isOpen = expanded.includes(story.id);
          const title = pageTitle(story, index);
          const hasContent = !!(story.icon || story.description);
          return (
            <div
              key={story.id}
              data-testid="story-map-page"
              aria-current={active ? "step" : undefined}
              className={
                "StoryMapItem" +
                (active ? " Active" : "") +
                (isOpen ? " Expanded" : "")
              }
              onClick={() => playback.applyStory(index)}
            >
              <div
                className="StoryMapItemHeader"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    playback.applyStory(index);
                  }
                }}
              >
                <span className="StoryMapItemTitle">{title}</span>
                {hasContent ? (
                  <button
                    type="button"
                    className="StoryMapItemToggle"
                    data-testid="story-map-page-toggle"
                    aria-expanded={isOpen}
                    title={
                      isOpen
                        ? t("dashboardPage.storyMap.collapse")
                        : t("dashboardPage.storyMap.expand")
                    }
                    aria-label={
                      isOpen
                        ? t("dashboardPage.storyMap.collapse")
                        : t("dashboardPage.storyMap.expand")
                    }
                    onClick={(event) => {
                      // Only open or close; don't go to the page.
                      event.stopPropagation();
                      toggle(story.id);
                    }}
                  >
                    {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </button>
                ) : null}
              </div>
              {isOpen && story.icon ? (
                <img src={story.icon} alt="" className="StoryMapItemImage" />
              ) : null}
              {isOpen && story.description ? (
                <div
                  className="StoryMapItemDescription"
                  data-testid="story-map-page-description"
                >
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {story.description}
                  </Markdown>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
