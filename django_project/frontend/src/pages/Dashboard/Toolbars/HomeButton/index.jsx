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
   History Movement
   ========================================================================== */

import React, { Fragment } from 'react';
import { useSelector } from "react-redux";
import { HomeIcon } from "../../../../components/Icons"

import { Plugin, PluginChild } from "../../MapLibre/Plugin";

/**
 * Movement history component.
 */
export default function HomeButton({ map }) {
  const { extent } = useSelector(state => state.dashboard.data)

  return (
    <Fragment>
      <Plugin className={'MovementHistory'}>
        <div className={'Active'}>
          <PluginChild
            title={'Back to home'}
            disabled={!extent}
            onClick={() => {
              map.fitBounds([
                [extent[0], extent[1]],
                [extent[2], extent[3]]
              ])
            }}>
            <HomeIcon/>
          </PluginChild>
        </div>
      </Plugin>
    </Fragment>
  )
}