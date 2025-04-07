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
 * __date__ = '07/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import {
  removeChildInGroupInStructure
} from "../../../../../components/SortableTreeForm/utilities";
import {
  isIndicatorLayerLikeIndicator
} from "../../../../../utils/indicatorLayer";

/** Indicator Layers control that control id indicator or related table being deleted */
export default function IndicatorLayersControl() {
  const dispatch = useDispatch();
  const {
    indicators: dashboardIndicators,
    relatedTables: dashboardRelatedTables,
    indicatorLayers,
    indicatorLayersStructure
  } = useSelector(state => state.dashboard.data);

  // Remove layer if the indicator is removed
  useEffect(() => {
    const indicatorIds = dashboardIndicators.map(indicator => indicator.id)
    const relatedTableIds = dashboardRelatedTables.map(rt => rt.id)
    indicatorLayers.map(layer => {
      const indicators = layer.indicators.filter(
        indicator => indicatorIds.includes(indicator.id)
      )
      const relatedTables = layer.related_tables.filter(
        rt => relatedTableIds.includes(rt.id)
      )
      // If it is multi indicator and just remaining 1 indicator, remove it
      if (indicators.length === 1 && layer.indicators.length >= 2) {
        removeLayer(layer)
      }
      // Update indicators when the size is different
      if (indicators.length !== layer.indicators.length) {
        layer.indicators = indicators
      }
      if (relatedTables.length !== layer.related_tables.length) {
        layer.related_tables = relatedTables
      }

      // delete or update
      if (layer.indicators.length === 0 && layer.related_tables.length === 0 && !isIndicatorLayerLikeIndicator(layer)) {
        removeLayer(layer)
      } else {
        dispatch(Actions.IndicatorLayers.update(layer))
      }
    })
  }, [dashboardIndicators, dashboardRelatedTables])


  /** Remove layer **/
  const removeLayer = (layer) => {
    removeChildInGroupInStructure(layer.group, layer.id, indicatorLayersStructure, _ => {
      dispatch(
        Actions.Dashboard.updateStructure(
          'indicatorLayersStructure', indicatorLayersStructure
        )
      )
    })
    dispatch(Actions.IndicatorLayers.remove(layer))
  }

  return null
}