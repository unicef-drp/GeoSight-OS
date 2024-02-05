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
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { Actions } from '../../../../store/dashboard'
import {
  TimeCheckedIcon,
  TimeUncheckedIcon
} from "../../../../components/Icons";

import './style.scss';

/**
 * Global date selector toolbar component.
 */
export default function GlobalDateSelector() {
  const dispatch = useDispatch()
  const { globalDateSelectorOpened } = useSelector(state => state.globalState)

  return (
    <Plugin>
      <div className='GlobalDateSelector Active'>
        <PluginChild
          title={'Show global time configuration'}
          onClick={() => {
            dispatch(
              Actions.GlobalState.update({ globalDateSelectorOpened: !globalDateSelectorOpened })
            )
          }}>
          {
            globalDateSelectorOpened ? <TimeCheckedIcon/> :
              <TimeUncheckedIcon/>
          }
        </PluginChild>
      </div>
    </Plugin>
  )
}