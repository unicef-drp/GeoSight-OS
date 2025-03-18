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
import $ from "jquery";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../store/dashboard";
import { removeElement } from "../../../../utils/Array";
import { getIndicatorDataId } from "../../../../utils/indicatorData";
import {
  getIndicatorLayers,
  referenceLayerIndicatorLayer
} from "../../../../utils/indicatorLayer";
import { IndicatorRequest } from "./Request";
import { Indicator } from "../../../../class/Indicator";

/** Indicators data. */
export let indicatorFetchingIds = []

export default function Indicators() {
  const dispatch = useDispatch();
  const {
    referenceLayer,
    indicators,
    indicatorLayers
  } = useSelector(state => state.dashboard.data);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const currentIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);
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

  /** Done data **/
  const done = (id, referenceLayerIdentifier) => {
    const _indicatorLayers = getIndicatorLayers(
      id, indicatorLayers, referenceLayerIdentifier, referenceLayer
    )
    _indicatorLayers.map(indicatorLayer => {
      removeElement(indicatorFetchingIds, indicatorLayer.id)
      $('#Indicator-Radio-' + indicatorLayer.id).removeClass('Loading')
    })
  }

  /** On loading **/
  const onLoading = useCallback((id, metadataId, referenceLayerIdentifier, totalPage) => {
    const _indicatorLayers = getIndicatorLayers(
      id, indicatorLayers, referenceLayerIdentifier, referenceLayer
    )
    _indicatorLayers.map(indicatorLayer => {
      indicatorFetchingIds.push(indicatorLayer.id);
      $('#Indicator-Radio-' + indicatorLayer.id).addClass('Loading')
    })
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

      // Add error info
      if (error) {
        const _indicatorLayers = getIndicatorLayers(
          id, indicatorLayers, referenceLayerIdentifier, referenceLayer
        )
        _indicatorLayers.map(indicatorLayer => {
          if (!indicatorLayer.error) {
            dispatch(
              Actions.IndicatorLayers.updateJson(
                indicatorLayer.id,
                { error: error }
              )
            )
          }
        })
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
      if (response) {
        dispatch(
          Actions.IndicatorsData.receive(response, error, indicatorDataId)
        )
      }
      done(id, referenceLayerIdentifier)
    },
    [referenceLayer.identifier]
  )
  return <>
    {
      indicatorsWithDataset.map(indicatorDataset => {
          const dataset = indicatorDataset.dataset;
          const identifier = `${indicatorDataset.id}-${dataset}`
          const indicator = new Indicator(
            indicators.find(indicator => indicator.id === indicatorDataset.id)
          )

          return <IndicatorRequest
            key={identifier}
            indicator={indicator}
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