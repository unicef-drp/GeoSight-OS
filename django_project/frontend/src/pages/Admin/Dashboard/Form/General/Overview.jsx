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
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '02/11/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
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
import { debounce } from "@mui/material/utils";

import "@mdxeditor/editor/style.css";
import "./style.scss";

/** Overview dashboard */
export default function OverviewForm({ onChange }) {
  const { overview } = useSelector((state) => state.dashboard.data);
  const [overviewData, setOverviewData] = useState(overview ? overview : "");
  const [isInit, setIsInit] = useState(true);

  // Update overviewData when overview prop changes
  useEffect(() => {
    if (overview !== overviewData) {
      setOverviewData(overview ? overview : "");
    }
  }, [overview]);

  const update = useMemo(
    () =>
      debounce((newValue) => {
        if (!isInit && newValue !== overviewData) {
          onChange(newValue);
        }
        setIsInit(false);
      }, 500),
    [isInit],
  );

  useEffect(() => {
    update(overviewData);
  }, [overviewData]);

  return (
    <div className="Overview">
      <textarea
        id="GeneralOverview"
        name="textarea"
        value={overviewData}
        readOnly
      />
      <Suspense fallback={<div>Loading...</div>}>
        <MDXEditor
          markdown={overviewData}
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
                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                  />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                  />
                  <ListsToggle />
                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                  />
                  <BlockTypeSelect />
                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                  />
                  <CreateLink />
                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                  />
                  <InsertTable />
                  <InsertThematicBreak />
                  <div
                    data-orientation="vertical"
                    aria-orientation="vertical"
                    role="separator"
                  />
                </>
              ),
            }),
          ]}
          onChange={(val) => {
            setOverviewData(val);
          }}
        />
      </Suspense>
    </div>
  );
}
