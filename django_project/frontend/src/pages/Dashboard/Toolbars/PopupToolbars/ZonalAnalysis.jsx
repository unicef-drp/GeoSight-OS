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
 * __date__ = '26/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Zonal Analysis
   ========================================================================== */

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import {
  MeasurementOffIcon,
  MeasurementOnIcon
} from "../../../../components/Icons";
import ZonalAnalysisTool from "../../../../components/ZonalAnalysisTool";

import './style.scss';

/**
 * Zonal Analysis
 */
export const ZonalAnalysisComponent = forwardRef((
    { map, started }, ref
  ) => {
    const [active, setActive] = useState(false);

    useImperativeHandle(ref, () => ({
      stop() {
        setActive(false)
      }
    }));

    return <Plugin className='PopupToolbarIcon'>
      <div className='Active'>
        <PluginChild
          title={'Zonal Analysis'}
          disabled={!map}
          active={active}
          onClick={() => {
            if (map) {
              started()
              setActive(!active)
            }
          }}>
          {active ? <MeasurementOnIcon/> : <MeasurementOffIcon/>}
        </PluginChild>
      </div>
      {
        active ? <div className='PopupToolbarComponent'>
          <ZonalAnalysisTool map={map}/>
        </div> : null
      }

    </Plugin>
  }
)