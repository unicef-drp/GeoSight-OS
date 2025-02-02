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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { memo, useCallback } from 'react';
import { useSelector } from "react-redux";
import { PAGES } from "./types.d";

export interface Props {
  page: string;
  setPage: (data: string) => void;
}

export interface ButtonProps extends Props {
  targetPage: string;
  title: string;
}

const DashboardFormHeaderButtonWithNoData = (
  { page, setPage, targetPage, title }: ButtonProps
) => {
  return <div
    className={page === targetPage ? 'Selected' : 'MuiButtonLike'}
    onClick={() => setPage(targetPage)}
  >
    {title}
  </div>
}


export interface ButtonDataProps extends ButtonProps {
  dataKey: string;
}

const DashboardFormHeaderButtonWithData = (
  { page, setPage, targetPage, title, dataKey }: ButtonDataProps
) => {
  // @ts-ignore
  const data = useSelector(state => state.dashboard?.data[dataKey]);

  return <div
    className={page === targetPage ? 'Selected' : 'MuiButtonLike'}
    onClick={() => setPage(targetPage)}
  >
    {title} {data?.length ? `(${data?.length})` : null}
  </div>
}
/** Dashboard Form Section Content */
export const DashboardFormHeader = memo(
  (
    { page, setPage }: Props
  ) => {

    // Update Page callbacks
    const setPageCallback = useCallback((page: string) => {
      setPage(page)
    }, []);

    // @ts-ignore
    const user_permission = useSelector(state => state.dashboard?.data?.user_permission);
    return <div className='DashboardFormHeader TabPrimary'>
      <DashboardFormHeaderButtonWithNoData
        page={page} setPage={setPageCallback} targetPage={PAGES.GENERAL}
        title={'General'}
      />
      <DashboardFormHeaderButtonWithData
        page={page} setPage={setPageCallback} targetPage={PAGES.INDICATORS}
        title={'Indicators'} dataKey={'indicators'}
      />
      <DashboardFormHeaderButtonWithData
        page={page} setPage={setPageCallback}
        targetPage={PAGES.INDICATOR_LAYERS}
        title={'Indicator Layers'} dataKey={'indicatorLayers'}
      />
      <DashboardFormHeaderButtonWithData
        page={page} setPage={setPageCallback} targetPage={PAGES.CONTEXT_LAYERS}
        title={'Context Layers'} dataKey={'contextLayers'}
      />
      <DashboardFormHeaderButtonWithData
        page={page} setPage={setPageCallback} targetPage={PAGES.BASEMAPS}
        title={'Basemaps'} dataKey={'basemapsLayers'}
      />
      <DashboardFormHeaderButtonWithNoData
        page={page} setPage={setPageCallback} targetPage={PAGES.FILTERS}
        title={'Filters'}
      />
      <DashboardFormHeaderButtonWithData
        page={page} setPage={setPageCallback} targetPage={PAGES.WIDGETS}
        title={'Widgets'} dataKey={'widgets'}
      />
      <DashboardFormHeaderButtonWithData
        page={page} setPage={setPageCallback} targetPage={PAGES.RELATED_TABLES}
        title={'Related Tables'} dataKey={'relatedTables'}
      />
      <DashboardFormHeaderButtonWithNoData
        page={page} setPage={setPageCallback} targetPage={PAGES.TOOLS}
        title={'Tools'}
      />
      {
        user_permission?.share &&
        <DashboardFormHeaderButtonWithNoData
          page={page} setPage={setPageCallback} targetPage={PAGES.SHARE}
          title={'Share'}
        />
      }
    </div>
  }
)

export default DashboardFormHeader;