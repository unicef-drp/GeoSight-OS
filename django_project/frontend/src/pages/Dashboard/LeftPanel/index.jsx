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

/* ==========================================================================
   LEFT SIDE CONTAINER
   ========================================================================== */

import React, { useState } from 'react';
import {useDispatch, useSelector} from "react-redux";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Actions } from '../../../store/dashboard';
import { LEFT, RIGHT } from '../../../components/ToggleButton'
import ContextLayersAccordion from './ContextLayers'
import Indicators from './Indicators'
import IndicatorLayersAccordion from './IndicatorLayers'
import RelatedTables from './RelatedTable'
import FiltersAccordion from './Filters'
import { EmbedConfig } from "../../../utils/embed";
import { LayerIcon, TuneIcon, VisibilityIcon, VisibilityOffIcon } from "../../../components/Icons";
import TabPanel from "../../../components/Tabs/index"
import { tabProps } from "../../../components/Tabs/index"

import './style.scss';

/**
 * Left panel.
 */
export default function LeftPanel({ leftExpanded }) {
  const dispatch = useDispatch();
  const state = leftExpanded ? LEFT : RIGHT
  const [tabValue, setTabValue] = React.useState(0);

  const {
    contextLayers
  } = useSelector(state => state.dashboard.data);
  const [tab2Value, setTab2Value] = React.useState(contextLayers.length ? 0 : 1);
  const {
    contextLayersShow,
    indicatorShow
  } = useSelector(state => state.map);

  const handleContextLayerVisibility = (e) => {
    e.stopPropagation();
    dispatch(Actions.Map.showHideContextLayer(!contextLayersShow))
  }

  const handleIndicatorVisibility = (e) => {
    e.stopPropagation();
    dispatch(Actions.Map.showHideIndicator(!indicatorShow))
  }

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangeTab2 = (event, newValue) => {
    setTab2Value(newValue);
  };

  const className = `dashboard__panel dashboard__left_side ${state}`
  const classNameWrapper = `dashboard__content-wrapper`

  return (
    <section
      className={className}
    >
      <div className={classNameWrapper}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleChangeTab} aria-label="basic tabs example">
              <Tab
                label="Layers"
                icon=<LayerIcon/>
                iconPosition="start"
                {...tabProps('Layers')}
              />
              <Tab
                label="Filters"
                icon=<TuneIcon/>
                iconPosition="start"
                {...tabProps('Filters')}
              />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0} className={'sidepanel-tab'}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className={'layers-tab-container'}>
                <Tabs value={tab2Value} onChange={handleChangeTab2} aria-label="basic tabs example">
                  <Tab
                    label="Context Layers"
                    icon={
                      contextLayersShow ? <VisibilityIcon
                        onClick={handleContextLayerVisibility}
                      /> : <VisibilityOffIcon
                        onClick={handleContextLayerVisibility}
                      />
                    }
                    iconPosition='end'
                    {...tabProps(0)}
                  />
                  <Tab
                    label="Indicators"
                    icon={
                      indicatorShow ? <VisibilityIcon
                        onClick={handleIndicatorVisibility}
                      /> : <VisibilityOffIcon
                        onClick={handleIndicatorVisibility}
                      />
                    }
                    iconPosition='end'
                    {...tabProps(1)}
                  />
                </Tabs>
              </Box>
              <TabPanel value={tab2Value} index={0} className={'sidepanel-tab layers-panel'}>
                <ContextLayersAccordion
                />
              </TabPanel>
              <TabPanel value={tab2Value} index={1} className={'sidepanel-tab layers-panel'}>
                <IndicatorLayersAccordion
                />
              </TabPanel>
            </Box>
            <Indicators/>
            <RelatedTables/>
          </TabPanel>
          <TabPanel value={tabValue} index={1} className={'sidepanel-tab'}>
            <FiltersAccordion/>
          </TabPanel>
        </Box>
      </div>
    </section>
  )
}