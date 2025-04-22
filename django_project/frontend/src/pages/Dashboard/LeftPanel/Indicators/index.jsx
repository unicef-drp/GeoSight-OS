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
   INDICATOR
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import {
  getIndicatorsOfIndicatorLayers,
  referenceLayerIndicatorLayer
} from "../../../../utils/indicatorLayer";
import { IndicatorRequest } from "./Request";
import { Indicator } from "../../../../class/Indicator";

/** Indicators data. */
export default function Indicators() {
  const {
    referenceLayer,
    indicators,
    indicatorLayers
  } = useSelector(state => state.dashboard.data);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const currentIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);
  const { level } = useSelector(state => state.selectedAdminLevel);
  const [indicatorsWithDataset, setIndicatorsWithDataset] = useState([]);
  const indicatorLayerIds = useSelector(state => state.selectionState.filter.indicatorLayerIds);
  const activatedLayers = [
    currentIndicatorLayer?.id,
    currentIndicatorSecondLayer?.id,
    ...indicatorLayerIds
  ];

  /** Update the indicators with dataset. */
  useEffect(() => {
    const _indicatorsWithDataset = [];
    [currentIndicatorLayer, currentIndicatorSecondLayer].concat(indicatorLayers).map(layer => {
      const identifier = referenceLayerIndicatorLayer(referenceLayer, layer)?.identifier;
      const _indicators = getIndicatorsOfIndicatorLayers(layer, indicators)
      _indicators.map(_ => {
        let data = _indicatorsWithDataset.find(row => row.id === _.id && row.dataset === identifier)
        if (!data) {
          _indicatorsWithDataset.push({
            id: _.id,
            dataset: identifier,
            indicatorLayerIds: []
          })
        }
        data = _indicatorsWithDataset.find(row => row.id === _.id && row.dataset === identifier)
        data.indicatorLayerIds.push(layer.id)
      })

    })
    if (JSON.stringify(_indicatorsWithDataset) !== JSON.stringify(indicatorsWithDataset)) {
      setIndicatorsWithDataset(_indicatorsWithDataset)
    }
  }, [referenceLayer, indicators, indicatorLayers, currentIndicatorLayer, currentIndicatorSecondLayer]);

  return <>
    {
      indicatorsWithDataset.map(indicatorDataset => {
          const dataset = indicatorDataset.dataset;
          const identifier = `${indicatorDataset.id}-${dataset}`
          const indicatorData = indicators.find(indicator => indicator.id === indicatorDataset.id)
          if (!indicatorData) {
            return null
          }
          const indicator = new Indicator(indicatorData)
          const isRequest = indicatorDataset.indicatorLayerIds.some(
            item => activatedLayers.includes(item)
          )
          return <IndicatorRequest
            key={identifier}
            indicator={indicator}
            admin_level={level}
            datasetIdentifier={dataset}
            dashboardDatasetIdentifier={referenceLayer?.identifier}
            isRequest={isRequest}
          />
        }
      )
    }
  </>
}