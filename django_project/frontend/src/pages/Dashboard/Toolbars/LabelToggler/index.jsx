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
   CompareLayer
   ========================================================================== */

import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import FontDownloadOffIcon from '@mui/icons-material/FontDownloadOff';
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { Actions } from '../../../../store/dashboard'

import './style.scss';

/**
 * CompareLayer component.
 */
export default function LabelToggler() {
  const dispatch = useDispatch()
  const { showIndicatorMapLabel } = useSelector(state => state.globalState)

  return (
    <Plugin>
      <PluginChild
        title={(showIndicatorMapLabel ? 'Hide' : 'Show') + ' map labels'}
      >
        {
          showIndicatorMapLabel ?
            <FontDownloadIcon onClick={() => {
              dispatch(Actions.GlobalState.update({ showIndicatorMapLabel: false }))
            }}/> :
            <FontDownloadOffIcon onClick={() => {
              dispatch(Actions.GlobalState.update({ showIndicatorMapLabel: true }))
            }}/>
        }
      </PluginChild>
    </Plugin>
  )
}