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

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import maplibregl from "maplibre-gl";
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import {
  MeasurementOffIcon,
  MeasurementOnIcon
} from "../../../../components/Icons";
import { ZonalAnalysisTool } from "../../../../components/ZonalAnalysisTool";

import './style.scss';

interface Props {
  map: maplibregl.Map;
  started: () => void
}


/**
 * Zonal Analysis
 */
export const ZonalAnalysisComponent = forwardRef((
    { map, started }: Props, ref
  ) => {
    const toolRef = useRef(null);
    const [active, setActive] = useState(false);

    useImperativeHandle(ref, () => ({
      stop() {
        toolRef?.current?.stop()
        setActive(false)
      }
    }));

    /**
     * Start changed
     */
    useEffect(() => {
      if (map) {
        if (active) {
          toolRef?.current?.start()
        } else {
          toolRef?.current?.stop()
        }
      }
    }, [map, active]);

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
          <ZonalAnalysisTool map={map} ref={toolRef}/>
        </div> : null
      }

    </Plugin>
  }
)