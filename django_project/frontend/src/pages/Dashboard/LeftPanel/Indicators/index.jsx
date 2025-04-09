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

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../store/dashboard";
import { getIndicatorDataId } from "../../../../utils/indicatorData";
import {
  referenceLayerIndicatorLayer
} from "../../../../utils/indicatorLayer";
import { IndicatorRequest } from "./Request";
import { Indicator } from "../../../../class/Indicator";

/** Indicators data. */
export default function Indicators() {
  const dispatch = useDispatch();
  const {
    referenceLayer,
    indicators,
    indicatorLayers
  } = useSelector(state => state.dashboard.data);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const currentIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);
  const { level } = useSelector(state => state.selectedAdminLevel);
  const [indicatorsWithDataset, setIndicatorsWithDataset] = useState([]);

  /** Update the indicators with dataset. */
  useEffect(() => {
    const _indicatorsWithDataset = [];
    [currentIndicatorLayer, currentIndicatorSecondLayer].concat(indicatorLayers).map(layer => {
      const identifier = referenceLayerIndicatorLayer(referenceLayer, layer)?.identifier;

      layer?.indicators?.map(_ => {
        const data = _indicatorsWithDataset.find(row => row.id === _.id && row.dataset === identifier)
        if (!data) {
          _indicatorsWithDataset.push({
            id: _.id,
            dataset: identifier
          })
        }
      })
    })
    indicators.map(_ => {
      const data = _indicatorsWithDataset.find(row => row.id === _.id && row.dataset === referenceLayer.identifier)
      if (!data) {
        _indicatorsWithDataset.push({
          id: _.id,
          dataset: referenceLayer.identifier
        })
      }
    })
    if (JSON.stringify(_indicatorsWithDataset) !== JSON.stringify(indicatorsWithDataset)) {
      setIndicatorsWithDataset(_indicatorsWithDataset)
    }
  }, [referenceLayer, indicators, indicatorLayers, currentIndicatorLayer, currentIndicatorSecondLayer]);

  /** On loading **/
  const onLoading = useCallback((id, metadataId, referenceLayerIdentifier, totalPage) => {
    const indicatorDataId = getIndicatorDataId(
      id, referenceLayer.identifier, referenceLayerIdentifier
    )
    dispatch(Actions.IndicatorsData.request(indicatorDataId))
    dispatch(
      Actions.IndicatorsMetadata.progress(metadataId, {
        total_page: totalPage,
        page: 0
      })
    )
  }, [referenceLayer.identifier]);

  /** On response **/
  const onProgress = useCallback(
    (id, metadataId, progress) => {
      dispatch(
        Actions.IndicatorsMetadata.progress(metadataId, progress)
      )
    }
  )


  /** On response **/
  const onResponse = useCallback(
    (id, metadataId, referenceLayerIdentifier, response, error) => {
      if (!error && !response) {
        return
      }
      const indicatorDataId = getIndicatorDataId(
        id, referenceLayer.identifier, referenceLayerIdentifier
      )
      dispatch(
        Actions.IndicatorsMetadata.progress(
          metadataId,
          {
            total_page: 100,
            page: 100
          }
        )
      )
      dispatch(
        Actions.IndicatorsData.receive(response, error, indicatorDataId)
      )
    },
    [referenceLayer.identifier]
  )
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

          return <IndicatorRequest
            key={identifier}
            indicator={indicator}
            admin_level={level}
            datasetIdentifier={dataset}
            onLoading={onLoading}
            onResponse={onResponse}
            onProgress={onProgress}

            dashboardDatasetIdentifier={referenceLayer?.identifier}
          />
        }
      )
    }
  </>
}