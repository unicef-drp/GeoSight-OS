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

import React, { Fragment, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";

import { Actions } from "../../../store/dashboard";
import CustomPopover from "../../CustomPopover";
import { fetchingData } from "../../../Requests";
import { formatDateTime } from "../../../utils/main";
import { InfoFillIcon } from "../../Icons/"

import './style.scss';

const LAYER_TYPE_CONTEXT_LAYER = 'Context Layer';
const LAYER_TYPE_INDICATOR = 'Indicator';

/**
 * Description layer.
 * @param {Object} layer Layer data.
 */
export default function LayerDescription({ layer }) {
  const dispatch = useDispatch();
  const { slug, indicators } = useSelector(state => state.dashboard.data);
  const layerType = layer.indicators === undefined ? LAYER_TYPE_CONTEXT_LAYER : LAYER_TYPE_INDICATOR;
  const [loading, setLoading] = useState(false);

  /***
   * Set loading if description not in layer.
   * So we need to fetch it from API
   */
  useLayoutEffect(() => {
    if (layerType === LAYER_TYPE_INDICATOR && layer?.last_update === undefined) {
      setLoading(true)
    }
  }, [])

  const sources = []
  const units = []
  layer?.indicators?.map(indicator => {
    const found = indicators.find(ind => ind.id === indicator.id)
    if (found) {
      if (found.source && !sources.includes(found.source)) {
        sources.push(found.source)
      }
      if (found.unit && !units.includes(found.unit)) {
        units.push(found.unit)
      }
    }
  })

  /***
   * Fetch last update.
   */
  function fetchLastUpdate() {
    const url = `/api/dashboard/${slug}/indicator-layer/` + layer.id;
    fetchingData(
      url, {}, {}, function (response, error) {
        if (!error) {
          dispatch(
            Actions.IndicatorLayers.updateJson(
              layer.id, { last_update: response.last_update }
            )
          )
        }
        setLoading(false)
      }
    )
  }

  return (
    <div
      className={'LayerInfoIcon InfoIcon LayerIcon' + (layer?.error ? ' Error' : '')}>
      {
        layer?.error ?
          <CustomPopover
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'left',
            }}
            Button={
              <InfoFillIcon fontSize={"small"}/>
            }
            showOnHover={true}
          >
            <div className='LayerInfoPopover'>
              {'' + layer.error}
            </div>
          </CustomPopover>
          :
          <CustomPopover
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'left',
            }}
            Button={
              <InfoFillIcon fontSize={"small"}/>
            }
            showOnHover={true}
            onHover={() => {
              if (loading && layerType === LAYER_TYPE_INDICATOR) {
                fetchLastUpdate()
              }
            }}
          >
            <div className='LayerInfoPopover'>
              <div className='LayerInfoPopover'>
                <div className='title'>
                  <b className='light'>
                    {layer.name.replace(/(\w{17})(?=\w)/g, '$1 ')}
                  </b>
                </div>
                {
                  loading ?
                    <div className='Loading'><CircularProgress/></div> :
                    <Fragment>
                      {
                        layerType === LAYER_TYPE_INDICATOR ?
                          <div>
                            <b className='light'> Last Update: </b>
                            {
                              layer.last_update ? formatDateTime(new Date(layer.last_update), false, true) : '-'
                            }
                          </div> : null
                      }
                      <div style={{
                        whiteSpace: "pre-wrap",
                        marginTop: "5px"
                      }}>
                        <b className='light'>Description: </b>
                        {layer.description ? layer.description : '-'}
                      </div>
                      <div style={{
                        whiteSpace: "pre-wrap",
                        marginTop: "5px"
                      }}>
                        <b className='light'>Source: </b>
                        {sources.length ? sources.join(',') : '-'}
                      </div>
                      <div style={{
                        whiteSpace: "pre-wrap",
                        marginTop: "5px"
                      }}>
                        <b className='light'>Unit: </b>
                        {units.length ? units.join(',') : '-'}
                      </div>
                    </Fragment>
                }
              </div>
            </div>
          </CustomPopover>
      }
    </div>
  )
}