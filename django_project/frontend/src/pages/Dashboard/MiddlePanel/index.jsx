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
import MapLegend from "./MapLegend";
import Basemaps from './Basemaps'
import { EmbedConfig } from "../../../utils/embed";
import ReferenceLayerSection from "./ReferenceLayer";
import GlobalDateSelector from "./GlobalDateSelector";
import LayerConfig from "./LayerConfig";

import './style.scss';

/**
 * Left panel.
 */
export default function MiddlePanel(
  { rightExpanded, children }) {
  return <section
    className={
      'DashboardMiddlePanel ' +
      (rightExpanded ? 'RightExpanded ' : '') +
      (!EmbedConfig().map ? 'Hidden ' : '')
    }
  >
    <div className='TopContent'>
      <div className='MapNavbar'>
        <div className='LeftMapNavbar'></div>
        {/*<div className='RightMapNavbar'>*/}
        {/*  <ReferenceLayerSection/>*/}
        {/*</div>*/}
      </div>
      {children}
      <LayerConfig/>
    </div>
    <div className='BottomContent'>
      <div className='ContentLine'>
        <div className='LeftSection'>
          <div className='ContentLine Inner'>
            <Basemaps/>
          </div>
          <div className='Disclaimer'>{preferences.disclaimer}</div>
        </div>
        <div className='RightSection'>
          <MapLegend/>
        </div>
      </div>
      <div className='ContentLine'>
        <GlobalDateSelector/>
      </div>
    </div>
  </section>
}