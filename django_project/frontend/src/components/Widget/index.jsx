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
   WIDGET
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import CircularProgress from '@mui/material/CircularProgress';
import { fetchingData } from "../../Requests";
import SummaryWidgetView from "./Summary/View";
import { InfoFillIcon } from '../Icons'

// Widgets
import TimeSeriesChartWidget from "./TimeSeriesChartWidget"

import './style.scss';

export const DEFINITION = {
  "WidgetType": {
    "SUMMARY_WIDGET": "SummaryWidget",
    "SUMMARY_GROUP_WIDGET": "SummaryGroupWidget",
    "TIME_SERIES_CHART_WIDGET": "TimeSeriesChartWidget",
  },
  "WidgetOperation": {
    "SUM": "Sum"
  }
}

/**
 * Base widget that handler widget rendering.
 * @param {int} idx Index of widget
 * @param {string} data Data of widget
 */
export function Widget({ idx, data }) {
  const { name, description, config, type } = data
  const {
    layer_id, layer_used, property, date_filter_type, date_filter_value
  } = config
  const { indicators } = useSelector(state => state.dashboard.data);
  const indicatorLayerData = useSelector(state => state.indicatorsData[layer_id]);
  const filteredGeometries = useSelector(state => state.filteredGeometries);
  const [showInfo, setShowInfo] = useState(false);
  const [layerData, setLayerData] = useState({});

  // Fetch the data if it is using global filter
  useEffect(() => {
    if (date_filter_type === 'Global datetime filter') {
      setLayerData(indicatorLayerData)
    }
  }, [indicatorLayerData])


  const layer = indicators.find((layer) => {
    return layer.id === layer_id;
  })

  // Fetch the data if it is using no filter or custom
  useEffect(() => {
    if (layer) {
      setLayerData({
        fetching: true,
        fetched: false,
        data: {},
        error: null
      })
      let params = {}
      if (date_filter_type === 'Custom filter') {
        if (date_filter_value) {
          let [minDateFilter, maxDateFilter] = date_filter_value.split(';')
          params = {
            'time__gte': minDateFilter,
          }
          if (maxDateFilter) {
            params['time__lte'] = maxDateFilter
          }
        }
      }

      fetchingData(
        layer.url, params, {}, function (response, error) {
          let newState = {
            fetching: false,
            fetched: true,
            receivedAt: Date.now(),
            data: null,
            error: null
          };

          if (error) {
            newState.error = error;
          } else {
            newState.data = response;
          }
          setLayerData(newState);
        }
      )
    }
  }, [data])

  let indicatorData = null
  if (layer) {
    indicatorData = Object.assign({}, layerData)
    if (indicatorData.fetched && indicatorData.data) {
      indicatorData.data = indicatorData.data.filter(indicator => {
        return !filteredGeometries || filteredGeometries?.includes(indicator.concept_uuid)
      })
    }
  }


  const showInfoHandler = () => {
    setShowInfo(!showInfo)
  };

  /**
   * Render widget by type
   * **/
  function renderWidgetByType() {
    // get layers by layer used
    let layers = null
    switch (layer_used) {
      case definition.WidgetLayerUsed.INDICATOR:
        layers = indicators
        break;
    }

    // render widget by the type
    switch (type) {
      case DEFINITION.WidgetType.SUMMARY_WIDGET:
      case DEFINITION.WidgetType.SUMMARY_GROUP_WIDGET:
        return <SummaryWidgetView idx={idx} data={data}/>;
      case DEFINITION.WidgetType.TIME_SERIES_CHART_WIDGET:
        return <TimeSeriesChartWidget idx={idx} data={data}/>;
      default:
        throw new Error("Widget type does not recognized.");
    }
  }

  // Render widget based on the type and raise error
  const renderWidget = () => {
    try {
      return renderWidgetByType()
    } catch (error) {
      return <div className='widget__error'>{'' + error}</div>
    }
  }

  return (
    <div className='widget'>
      <InfoFillIcon className="info__button" onClick={() => {
        showInfoHandler()
      }}/>
      <div className='widget__fill'>
        {renderWidget()}
      </div>
      {
        showInfo ?
          <div className='widget__info'>
            <div className='widget__info__title'><b
              className='light'>{name}</b></div>
            <div className='widget__info__content'>{description}</div>
          </div> : ''
      }
    </div>
  )
}

/**
 * Widget List rendering
 */
export default function WidgetList({ widgets }) {
  return <Fragment>
    {
      widgets ?
        widgets.map(
          (widget, idx) => {
            return widget.visible_by_default ?
              <Widget key={idx} data={widget} idx={idx}/> : ''
          }
        ) : <div className='dashboard__right_side__loading'>
          <CircularProgress/>
        </div>
    }
  </Fragment>
}