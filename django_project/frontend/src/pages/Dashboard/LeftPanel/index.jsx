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

import { LEFT, RIGHT } from '../../../components/ToggleButton'
import ContextLayersAccordion from './ContextLayers'
import Indicators from './Indicators'
import IndicatorLayersAccordion from './IndicatorLayers'
import RelatedTables from './RelatedTable'
import FiltersAccordion from './Filters'
import { EmbedConfig } from "../../../utils/embed";
import { LayerIcon, TuneIcon } from "../../../components/Icons";

import './style.scss';

/**
 * Left panel.
 */
export default function LeftPanel({ leftExpanded }) {
  const showLayerTab = !!EmbedConfig().layer_tab
  const showFilterTab = !!EmbedConfig().filter_tab

  const state = leftExpanded ? LEFT : RIGHT
  const [expanded, setExpanded] = useState('indicators');
  const [tab, setTab] = useState(showLayerTab ? 'Layers' : 'Filters');

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
          <ContextLayersAccordion
            expanded={expanded === 'contextLayers'}
            handleChange={handleChange}
          />
          <IndicatorLayersAccordion
            expanded={expanded === 'indicators'}
            handleChange={handleChange}
          />
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
