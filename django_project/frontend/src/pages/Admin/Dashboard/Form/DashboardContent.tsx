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

import React, { memo } from 'react';
import { useSelector } from "react-redux";
import CircularProgress from '@mui/material/CircularProgress';
import GeneralForm from "./General";
import BasemapsForm from "./Basemaps";
import IndicatorsForm from "./Indicators";
import IndicatorLayersForm from "./IndicatorLayers";
import ContextLayerForm from "./ContextLayer";
import FiltersForm from "./Filters";
import WidgetForm from "./Widgets";
import RelatedTableForm from "./RelatedTable";
import ToolsForm from "./Tools";
import ShareForm from "./Share";
import { PAGES } from "./types.d";

export interface Props {
  page: string;
}

/** Dashboard Form Section Content */
export const DashboardFormContent = memo(
  ({ page }: Props) => {
    // @ts-ignore
    const user_permission = useSelector(state => state.dashboard?.data?.user_permission);
    return (
      <div className='DashboardFormContent'>
        {
          user_permission !== undefined ?
            <>
              <GeneralForm/>
              {
                page == PAGES.BASEMAPS ? <BasemapsForm/> :
                  page == PAGES.INDICATORS ? <IndicatorsForm/> :
                    page == PAGES.INDICATOR_LAYERS ? <IndicatorLayersForm/> :
                      page == PAGES.CONTEXT_LAYERS ? <ContextLayerForm/> :
                        page == PAGES.FILTERS ? <FiltersForm/> :
                          page == PAGES.WIDGETS ? <WidgetForm/> :
                            page == PAGES.RELATED_TABLES ?
                              <RelatedTableForm/> :
                              page == PAGES.TOOLS ? <ToolsForm/> :
                                page == PAGES.SHARE && user_permission.share ?
                                  <ShareForm/> : null

              }
            </> :
            <div className='DashboardFormLoading'>
              <div className='DashboardFormLoadingSection'>
                <CircularProgress/>
                <div>
                  Fetching project data...
                </div>
              </div>
            </div>
        }
      </div>
    )
  }
)

export default DashboardFormContent;