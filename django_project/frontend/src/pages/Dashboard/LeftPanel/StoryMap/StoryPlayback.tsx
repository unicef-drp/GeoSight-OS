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
   Story Map playback: one state for the left panel and the cinematic mode.
   ========================================================================== */

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchingData } from "../../../../Requests";
import { Actions } from "../../../../store/dashboard";
import { dataStructureToListData } from "../../../../components/SortableTreeForm/utilities";
import { DashboardStory } from "../../../../types/Story";

interface BookmarkOption {
  id: number;
  name: string;

  [key: string]: any;
}

/** Seconds a page stays on screen in autoplay (after its data loaded). */
export const SPEED_OPTIONS = [3, 5, 8, 12, 20];
export const DEFAULT_SPEED = 5;
const SETTINGS_KEY = "GeoSight.StoryMap.settings";

export interface StoryPlayback {
  enabled: boolean;
  /** The project shows the cinematic mode button. */
  cinematicEnabled: boolean;
  /** Goes up on every page change (play, next, previous, page pick). */
  navigation: number;
  stories: DashboardStory[];
  activeIndex: number | null;
  current: number;
  total: number;
  autoPlay: boolean;
  isDataLoaded: boolean;
  speed: number;
  showWidgets: boolean;
  cinematic: boolean;
  /** Autoplay timer of the current page is running (data loaded). */
  countdownActive: boolean;
  /** Changes when a new countdown starts (restarts the progress bar). */
  countdownKey: string;
  /** Legend shown in the cinematic mode. */
  legendVisible: boolean;
  applyStory: (index: number) => void;
  start: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  togglePlay: () => void;
  toggleLegend: () => void;
  setSpeed: (speed: number) => void;
  setShowWidgets: (show: boolean) => void;
  setCinematic: (on: boolean) => void;
}

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

/** Viewer settings kept in this browser only (speed, widgets). */
function readSettings(): { speed: number; showWidgets: boolean } {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      speed: SPEED_OPTIONS.includes(saved.speed) ? saved.speed : DEFAULT_SPEED,
      showWidgets: saved.showWidgets !== false,
    };
  } catch (e) {
    return { speed: DEFAULT_SPEED, showWidgets: true };
  }
}

function saveSettings(settings: { speed: number; showWidgets: boolean }) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // Storage blocked: the settings just are not remembered.
  }
}

/** Ask the browser for full screen; the mode also works without it. */
function requestFullScreen() {
  try {
    const element = document.documentElement;
    if (!document.fullscreenElement && element.requestFullscreen) {
      element.requestFullscreen().catch(() => {});
    }
  } catch (e) {
    // Not supported (e.g. iOS Safari): the page layout still changes.
  }
}

function exitFullScreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  } catch (e) {
    // Nothing to exit.
  }
}

const StoryPlaybackContext = createContext<StoryPlayback | null>(null);

const noop = () => {};

/** Outside a dashboard page (no provider): no story. */
const NO_STORY: StoryPlayback = {
  enabled: false,
  cinematicEnabled: false,
  navigation: 0,
  stories: [],
  activeIndex: null,
  current: 0,
  total: 0,
  autoPlay: false,
  isDataLoaded: true,
  speed: DEFAULT_SPEED,
  showWidgets: true,
  cinematic: false,
  countdownActive: false,
  countdownKey: "",
  legendVisible: true,
  applyStory: noop,
  start: noop,
  next: noop,
  previous: noop,
  stop: noop,
  togglePlay: noop,
  toggleLegend: noop,
  setSpeed: noop,
  setShowWidgets: noop,
  setCinematic: noop,
};

/** Story playback of the dashboard. */
export function useStoryPlayback(): StoryPlayback {
  return useContext(StoryPlaybackContext) || NO_STORY;
}

