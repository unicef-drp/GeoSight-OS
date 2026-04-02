/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
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

const AUTO_PLAY_DELAY = 4000;

const getStoryTitle = (story: DashboardStory, index: number) => {
  return (
    story.name?.trim() ||
    story.title?.trim() ||
    story.label?.trim() ||
    `Story ${index + 1}`
  );
};

export default function StoryMap({ isActive }: Props) {
  const dispatch = useDispatch();
  const selectedBookmark = useSelector((state: any) => state.selectedBookmark);
  const {
    slug,
    stories,
    storiesStructure,
    indicatorLayers,
    relatedTables,
  } = useSelector((state: any) => state.dashboard.data);
  const indicatorsMetadata = useSelector((state: any) => state.indicatorsMetadata);
  const relatedTableData = useSelector((state: any) => state.relatedTableData);

  const [bookmarks, setBookmarks] = useState<BookmarkOption[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);

  const orderedStories = useMemo(() => {
    return dataStructureToListData(stories || [], storiesStructure || { children: [] })
      .filter((item: any) => !item.isGroup && item.data?.visible_by_default !== false)
      .map((item: any) => item.data as DashboardStory);
  }, [stories, storiesStructure]);

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

    Object.entries(indicatorsMetadata || {}).forEach(([key, value]: [string, any]) => {
      if (!key.includes("layer") && value.progress?.total_page) {
        total += value.progress.total_page;
        currentProgress += value.progress.page;
      }
    });

    if (total === 0) {
      return true;
    }
    return currentProgress * 100 >= total * 100;
  }, [indicatorLayers, indicatorsMetadata, relatedTableData, relatedTables]);

  const activateBookmark = (story: DashboardStory | undefined) => {
    if (!story?.bookmark_id) {
      return;
    }
    const bookmark = bookmarks.find((row) => row.id === story.bookmark_id);
    if (bookmark && bookmark.id !== selectedBookmark?.id) {
      dispatch(Actions.SelectedBookmark.change(bookmark));
    }
  };

  const applyStory = (index: number) => {
    const story = orderedStories[index];
    if (!story) {
      return;
    }
    setActiveIndex(index);
    activateBookmark(story);
  };

  useEffect(() => {
    if (!slug || slug.startsWith(":")) {
      setBookmarks([]);
      return;
    }
    fetchingData(`/api/dashboard/${slug}/bookmarks`, {}, {}, (data: BookmarkOption[]) => {
      setBookmarks(data);
    });
  }, [slug]);

  useEffect(() => {
    if (autoPlay) {
      return;
    }
    const foundIndex = orderedStories.findIndex(
      (story) => story.bookmark_id && story.bookmark_id === selectedBookmark?.id,
    );
    if (foundIndex >= 0) {
      setActiveIndex(foundIndex);
    }
  }, [autoPlay, selectedBookmark?.id, orderedStories]);

  useEffect(() => {
    if (isActive && activeIndex === null && orderedStories.length) {
      applyStory(0);
    }
  }, [isActive, orderedStories.length]);

  useEffect(() => {
    if (activeIndex !== null) {
      activateBookmark(orderedStories[activeIndex]);
    }
  }, [activeIndex, bookmarks, orderedStories, selectedBookmark?.id]);

  useEffect(() => {
    if (!autoPlay || activeIndex === null || orderedStories.length < 2) {
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveIndex((currentIndex) => {
        if (currentIndex === null) {
          return 0;
        }
        return (currentIndex + 1) % orderedStories.length;
      });
    }, AUTO_PLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [autoPlay, activeIndex, orderedStories.length]);

  if (!orderedStories.length) {
    return <div className="StoryMapPanel Empty">No Story Map pages configured yet.</div>;
  }

  return (
    <div className="StoryMapPanel">
      <div className="StoryMapControls">
        <button
          type="button"
          onClick={() => {
            if (activeIndex === null) {
              applyStory(0);
            } else {
              applyStory(
                activeIndex === 0 ? orderedStories.length - 1 : activeIndex - 1,
              );
            }
          }}
        >
          <SkipPreviousIcon />
        </button>
        <button
          type="button"
          onClick={() => {
            if (activeIndex === null) {
              applyStory(0);
              setAutoPlay(true);
            } else {
              setAutoPlay(!autoPlay);
            }
          }}
        >
          {autoPlay ? <PauseIcon /> : <PlayArrowIcon />}
        </button>
        <button
          type="button"
          onClick={() => {
            if (activeIndex === null) {
              applyStory(0);
            } else {
              applyStory((activeIndex + 1) % orderedStories.length);
            }
          }}
        >
          <SkipNextIcon />
        </button>
      </div>
      {!isDataLoaded ? (
        <div className="StoryMapStatus">Waiting for map data to finish loading...</div>
      ) : null}
      <div className="StoryMapList">
        {orderedStories.map((story, index) => (
          <button
            key={story.id}
            type="button"
            className={`StoryMapItem ${index === activeIndex ? "Active" : ""}`}
            onClick={() => {
              setAutoPlay(false);
              applyStory(index);
            }}
          >
            {story.icon ? (
              <img
                src={story.icon}
                alt={getStoryTitle(story, index)}
                className="StoryMapItemImage"
              />
            ) : null}
            <div className="StoryMapItemContent">
              <div className="StoryMapItemTitle">{getStoryTitle(story, index)}</div>
              {story.description ? (
                <div className="StoryMapItemDescription">
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {story.description}
                  </Markdown>
                </div>
              ) : null}
            </div>
          </button>
        ))}
      </div>
      <div className="StoryMapCounter">
        {(activeIndex !== null ? activeIndex : 0) + 1} / {orderedStories.length}
      </div>
    </div>
  );
}
