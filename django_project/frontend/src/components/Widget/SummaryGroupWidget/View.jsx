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

import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { cleanLayerData } from "../../../utils/indicators"

import { DEFINITION } from "../index"

// Widgets
import SummaryWidget from "../SummaryWidget"
import SummaryGroupWidget from "../SummaryGroupWidget"
import {
  dynamicLayerIndicatorList,
  fetchDynamicLayerData,
  isIndicatorLayerLikeIndicator
} from "../../../utils/indicatorLayer";
import { Session } from "../../../utils/Sessions";
import { Indicator } from "../../../class/Indicator";
import { UpdateStyleData } from "../../../utils/indicatorData";

/**
 * Base widget that handler widget rendering.
 * @param {int} idx Index of widget
 * @param {dict} data Data of widget
 */
export default function SummaryGroupWidgetView({ data }) {
  const { config, type } = data
  const {
    layer_id, layer_used, property, date_filter_value
  } = config
  const {
    indicators,
    indicatorLayers,
    geoField,
    default_time_mode,
    referenceLayer
  } = useSelector(state => state.dashboard.data);
  const {
    use_only_last_known_value
  } = default_time_mode
  const indicatorLayerData = useSelector(state => state.indicatorsData[layer_id]);
  const filteredGeometries = useSelector(state => state.filteredGeometries);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);
  const referenceLayerData = useSelector(state => state.referenceLayerData[referenceLayer?.identifier]);
  const [countries, setCountries] = useState({});

  const [layerData, setLayerData] = useState({});
  const date_filter_type = use_only_last_known_value ? 'No filter' : config.date_filter_type

  // Fetch the data if it is using global filter
  useEffect(() => {
    const newCountries = referenceLayerData?.data?.countries?.map(
      country => country.ucode
    )
    if (newCountries !== countries) {
      setCountries(newCountries)
    }
  }, [referenceLayerData?.data])

  // Fetch the data if it is using global filter
  useEffect(() => {
    if (date_filter_type === 'Global datetime filter') {
      setLayerData(indicatorLayerData)
    }
  }, [indicatorLayerData])

  const fetchIndicatorData = async (indicator, params, config) => {
    try {
      if (!indicator) {
        throw new Error('Indicator does not found, please reconfig the widget.')
      }
      const response = await (new Indicator(indicator)).valueLatest(params, null)
      let newState = {
        fetching: false,
        fetched: true,
        receivedAt: Date.now(),
        data: null,
        error: null
      };

      newState.data = UpdateStyleData(response, config.override_style ? config : indicator);
      return newState
    } catch (err) {
      setLayerData({
        fetching: false,
        fetched: true,
        receivedAt: Date.now(),
        data: null,
        error: err.response?.data?.detail ? err.response?.data?.detail : err.message
      });
      throw new Error(err)
    }
  }

  // Fetch the data if it is using no filter or custom
  useEffect(() => {
    (
      async () => {
        if (!countries || [null, undefined].includes(selectedAdminLevel?.level)) {
          return
        }
        let params = {
          'admin_level': selectedAdminLevel?.level,
          'country_geom_id__in': countries
        }
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
        const session = new Session('Widget request ' + data.name)
        setLayerData({
          fetching: true,
          fetched: false,
          data: {},
          error: null
        });
        switch (layer_used) {
          // This is for indicator
          case definition.WidgetLayerUsed.INDICATOR:
            const indicator = indicators.find((layer) => {
              return layer.id === layer_id;
            })
            const output = await fetchIndicatorData(indicator, params, session, indicator)
            if (!session.isValid) {
              return
            }
            setLayerData(output)
            break;
          // This is for indicator layer
          case definition.WidgetLayerUsed.INDICATOR_LAYER:
            const indicatorLayer = indicatorLayers.find((layer) => {
              return layer.id === layer_id;
            })
            if (!isIndicatorLayerLikeIndicator(indicatorLayer)) {
              const indicator = indicators.find((indicator) => {
                return indicator.id === indicatorLayer.indicators[0].id;
              })
              const output = await fetchIndicatorData(indicator, params, session, indicatorLayer)
              if (!session.isValid) {
                return
              }
              setLayerData(output)
              return;
            }
            const dynamicLayerIndicators = dynamicLayerIndicatorList(indicatorLayer, indicators)
            const indicatorsData = {}
            for (let x = 0; x < dynamicLayerIndicators.length; x++) {
              const indicator = dynamicLayerIndicators[x]
              indicatorsData[indicator.id] = await fetchIndicatorData(indicator, params, session, indicatorLayer)
            }
            fetchDynamicLayerData(
              indicatorLayer, indicators, indicatorsData, geoField,
              error => {
                if (!session.isValid) {
                  return
                }
                setLayerData({
                  fetching: false,
                  fetched: true,
                  receivedAt: Date.now(),
                  data: null,
                  error: error
                });
              },
              response => {
                if (!session.isValid) {
                  return
                }
                setLayerData({
                  fetching: false,
                  fetched: true,
                  receivedAt: Date.now(),
                  data: response,
                  error: null
                });
              }, false, true
            )
        }
      }
    )()
  }, [data, selectedAdminLevel, indicatorLayers, date_filter_type, countries])

  let indicatorData = null
  if (layerData) {
    indicatorData = Object.assign({}, layerData)
    if (indicatorData?.fetched && indicatorData?.data) {
      indicatorData.data = indicatorData.data.filter(row => {
        return !filteredGeometries || filteredGeometries?.includes(row.concept_uuid)
      })
    }
  }

  /**
   * Render widget by type
   * **/
  function renderWidgetByType() {
    // If error, raise error
    if (indicatorData?.error) {
      throw new Error(indicatorData?.error);
    }
    // get layers by layer used
    let layers = null
    switch (layer_used) {
      case definition.WidgetLayerUsed.INDICATOR:
        layers = indicators
        break;
      case definition.WidgetLayerUsed.INDICATOR_LAYER:
        layers = indicatorLayers
        break;
    }
    // render widget by the type
    switch (type) {
      case DEFINITION.WidgetType.SUMMARY_WIDGET:
        const _data = cleanLayerData(layer_id, layer_used, indicatorData, property);
        return <SummaryWidget
          data={_data}
          widgetData={data}
        />;
      case DEFINITION.WidgetType.SUMMARY_GROUP_WIDGET:
        return <SummaryGroupWidget
          data={cleanLayerData(layer_id, layer_used, indicatorData, property)}
          widgetData={data}
        />;
      default:
        throw new Error("Widget type does not recognized.");
    }
  }

  // Render widget based on the type and raise error
  const renderWidget = () => {
    try {
      return renderWidgetByType()
    } catch (error) {
      error = ('' + error).replaceAll('Error: ', '')
      return <div className='widget__error'>{'' + error}</div>
    }
  }

  return renderWidget()
}