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
 * __date__ = '31/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { AdminPage } from "./index";

import './style.scss';


/**
 * Multiple admin list
 * @param {dict} contents Containe admin contents.
 * @param {React.Component} children React component to be rendered
 */

export const MultipleAdminContent = forwardRef(
  ({
     contents,
     onTabChanges,
     ...props
   }, ref
  ) => {
    let defaultTab = window.location.hash.replace('#', '').replaceAll('%20', ' ')
    if (!Object.keys(contents).includes(defaultTab)) {
      defaultTab = Object.keys(contents)[0]
    }
    const [tab, setTab] = useState(defaultTab);

    /*** Create tab of content ***/
    function Tab({ tabName, disabled = false }) {
      return <div
        key={tabName}
        onClick={_ => {
          if (!disabled) {
            setTab(tabName)
          }
        }}
        className={
          (tab === tabName ? 'Selected ' : '') +
          (disabled ? 'Disabled' : '')
        }
      >
        {tabName}
      </div>
    }

    /** When tab changes **/
    useEffect(() => {
      if (onTabChanges) {
        onTabChanges(tab)
      }
      window.location.hash = tab
    }, [tab]);
    return <AdminPage pageName={props.pageName}>
      {
        Object.keys(contents).map(key => {
          return React.cloneElement(contents[key], {
            className: (tab !== key ? 'Hidden' : ""),
            pageName: key,
            title: key,
            tabChildren: Object.keys(contents).length > 1 ?
              <div className={'TabPrimary TabAdminList ' + tab}>
                <div className='Separator'></div>
                {
                  Object.keys(contents).reverse().map(key =>
                    <Tab key={key} tabName={key}/>
                  )
                }
              </div> : null
          })
        })
      }
    </AdminPage>
  }
)