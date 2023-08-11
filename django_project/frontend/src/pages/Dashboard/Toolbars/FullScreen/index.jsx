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
* __date__ = '11/08/2023'
* __copyright__ = ('Copyright 2023, Unicef')
*/

/* ==========================================================================
   Toggle FullScreen
   ========================================================================== */

import React from 'react';
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { ExpandIcon, ShrinkIcon } from '../../../../components/Icons'

import './style.scss';

/**
 * FullScreen component.
 */
export default function FullScreen() {
  const isFullScreen = window.fullScreen

  return (
    <Plugin className='FullScreen'>
      <div>
        <PluginChild
          title={(isFullScreen ? 'Exit' : 'Enter') + ' fullscreen'}
        >
          {
            isFullScreen ?
              <ShrinkIcon onClick={() => {
                document.exitFullscreen()
              }}/> :
              <ExpandIcon onClick={() => {
                document.body.requestFullscreen()
              }}/>
          }
        </PluginChild>
      </div>
    </Plugin>
  )
}