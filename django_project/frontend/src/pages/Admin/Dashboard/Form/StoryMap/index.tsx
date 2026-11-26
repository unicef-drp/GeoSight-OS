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

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  headingsPlugin,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

import { fetchingData } from "../../../../../Requests";
import { Actions } from "../../../../../store/dashboard";
import ListForm from "../ListForm";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "../../../../../components/Modal";
import {
  SaveButton,
  ThemeButton,
} from "../../../../../components/Elements/Button";
import { ImageInput } from "../../../../../components/Input/ImageInput";
import { DashboardStory } from "../../../../../types/Story";

import "./style.scss";

interface BookmarkOption {
  id: number;
  name: string;
}

interface StoryEditorProps {
  open: boolean;
  bookmarks: BookmarkOption[];
  story: DashboardStory | null;
  setOpen: (open: boolean) => void;
  onApply: (story: DashboardStory) => void;
}

const Separator = () => (
  <div
    data-orientation="vertical"
    aria-orientation="vertical"
    role="separator"
  />
);

/** Editor of one story page. */
const StoryEditor = ({
  open,
  bookmarks,
  story,
  setOpen,
  onApply,
}: StoryEditorProps) => {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardStory | null>(story);
  // MDXEditor pop-ups (block type, links) open inside the modal, not behind it.
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setData(story);
  }, [story]);

  /** Change some fields; always from the latest data (no stale closures). */
  const change = useCallback((fields: Partial<DashboardStory>) => {
    setData((current) => (current ? { ...current, ...fields } : current));
  }, []);

  if (!data) {
    return null;
  }

  const close = () => setOpen(false);
  return (
    <Modal className="StoryMapModal" open={open} onClosed={close}>
      <ModalHeader onClosed={close}>
        {data.id
          ? t("admin.dashboard.storyMap.editPage", {
              name: data.name || t("admin.dashboard.storyMap.page"),
            })
          : t("admin.dashboard.storyMap.addPage")}
      </ModalHeader>
      <ModalContent>
        <div className="StoryEditor" data-testid="story-editor">
          <div className="StoryEditorMain">
            <TextField
              fullWidth
              label={t("admin.dashboard.storyMap.title")}
              value={data.name || ""}
              onChange={(event) => change({ name: event.target.value })}
            />
            <div className="StoryEditorField">
              <label className="form-label">
                {t("admin.dashboard.storyMap.description")}
              </label>
              <Suspense
                fallback={<div>{t("admin.dashboard.storyMap.loading")}</div>}
              >
                <MDXEditor
                  // Remount per page: `markdown` is only read on mount.
                  key={story?.id || "new"}
                  className="StoryEditorDescription"
                  markdown={data.description || ""}
                  overlayContainer={overlay}
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    tablePlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <UndoRedo />
                          <Separator />
                          {/* No underline: it is stored as raw HTML, which
                              the story panel does not render. */}
                          <BoldItalicUnderlineToggles
                            options={["Bold", "Italic"]}
                          />
                          <CodeToggle />
                          <Separator />
                          <ListsToggle />
                          <Separator />
                          <BlockTypeSelect />
                          <Separator />
                          <CreateLink />
                          <Separator />
                          <InsertTable />
                          <InsertThematicBreak />
                        </>
                      ),
                    }),
                  ]}
                  onChange={(value) => change({ description: value })}
                />
              </Suspense>
            </div>
          </div>
          <div className="StoryEditorSide">
            <div className="StoryEditorField">
              <label className="form-label">
                {t("admin.dashboard.storyMap.thumbnail")}
              </label>
              <ImageInput
                id={`StoryMapIcon-${data.id || "new"}`}
                name={`story_icon_input_${data.id || "new"}`}
                image={data.icon}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const file = event?.target?.files?.[0] || null;
                  change({
                    iconFile: file,
                    icon: file
                      ? URL.createObjectURL(file)
                      : story?.icon || null,
                  });
                }}
              />
            </div>
            <div className="StoryEditorField">
              <label className="form-label" htmlFor="StoryEditorBookmark">
                {t("admin.dashboard.storyMap.bookmark")}
              </label>
              <select
                id="StoryEditorBookmark"
                className="form-control"
                // 0 is the "Default" view, a real choice.
                value={data.bookmark_id ?? ""}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  const value = event.target.value;
                  change({
                    bookmark_id: value !== "" ? parseInt(value) : null,
                  });
                }}
              >
                <option value="">
                  {t("admin.dashboard.storyMap.noBookmarkSelected")}
                </option>
                {bookmarks.map((bookmark) => (
                  <option key={bookmark.id} value={bookmark.id}>
                    {bookmark.name}
                  </option>
                ))}
              </select>
              {!bookmarks.length ? (
                <div className="form-helptext">
                  {t("admin.dashboard.storyMap.noBookmarksHelp")}
                </div>
              ) : null}
            </div>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.visible_by_default !== false}
                    onChange={(event) =>
                      change({ visible_by_default: event.target.checked })
                    }
                  />
                }
                label={t("admin.dashboard.storyMap.visibleInStory")}
              />
            </FormGroup>
          </div>
          <div className="StoryEditorOverlay" ref={setOverlay} />
        </div>
      </ModalContent>
      <ModalFooter>
        <ThemeButton variant="Basic Reverse" onClick={close}>
          {t("admin.cancel")}
        </ThemeButton>
        <SaveButton
          variant="primary"
          text={t("admin.dashboard.storyMap.apply")}
          disabled={!data.name}
          onClick={() => {
            onApply(data);
            close();
          }}
        />
      </ModalFooter>
    </Modal>
  );
};