/** Provides the story playback to the left panel and the cinematic mode. */
export function StoryPlaybackProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const selectedBookmark = useSelector((state: any) => state.selectedBookmark);
  const {
    slug,
    stories,
    storiesStructure,
    story_map_enabled,
    story_map_cinematic,
    indicatorLayers,
    relatedTables,
  } = useSelector((state: any) => state.dashboard.data);
  const indicatorsMetadata = useSelector(
    (state: any) => state.indicatorsMetadata,
  );
  const relatedTableData = useSelector((state: any) => state.relatedTableData);

  const [bookmarks, setBookmarks] = useState<BookmarkOption[] | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Page whose bookmark still has to be applied (bookmarks may load later).
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [settings, setSettings] = useState(readSettings);
  const [cinematic, setCinematicState] = useState(false);
  const [navigation, setNavigation] = useState(0);
  // Legend in the cinematic mode: on for desktop, off on phones (small map).
  const [legendVisible, setLegendVisible] = useState(
    () =>
      !(
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(max-width: 1000px)").matches
      ),
  );

  const enabled = !!story_map_enabled;
  const orderedStories = useMemo(
    () => orderStories(stories, storiesStructure),
    [stories, storiesStructure],
  );
  const total = orderedStories.length;
  const current = activeIndex !== null ? activeIndex : 0;

  // Same check as the data loading progress bar.
  const isDataLoaded = useMemo(() => {
    let all = 0;
    let done = 0;
    (indicatorLayers || []).forEach((indicatorLayer: any) => {
      const relatedTable = (relatedTables || []).find(
        (row: any) => row.id === indicatorLayer.related_tables?.[0]?.id,
      );
      if (!relatedTable) {
        return;
      }
      all += 1;
      if (!relatedTableData[relatedTable.id + "-og"]) {
        done += 1;
      }
      if (relatedTableData[relatedTable.id + "-og"]?.fetched) {
        done += 1;
      }
    });
    Object.entries(indicatorsMetadata || {}).forEach(
      ([key, value]: [string, any]) => {
        if (!key.includes("layer") && value.progress?.total_page) {
          all += value.progress.total_page;
          done += value.progress.page;
        }
      },
    );
    return all === 0 || done >= all;
  }, [indicatorLayers, indicatorsMetadata, relatedTableData, relatedTables]);

  /** Show a page and apply its bookmark, also when it is already selected. */
  const applyStory = (index: number) => {
    if (!orderedStories[index]) {
      return;
    }
    setActiveIndex(index);
    setPendingIndex(index);
    setNavigation((count) => count + 1);
  };

  // Bookmarks of the dashboard.
  useEffect(() => {
    if (!enabled || !slug || slug.startsWith(":")) {
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
  }, [slug, enabled]);

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

  // Follow a story bookmark that was selected outside the story.
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

  // Autoplay: next page when the data of this one has loaded.
  const countdownActive =
    autoPlay &&
    activeIndex !== null &&
    pendingIndex === null &&
    isDataLoaded &&
    total >= 2;
  useEffect(() => {
    if (!countdownActive || activeIndex === null) {
      return;
    }
    const timer = window.setTimeout(() => {
      applyStory((activeIndex + 1) % total);
    }, settings.speed * 1000);
    return () => window.clearTimeout(timer);
  }, [countdownActive, activeIndex, navigation, total, settings]);

  // Cinematic mode: page class, full screen, and the map size.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("StoryCinematic", cinematic);
    html.classList.toggle(
      "StoryCinematicWidgets",
      cinematic && settings.showWidgets,
    );
    html.classList.toggle("StoryLegendOn", cinematic && legendVisible);
    html.classList.toggle("StoryLegendOff", cinematic && !legendVisible);
    // The map container changed size.
    window.setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
  }, [cinematic, settings.showWidgets, legendVisible]);

  // Leaving browser full screen (Esc) also leaves the cinematic mode.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) {
        setCinematicState(false);
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.documentElement.classList.remove(
        "StoryCinematic",
        "StoryCinematicWidgets",
        "StoryLegendOn",
        "StoryLegendOff",
      );
    };
  }, []);

  const updateSettings = (fields: Partial<typeof settings>) => {
    setSettings((old) => {
      const updated = { ...old, ...fields };
      saveSettings(updated);
      return updated;
    });
  };

  const value: StoryPlayback = {
    enabled,
    cinematicEnabled: enabled && !!story_map_cinematic,
    navigation,
    stories: orderedStories,
    activeIndex,
    current,
    total,
    autoPlay,
    isDataLoaded,
    speed: settings.speed,
    showWidgets: settings.showWidgets,
    cinematic,
    countdownActive,
    countdownKey: `${navigation}-${settings.speed}`,
    legendVisible,
    applyStory,
    start: () => {
      if (activeIndex === null && total) {
        applyStory(0);
      }
    },
    next: () => {
      setAutoPlay(false);
      applyStory(activeIndex === null ? 0 : (current + 1) % total);
    },
    previous: () => {
      setAutoPlay(false);
      applyStory(activeIndex === null ? 0 : (current - 1 + total) % total);
    },
    stop: () => {
      setAutoPlay(false);
      applyStory(0);
    },
    toggleLegend: () => setLegendVisible(!legendVisible),
    togglePlay: () => {
      if (activeIndex === null) {
        applyStory(0);
      }
      setAutoPlay(!autoPlay);
    },
    setSpeed: (speed: number) => updateSettings({ speed }),
    setShowWidgets: (showWidgets: boolean) => updateSettings({ showWidgets }),
    setCinematic: (on: boolean) => {
      if (on) {
        if (activeIndex === null && total) {
          applyStory(0);
        }
        requestFullScreen();
      } else {
        exitFullScreen();
      }
      setCinematicState(on);
    },
  };

  return (
    <StoryPlaybackContext.Provider value={value}>
      {children}
    </StoryPlaybackContext.Provider>
  );
}
