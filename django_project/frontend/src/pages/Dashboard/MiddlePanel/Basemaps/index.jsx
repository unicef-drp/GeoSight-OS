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
   BASEMAPS SELECTOR
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from '@mui/material';

import { Actions } from '../../../../store/dashboard'
import { jsonToUrlParams, stringToUrlAndParams } from "../../../../utils/main";

import './style.scss';

/**
 * Basemaps selector.
 */
export default function Basemaps() {
  const dispatch = useDispatch();
  const { basemapsLayers: data } = useSelector(state => state.dashboard.data);
  const [selected, setSelected] = useState(null);
  const onSelected = (id) => {
    setSelected(id);
  };

  // Onload, check the default one
  useEffect(() => {
    if (data) {
      const basemaps = data.filter(function (basemap) {
        return basemap.visible_by_default
      })
      if (basemaps[0]) {
        onSelected(basemaps[0]?.id);
      } else {
        onSelected(data[0]?.id);
      }
    }
  }, [data])

  // Just when selected changed
  useEffect(() => {
    if (data && selected) {
      let selectedBasemap = data.filter((basemap) => {
        return basemap.id === selected;
      })
      const selectedBasemapData = selectedBasemap[0] ? selectedBasemap[0] : null;

      // create the basemap layer
      let layer = null;
      if (selectedBasemapData) {
        const parameters = Object.assign({}, {}, selectedBasemapData.parameters)
        parameters['id'] = selectedBasemapData.id;
        parameters['type'] = `raster`;
        parameters['tiles'] = [selectedBasemapData.url];
        parameters['maxZoom'] = maxZoom;
        parameters['maxNativeZoom'] = 19;
        if (!parameters['tileSize']) {
          parameters['tileSize'] = 256;
        }
        if (selectedBasemapData.type === 'WMS') {
          parameters['transparent'] = true;
          parameters['zIndex'] = 1;
          const [url, params] = stringToUrlAndParams(selectedBasemapData.url)
          const parameter = jsonToUrlParams(Object.assign({}, {
            SERVICE: 'WMS',
            VERSION: '1.1.1',
            REQUEST: 'GetMap',
            FORMAT: 'image/png',
            TRANSPARENT: true,
            SRS: 'EPSG:3857',
            WIDTH: 1024,
            HEIGHT: 1024,
            bbox: '{bbox-epsg-3857}'
          }, params))
          parameters['tiles'] = [[url, parameter].join('?')];
        }
        layer = parameters;
      }
      dispatch(
        Actions.Map.changeBasemap(layer)
      )
    }
  }, [selected])

  return (
    <div className='basemaps__settings'>
      {
        data !== undefined ?
          data.map(
            layer => (
              <div
                className={layer.id === selected ? 'basemap__box selected' : 'basemap__box'}
                key={layer.id}
                onClick={() => {
                  setSelected(layer.id)
                }}
              >
                <Tooltip title={layer.name} placement='right'>
                  <div className='basemap__box-inner'>
                    <div className='basemap__box-content'>
                      <img src={layer.icon}/>
                      <span>{layer.name}</span>
                    </div>
                  </div>
                </Tooltip>
              </div>
            )
          )
          : <div>Loading</div>
      }
    </div>
  )
}
