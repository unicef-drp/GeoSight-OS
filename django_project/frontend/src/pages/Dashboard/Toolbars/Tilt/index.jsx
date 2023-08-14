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
   Tilt
   ========================================================================== */

import React, { useEffect, useState } from 'react';

import { Plugin, PluginChild } from "../../MapLibre/Plugin";

import './style.scss';

/**
 * Measurement
 */
export default function Tilt({ map, is3DView, force }) {
  const [degree, setDegree] = useState(false);

  const calculateDegree = () => {
    setDegree(Math.floor(90 - map.getPitch()))
  }
  /**
   * Map created
   */
  useEffect(() => {
    if (map && is3DView && !force) {
      map.easeTo({ pitch: 60 })
    }
  }, [is3DView]);

  /**
   * Map created
   */
  useEffect(() => {
    if (map) {
      map.on('pitch', function () {
        calculateDegree()
      });
      calculateDegree()
    }
  }, [map]);

  return <Plugin className={'TiltControl'}>
    <PluginChild
      title={
        'Reset tilt. Hold left Ctrl and click left mouse button on a map and move the cursor up/down to change tilt'
      }
      disabled={!map}
      onClick={() => {
        const degree = map.getPitch()
        if (degree === 60) {
          map.easeTo({ pitch: 0 })
        } else if (degree === 0) {
          map.easeTo({ pitch: 60 })
        } else if (degree <= 30) {
          map.easeTo({ pitch: 0 })
        } else {
          map.easeTo({ pitch: 60 })
        }
      }}>
      <div className='TiltDegree'>{degree}</div>
    </PluginChild>
  </Plugin>
}