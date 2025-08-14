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

import React from 'react';
import { useSelector } from "react-redux";
import MapLegend from "./MapLegend";
import Basemaps from './Basemaps'
import { EmbedConfig } from "../../../utils/embed";
import GlobalDateSelector from "./GlobalDateSelector";
import LayerConfig from "./LayerConfig";
import { FullScreen } from '../../../pages/Dashboard/Toolbars'
import Attributions from "../Toolbars/Attributions";
import DataLoadingProgress from "../Toolbars/DataLoadingProgress";

import './style.scss';

/**
 * Left panel.
 */
export default function MiddlePanel(
  { rightExpanded, leftContent, rightContent }) {
  const { globalDateSelectorOpened } = useSelector(state => state.globalState)
  return <section
    className={
      'DashboardMiddlePanel ' +
      (rightExpanded ? 'RightExpanded ' : '') +
      (!EmbedConfig().map ? 'HiddenMap ' : '')
    }
  >
    <div className='TopContent'>
      <DataLoadingProgress/>
      <div className='LeftContent'>
        {leftContent}
        <MapLegend/>
      </div>
      <div className='MiddleContent'>
        <LayerConfig/>
      </div>
      <div className='RightContent'>
        {rightContent}
      </div>
    </div>
    <div
      className={'BottomContent ' + (globalDateSelectorOpened ? 'DateOpen' : '')}>
      <div className='ContentLine'>
        <div className='LeftSection'>
          <div className='ContentLine Inner' id='tilt-control'>
          </div>
          <div className='ContentLine Inner' id='maplibregl-ctrl-bottom-left'>
          </div>
          <div className='ContentLine Inner'>
            <Basemaps/>
            <div className='Disclaimer Fullscreen'>{preferences.disclaimer}</div>
          </div>
        </div>
        <div className='Separator'/>
        <div className='RightSection'>
          <div className='ContentLine Inner'>
            <Attributions/>
            <FullScreen/>
          </div>
        </div>
      </div>
      <div className='ContentLine'>
        <GlobalDateSelector/>
      </div>
    </div>
  </section>
}