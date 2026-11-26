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

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { fetchingData } from "../../../../Requests";
import { Actions } from "../../../../store/dashboard";
import { dataStructureToListData } from "../../../../components/SortableTreeForm/utilities";
import { DashboardStory } from "../../../../types/Story";

import "./style.scss";

interface BookmarkOption {
  id: number;
  name: string;
  [key: string]: any;
}

interface Props {
  isActive: boolean;
}

/** Time a page stays on screen in autoplay, after its data has loaded. */
export const AUTO_PLAY_DELAY = 4000;

/**
 * Story pages in the order of the structure, visible ones only.
 * Pages missing from the structure are added at the end, by their order.
 */
export function orderStories(
  stories: DashboardStory[],
  storiesStructure: any,
): DashboardStory[] {
  const ordered: DashboardStory[] = dataStructureToListData(
    stories || [],
    storiesStructure || { children: [] },
  )
    .filter((item: any) => !item.isGroup && item.data)
    .map((item: any) => item.data as DashboardStory);
  const orderedIds = ordered.map((story) => story.id);
  const missing = (stories || [])
    .filter((story) => !orderedIds.includes(story.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return ordered
    .concat(missing)
    .filter((story) => story.visible_by_default !== false);
}

/** Story Map panel in the left panel. */
export default function StoryMap({ isActive }: Props) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const selectedBookmark = useSelector((state: any) => state.selectedBookmark);
  const { slug, stories, storiesStructure, indicatorLayers, relatedTables } =
    useSelector((state: any) => state.dashboard.data);
  const indicatorsMetadata = useSelector(
    (state: any) => state.indicatorsMetadata,
  );
  const relatedTableData = useSelector((state: any) => state.relatedTableData);

  const [bookmarks, setBookmarks] = useState<BookmarkOption[] | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  // Page whose bookmark still has to be applied (bookmarks may load later).
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const orderedStories = useMemo(
    () => orderStories(stories, storiesStructure),
    [stories, storiesStructure],
  );

  // Same check as the data loading progress bar.
  const isDataLoaded = useMemo(() => {
    let total = 0;
    let currentProgress = 0;

    (indicatorLayers || []).forEach((indicatorLayer: any) => {
      const relatedTable = (relatedTables || []).find(
        (row: any) => row.id === indicatorLayer.related_tables?.[0]?.id,
      );
      if (!relatedTable) {
        return;
      }
      total += 1;
      if (!relatedTableData[relatedTable.id + "-og"]) {
        currentProgress += 1;
      }
      if (relatedTableData[relatedTable.id + "-og"]?.fetched) {
        currentProgress += 1;
      }
    });

    Object.entries(indicatorsMetadata || {}).forEach(
      ([key, value]: [string, any]) => {
        if (!key.includes("layer") && value.progress?.total_page) {
          total += value.progress.total_page;
          currentProgress += value.progress.page;
        }
      },
    );
    return total === 0 || currentProgress >= total;
  }, [indicatorLayers, indicatorsMetadata, relatedTableData, relatedTables]);

  /** Show a page and apply its bookmark, also when it is already selected. */
  const applyStory = (index: number) => {
    if (!orderedStories[index]) {
      return;
    }
    setActiveIndex(index);
    setPendingIndex(index);
  };

  // Fetch the bookmarks of the dashboard.
  useEffect(() => {
    if (!slug || slug.startsWith(":")) {
      setBookmarks([]);
      return;
    }
    fetchingData(
      `/api/dashboard/${slug}/bookmarks`,
      {},
      {},
      (data: BookmarkOption[]) => {
        setBookmarks(data || []);
      },
    );
  }, [slug]);

  // Apply the bookmark of the requested page once the bookmarks are there.
  useEffect(() => {
    if (pendingIndex === null || bookmarks === null) {
      return;
    }
    const story = orderedStories[pendingIndex];
    const bookmark = bookmarks.find((row) => row.id === story?.bookmark_id);
    if (bookmark) {
      // A new object, so the map state is applied again on re-select.
      dispatch(Actions.SelectedBookmark.change({ ...bookmark }));
    }
    setPendingIndex(null);
  }, [pendingIndex, bookmarks]);

  // Follow a story bookmark that was selected outside the story panel.
  useEffect(() => {
    if (autoPlay || !selectedBookmark?.id) {
      return;
    }
    const foundIndex = orderedStories.findIndex(
      (story) => story.bookmark_id === selectedBookmark.id,
    );
    if (foundIndex >= 0) {
      setActiveIndex(foundIndex);
    }
  }, [selectedBookmark?.id]);

  // Open the first page the first time the panel is shown.
  useEffect(() => {
    if (isActive && activeIndex === null && orderedStories.length) {
      applyStory(0);
    }
  }, [isActive, orderedStories.length]);

  // Stop autoplay when the panel is closed.
  useEffect(() => {
    if (!isActive) {
      setAutoPlay(false);
    }
  }, [isActive]);

  // Autoplay: go to the next page when the data of this one has loaded.
  useEffect(() => {
    if (
      !autoPlay ||
      activeIndex === null ||
      pendingIndex !== null ||
      !isDataLoaded ||
      orderedStories.length < 2
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      applyStory((activeIndex + 1) % orderedStories.length);
    }, AUTO_PLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [
    autoPlay,
    activeIndex,
    pendingIndex,
    isDataLoaded,
    orderedStories.length,
  ]);

  if (!orderedStories.length) {
    return (
      <div className="StoryMapPanel Empty">
        {t("dashboardPage.storyMap.empty")}
      </div>
    );
  }

  const pageTitle = (story: DashboardStory, index: number) =>
    story.name?.trim() ||
    t("dashboardPage.storyMap.pageFallbackTitle", { number: index + 1 });
  const current = activeIndex !== null ? activeIndex : 0;
  const total = orderedStories.length;
  const playLabel = autoPlay
    ? t("dashboardPage.storyMap.pause")
    : t("dashboardPage.storyMap.play");

  return (
    <div className="StoryMapPanel" data-testid="story-map-panel">
      <div className="StoryMapControls">
        <button
          type="button"
          data-testid="story-map-previous"
          aria-label={t("dashboardPage.storyMap.previous")}
          title={t("dashboardPage.storyMap.previous")}
          onClick={() => {
            setAutoPlay(false);
            applyStory(
              activeIndex === null ? 0 : (current - 1 + total) % total,
            );
          }}
        >
          <SkipPreviousIcon />
        </button>
        <button
          type="button"
          data-testid="story-map-play"
          aria-label={playLabel}
          title={playLabel}
          aria-pressed={autoPlay}
          onClick={() => {
            if (activeIndex === null) {
              applyStory(0);
            }
            setAutoPlay(!autoPlay);
          }}
        >
          {autoPlay ? <PauseIcon /> : <PlayArrowIcon />}
        </button>
        <button
          type="button"
          data-testid="story-map-next"
          aria-label={t("dashboardPage.storyMap.next")}
          title={t("dashboardPage.storyMap.next")}
          onClick={() => {
            setAutoPlay(false);
            applyStory(activeIndex === null ? 0 : (current + 1) % total);
          }}
        >
          <SkipNextIcon />
        </button>
        <div className="StoryMapCounter" data-testid="story-map-counter">
          {t("dashboardPage.storyMap.counter", {
            current: current + 1,
            total: total,
          })}
        </div>
      </div>
      {autoPlay && !isDataLoaded ? (
        <div className="StoryMapStatus">
          {t("dashboardPage.storyMap.waitingForData")}
        </div>
      ) : null}
      <div className="StoryMapList">
        {orderedStories.map((story, index) => (
          <div
            key={story.id}
            role="button"
            tabIndex={0}
            data-testid="story-map-page"
            aria-current={index === activeIndex ? "step" : undefined}
            className={`StoryMapItem ${index === activeIndex ? "Active" : ""}`}
            onClick={() => {
              setAutoPlay(false);
              applyStory(index);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setAutoPlay(false);
                applyStory(index);
              }
            }}
          >
            {story.icon ? (
              <img src={story.icon} alt="" className="StoryMapItemImage" />
            ) : null}
            <div className="StoryMapItemContent">
              <div className="StoryMapItemTitle">{pageTitle(story, index)}</div>
              {story.description ? (
                <div className="StoryMapItemDescription">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {story.description}
                  </Markdown>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
