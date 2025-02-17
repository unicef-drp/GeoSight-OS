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
 * __date__ = '15/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { AdminProps } from "./types";
import { AdminPage } from "../../pages/Admin";
import AdminTab from "./Tab";

import './style.scss';


/** Multiple admin content */

export const MultipleAdminContent = forwardRef(
  ({
     contents,
     onTabChanged,
     pageName,
     renderLeftSidebar=true,
   }: AdminProps, ref
  ) => {
    let defaultTab = window.location.hash.replace('#', '').replaceAll('%20', ' ')
    if (!contents.find((content) => content.name.toLowerCase() === defaultTab.toLowerCase())) {
      defaultTab = contents[0].name
    }

    const [tab, setTab] = useState<string>(defaultTab);
    let content = contents.find((content) => content.name.toLowerCase() === tab.toLowerCase())

    /** When tab changes **/
    useEffect(() => {
      if (onTabChanged) {
        onTabChanged(tab)
      }
      window.location.hash = tab
    }, [tab]);

    // @ts-ignore
    return <AdminPage pageName={pageName} renderLeftSidebar={renderLeftSidebar}>
      {
        content && React.cloneElement(content.content, {
          pageName: content.name,
          middleContent: Object.keys(contents).length > 1 ?
            <div className={'TabPrimary ' + tab}>
              {
                contents.map(_content =>
                  <AdminTab
                    key={_content.name}
                    tabName={_content.name}
                    selected={tab === _content.name}
                    disabled={false}
                    onClick={() => setTab(_content.name)}
                  />
                )
              }
            </div> : null
        })
      }
    </AdminPage>
  }
)
export default MultipleAdminContent;