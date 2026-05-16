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

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";
import { debounce } from "@mui/material/utils";
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

const StoryEditor = ({
  open,
  bookmarks,
  story,
  setOpen,
  onApply,
}: StoryEditorProps) => {
  const [data, setData] = useState<DashboardStory | null>(story);

  useEffect(() => {
    setData(story);
  }, [story]);

  if (!data) {
    return null;
  }

  return (
    <Modal
      className="StoryMapModal"
      open={open}
      onClosed={() => {
        setOpen(false);
      }}
    >
      <ModalHeader
        onClosed={() => {
          setOpen(false);
        }}
      >
        {data.id ? `Edit ${data.name || "story page"}` : "Add story page"}
      </ModalHeader>
      <ModalContent>
        <div className="BasicForm">
          <div className="BasicFormSection">
            <TextField
              fullWidth
              label="Title"
              value={data.name || ""}
              onChange={(event) => {
                setData({
                  ...data,
                  name: event.target.value,
                });
              }}
            />
          </div>
          <div className="BasicFormSection">
            <label className="form-label">Description</label>
            <Suspense fallback={<div>Loading...</div>}>
              <MDXEditor
                markdown={data.description || ""}
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
                        <div data-orientation="vertical" role="separator" />
                        <BoldItalicUnderlineToggles />
                        <CodeToggle />
                        <div data-orientation="vertical" role="separator" />
                        <ListsToggle />
                        <div data-orientation="vertical" role="separator" />
                        <BlockTypeSelect />
                        <div data-orientation="vertical" role="separator" />
                        <CreateLink />
                        <div data-orientation="vertical" role="separator" />
                        <InsertTable />
                        <InsertThematicBreak />
                      </>
                    ),
                  }),
                ]}
                onChange={(val) => {
                  setData({
                    ...data,
                    description: val,
                  });
                }}
              />
            </Suspense>
          </div>
          <div className="BasicFormSection">
            <label className="form-label">Thumbnail</label>
            <ImageInput
              id={`StoryMapIcon-${data.id || "new"}`}
              name={`story_icon_input_${data.id || "new"}`}
              image={data.icon}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event?.target?.files?.[0] || null;
                setData({
                  ...data,
                  iconFile: file,
                  icon: file ? URL.createObjectURL(file) : story?.icon || null,
                });
              }}
            />
          </div>
          <div className="BasicFormSection">
            <label className="form-label">Spatial bookmark</label>
            <select
              className="form-control"
              value={data.bookmark_id || ""}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                const value = event.target.value;
                setData({
                  ...data,
                  bookmark_id: value ? parseInt(value) : null,
                });
              }}
              style={{ width: "100%", minHeight: "40px" }}
            >
              <option value="">No bookmark selected</option>
              {bookmarks.map((bookmark) => (
                <option key={bookmark.id} value={bookmark.id}>
                  {bookmark.name}
                </option>
              ))}
            </select>
            {!bookmarks.length ? (
              <div className="form-helptext" style={{ marginTop: "0.5rem" }}>
                Save the dashboard first, then create bookmarks to attach them to
                Story Map pages.
              </div>
            ) : null}
          </div>
          <div className="BasicFormSection">
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.visible_by_default !== false}
                    onChange={() => {
                      setData({
                        ...data,
                        visible_by_default: !(data.visible_by_default !== false),
                      });
                    }}
                  />
                }
                label="Visible in story"
              />
            </FormGroup>
          </div>
        </div>
      </ModalContent>
      <ModalFooter>
        <ThemeButton
          variant="Basic Reverse"
          onClick={() => {
            setOpen(false);
          }}
        >
          Cancel
        </ThemeButton>
        <SaveButton
          variant="primary"
          text="Apply"
          disabled={!data.name}
          onClick={() => {
            onApply(data);
            setOpen(false);
          }}
        />
      </ModalFooter>
    </Modal>
  );
};

export default function StoryMapForm() {
  const dispatch = useDispatch();
  const { slug, stories, storiesStructure, story_map_enabled } = useSelector(
    (state: any) => state.dashboard.data,
  );
  const ListFormComponent: any = ListForm;

  const [bookmarks, setBookmarks] = useState<BookmarkOption[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<DashboardStory | null>(null);

  const fetchBookmarks = useMemo(
    () =>
      debounce((targetSlug: string) => {
        if (!targetSlug || targetSlug.startsWith(":")) {
          setBookmarks([]);
          return;
        }
        fetchingData(
          `/api/dashboard/${targetSlug}/bookmarks`,
          {},
          {},
          (data: BookmarkOption[]) => {
            setBookmarks(
              data.map((bookmark: BookmarkOption) => ({
                id: bookmark.id,
                name: bookmark.name,
              })),
            );
          },
        );
      }, 200),
    [],
  );

  useEffect(() => {
    fetchBookmarks(slug);
    return () => {
      fetchBookmarks.clear();
    };
  }, [fetchBookmarks, slug]);

  const updateStory = (story: DashboardStory) => {
    if (!story.id) {
      dispatch(
        Actions.Stories.add({
          ...story,
          group: "",
          visible_by_default: story.visible_by_default !== false,
          config: story.config || {},
        }),
      );
    } else {
      dispatch(
        Actions.Stories.update({
          ...story,
          visible_by_default: story.visible_by_default !== false,
          config: story.config || {},
        }),
      );
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
              label="Enable Story Map in the dashboard"
            />
          </FormGroup>
        </div>
      </div>
      <ListFormComponent
        pageName={"Story Pages"}
        data={stories || []}
        dataStructure={storiesStructure}
        setDataStructure={(structure: any) => {
          dispatch(Actions.Dashboard.updateStructure("storiesStructure", structure));
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
          setSelectedStory({
            id: 0,
            name: "",
            description: "",
            icon: null,
            iconFile: null,
            bookmark_id: null,
            visible_by_default: true,
            config: {},
          });
          setOpen(true);
        }}
        editLayerInGroupAction={(story: DashboardStory) => {
          setSelectedStory({
            ...story,
            iconFile: null,
          });
          setOpen(true);
        }}
        hasGroup={false}
        otherActionsFunction={(story: DashboardStory) => {
          const bookmark = bookmarks.find(
            (bookmark) => bookmark.id === story.bookmark_id,
          );
          return (
            <div className="OtherActionIndicator">
              {bookmark ? `Bookmark: ${bookmark.name}` : "No bookmark"}
            </div>
          );
        }}
      />
    </div>
  );
}
