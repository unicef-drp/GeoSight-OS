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
  const showLayerTab = !!EmbedConfig().layer_tab
  const showFilterTab = !!EmbedConfig().filter_tab
  const state = leftExpanded ? LEFT : RIGHT
  const [expanded, setExpanded] = useState('indicators');
  const [tab, setTab] = useState(showLayerTab ? 'Layers' : 'Filters');

  const {
    contextLayers
  } = useSelector(state => state.dashboard.data);
  const [value, setValue] = React.useState(contextLayers.length ? 0 : 1);
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
    setValue(newValue);
  };

  const handleChange = (panel) => (event, isExpanded) => {
    if (panel === 'projectOverview' && isExpanded) {
      setExpanded('projectOverview')
    } else {
      setExpanded(expanded === 'indicators' ? 'contextLayers' : 'indicators');
    }
  };

  const className = `dashboard__panel dashboard__left_side ${state} ${expanded ? 'expanded' : ''} `
  const classNameWrapper = `dashboard__content-wrapper ${tab}`

  return (
    <section
      className={className + (!showLayerTab && !showFilterTab ? 'Hidden' : '')}
    >
      <div className={classNameWrapper}>
        <div className='dashboard__content-wrapper__navbar'>
          {
            showLayerTab ?
              <div onClick={() => setTab('Layers')}
                   className={tab === 'Layers' ? 'active' : ''}>
                <LayerIcon/>
                <span>Layers</span>
              </div> : null
          }
          {
            showFilterTab ?
              <div onClick={() => setTab('Filters')}
                   className={tab === 'Filters' ? 'active' : ''}>
                <TuneIcon/>
                <span>Filters</span>
              </div> : null
          }
        </div>
        <div
          className={'dashboard__content-wrapper__inner dataset-wrapper ' + (showLayerTab ? showLayerTab : 'Hidden')}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChangeTab} aria-label="basic tabs example">
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
            <TabPanel value={value} index={0} className={'sidepanel-tab'}>
              <ContextLayersAccordion
                expanded={expanded === 'contextLayers'}
                handleChange={handleChange}
              />
            </TabPanel>
            <TabPanel value={value} index={1} className={'sidepanel-tab'}>
              <IndicatorLayersAccordion
                expanded={expanded === 'indicators'}
                handleChange={handleChange}
              />
            </TabPanel>
          </Box>
          <Indicators/>
          <RelatedTables/>
        </div>
        <div
          className={'dashboard__content-wrapper__inner filter-wrapper ' + (showFilterTab ? showFilterTab : 'Hidden')}
        >
          <FiltersAccordion/>
        </div>
      </div>
    </section>
  )
}
