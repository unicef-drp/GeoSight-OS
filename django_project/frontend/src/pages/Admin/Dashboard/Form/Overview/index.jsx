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

import React, { Suspense, useState } from 'react';
import { useSelector } from "react-redux";
import { MDXEditor } from '@mdxeditor/editor/MDXEditor'
import {
  UndoRedo
} from '@mdxeditor/editor/plugins/toolbar/components/UndoRedo'
import {
  BoldItalicUnderlineToggles
} from '@mdxeditor/editor/plugins/toolbar/components/BoldItalicUnderlineToggles'
import {
  CodeToggle
} from '@mdxeditor/editor/plugins/toolbar/components/CodeToggle'
import {
  ListsToggle
} from '@mdxeditor/editor/plugins/toolbar/components/ListsToggle'
import {
  BlockTypeSelect
} from '@mdxeditor/editor/plugins/toolbar/components/BlockTypeSelect'
import {
  CreateLink
} from '@mdxeditor/editor/plugins/toolbar/components/CreateLink'
import {
  InsertTable
} from '@mdxeditor/editor/plugins/toolbar/components/InsertTable'
import {
  InsertThematicBreak
} from '@mdxeditor/editor/plugins/toolbar/components/InsertThematicBreak'
import { toolbarPlugin } from '@mdxeditor/editor/plugins/toolbar'
import { linkPlugin } from '@mdxeditor/editor/plugins/link'
import { headingsPlugin } from '@mdxeditor/editor/plugins/headings'
import { listsPlugin } from '@mdxeditor/editor/plugins/lists'
import { quotePlugin } from '@mdxeditor/editor/plugins/quote'
import { tablePlugin } from '@mdxeditor/editor/plugins/table'
import { thematicBreakPlugin } from '@mdxeditor/editor/plugins/thematic-break'
import { linkDialogPlugin } from '@mdxeditor/editor/plugins/link-dialog'


import './style.scss';

/**
 * Summary dashboard
 */
export default function OverviewForm({ changed }) {
  const {
    overview,
  } = useSelector(state => state.dashboard.data);
  const [overviewData, setOverviewData] = useState(overview ? overview : '');

  return (
    <div className='Overview'>
      <textarea
        id='SummaryOverview'
        name="textarea"
        value={overviewData}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <MDXEditor
          markdown={overviewData}
          plugins={
            [
              headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(),
              tablePlugin(), linkPlugin(), linkDialogPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo/>
                    <div data-orientation="vertical"
                         aria-orientation="vertical"
                         role="separator"/>
                    <BoldItalicUnderlineToggles/>
                    <CodeToggle/>
                    <div data-orientation="vertical"
                         aria-orientation="vertical"
                         role="separator"/>
                    <ListsToggle/>
                    <div data-orientation="vertical"
                         aria-orientation="vertical"
                         role="separator"/>
                    <BlockTypeSelect/>
                    <div data-orientation="vertical"
                         aria-orientation="vertical"
                         role="separator"/>
                    <CreateLink/>
                    <div data-orientation="vertical"
                         aria-orientation="vertical"
                         role="separator"/>
                    <InsertTable/>
                    <InsertThematicBreak/>
                    <div data-orientation="vertical"
                         aria-orientation="vertical"
                         role="separator"/>
                  </>
                )
              }),
            ]
          }
          onChange={
            val => {
              setOverviewData(val)
              changed(true)
              console.log(val)
            }
          }
        />
      </Suspense>
    </div>
  )
}