/** Story Map tab of the project form. */
export default function StoryMapForm() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const {
    slug,
    stories,
    storiesStructure,
    story_map_enabled,
    story_map_cinematic,
  } = useSelector((state: any) => state.dashboard.data);
  const ListFormComponent: any = ListForm;

  const [bookmarks, setBookmarks] = useState<BookmarkOption[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<DashboardStory | null>(
    null,
  );

  /** Bookmarks of the project; fetched again when the editor opens. */
  const fetchBookmarks = useCallback(() => {
    if (!slug || slug.startsWith(":")) {
      setBookmarks([]);
      return;
    }
    fetchingData(
      `/api/dashboard/${slug}/bookmarks`,
      {},
      {},
      (data: BookmarkOption[]) => {
        setBookmarks(
          (data || []).map((bookmark: BookmarkOption) => ({
            id: bookmark.id,
            name: bookmark.name,
          })),
        );
      },
    );
  }, [slug]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const openEditor = (story: DashboardStory) => {
    fetchBookmarks();
    setSelectedStory(story);
    setOpen(true);
  };

  const updateStory = (story: DashboardStory) => {
    const payload = {
      ...story,
      visible_by_default: story.visible_by_default !== false,
      config: story.config || {},
    };
    if (!story.id) {
      dispatch(Actions.Stories.add({ ...payload, group: "" }));
    } else {
      dispatch(Actions.Stories.update(payload));
    }
    setSelectedStory(null);
  };

  return (
    <div className="StoryMap">
      <StoryEditor
        open={open}
        setOpen={setOpen}
        story={selectedStory}
        bookmarks={bookmarks}
        onApply={updateStory}
      />
      <div className="BasicForm AdminForm">
        <div className="BasicFormSection">
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!story_map_enabled}
                  onChange={() => {
                    dispatch(
                      Actions.Dashboard.updateProps({
                        story_map_enabled: !story_map_enabled,
                      }),
                    );
                  }}
                />
              }
              label={t("admin.dashboard.storyMap.enable")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!story_map_cinematic}
                  disabled={!story_map_enabled}
                  onChange={() => {
                    dispatch(
                      Actions.Dashboard.updateProps({
                        story_map_cinematic: !story_map_cinematic,
                      }),
                    );
                  }}
                />
              }
              label={t("admin.dashboard.storyMap.cinematic")}
            />
            <div className="form-helptext">
              {t("admin.dashboard.storyMap.cinematicHelp")}
            </div>
          </FormGroup>
        </div>
      </div>
      <ListFormComponent
        pageName={"Story Pages"}
        data={stories || []}
        dataStructure={storiesStructure}
        setDataStructure={(structure: any) => {
          dispatch(
            Actions.Dashboard.updateStructure("storiesStructure", structure),
          );
        }}
        addLayerAction={(story: DashboardStory) => {
          dispatch(Actions.Stories.add(story));
        }}
        removeLayerAction={(story: DashboardStory) => {
          dispatch(Actions.Stories.remove(story));
        }}
        changeLayerAction={(story: DashboardStory) => {
          dispatch(Actions.Stories.update(story));
        }}
        addLayerInGroupAction={() => {
          openEditor({
            id: 0,
            name: "",
            description: "",
            icon: null,
            iconFile: null,
            bookmark_id: null,
            visible_by_default: true,
            config: {},
          });
        }}
        editLayerInGroupAction={(story: DashboardStory) => {
          openEditor({ ...story, iconFile: null });
        }}
        hasGroup={false}
        otherActionsFunction={(story: DashboardStory) => {
          const bookmark = bookmarks.find(
            (bookmark) => bookmark.id === story.bookmark_id,
          );
          return (
            <div className="OtherActionIndicator">
              {bookmark
                ? t("admin.dashboard.storyMap.bookmarkName", {
                    name: bookmark.name,
                  })
                : t("admin.dashboard.storyMap.noBookmark")}
            </div>
          );
        }}
      />
    </div>
  );
}
