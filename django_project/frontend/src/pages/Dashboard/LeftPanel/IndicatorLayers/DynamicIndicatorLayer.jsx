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
 * __date__ = '28/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   DYNAMIC LAYER
   ========================================================================== */

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { Actions } from "../../../../store/dashboard";
import {
  dynamicLayerIndicatorList,
  fetchDynamicLayerData,
  indicatorLayerId,
} from "../../../../utils/indicatorLayer";
import { getIndicatorDataByLayer } from "../../../../utils/indicatorData";

/**
 * Related table layer handler
 */
export default function DynamicIndicatorLayer({ indicatorLayer }) {
  const dispatch = useDispatch();
  const prevState = useRef();
  const indicators = useSelector((state) => state.dashboard.data.indicators);
  const indicatorLayers = useSelector(
    (state) => state.dashboard.data.indicatorLayers,
  );
  const geoField = useSelector((state) => state.dashboard.data.geoField);
  const referenceLayer = useSelector(
    (state) => state.dashboard.data.referenceLayer,
  );
  const indicatorLayerMetadata = useSelector(
    (state) => state.indicatorLayerMetadata,
  );
  const indicatorsData = useSelector((state) => state.indicatorsData);
  const currentIndicatorLayer = useSelector(
    (state) => state.selectedIndicatorLayer,
  );
  const currentIndicatorSecondLayer = useSelector(
    (state) => state.selectedIndicatorSecondLayer,
  );
  const indicatorLayerIds = useSelector(
    (state) => state.selectionState.filter.indicatorLayerIds,
  );
  const selectedAdminLevel = useSelector(
    (state) => state.selectedAdminLevel?.level,
  );
  const relatedTableData = useSelector((state) => state.relatedTableData);
  const filteredGeometries = useSelector((state) => state.filteredGeometries);
  const activated = [
    currentIndicatorLayer?.id,
    currentIndicatorSecondLayer?.id,
    ...indicatorLayerIds,
  ].includes(indicatorLayer.id);

  const id = indicatorLayer.id;
  const { config } = indicatorLayer;
  const dynamicLayerIndicators = dynamicLayerIndicatorList(
    indicatorLayer,
    indicators,
  );

  /** Update dates */
  useEffect(() => {
    let dates = [];
    let loading = false;
    let errorMessage = "";
    dynamicLayerIndicators.map((indicator) => {
      const indicatorDates =
        indicatorLayerMetadata["indicator-" + indicator.id]?.dates;
      if (indicatorDates) {
        if (
          typeof indicatorDates === "string" &&
          indicatorDates.includes("Error")
        ) {
          errorMessage = indicatorDates;
        } else {
          dates = dates.concat(indicatorDates);
        }
      } else {
        loading = true;
      }
    });
    const indicatorDates = indicatorLayerMetadata[id]?.dates;
    if (!loading) {
      if (errorMessage) {
        dates = errorMessage;
        if (!indicatorDates || dates !== indicatorDates) {
          dispatch(Actions.IndicatorLayerMetadata.updateDates(id, dates));
        }
      } else {
        dates = Array.from(new Set(dates));
        dates.sort();
        if (
          !indicatorDates ||
          JSON.stringify(dates) !== JSON.stringify(indicatorDates)
        ) {
          dispatch(Actions.IndicatorLayerMetadata.updateDates(id, dates));
        }
      }
    }
  }, [indicatorsData, indicatorLayerMetadata]);

  /** Update datas */
  useEffect(() => {
    if (!activated) {
      return;
    }
    const id = indicatorLayerId(indicatorLayer);
    // ------------ Check loading -----------
    let loaded = true;
    dynamicLayerIndicators.map((indicator) => {
      const indicatorData = getIndicatorDataByLayer(
        indicator.id,
        indicatorsData,
        indicatorLayer,
        referenceLayer,
      );
      if (!indicatorData?.fetched) {
        loaded = false;
      }
    });

    // Checking the related tables
    indicatorLayer.indicatorLayers?.map((il) => {
      const layer = indicatorLayers.find(
        (l) => l.id.toString() === il.id.toString(),
      );
      if (layer) {
        il.config = layer.config;
        il.related_tables = layer.related_tables;
        layer.related_tables?.map((rt) => {
          if (!relatedTableData[rt.id]?.fetched) {
            loaded = false;
          }
        });
      }
    });
    // ---------------------------------------
    if (!loaded && !indicatorsData[id]?.fetching) {
      dispatch(Actions.IndicatorsData.request(id));
      prevState.lastData = null;
    }
    if (loaded) {
      fetchDynamicLayerData(
        indicatorLayer,
        indicators,
        indicatorsData,
        geoField,
        (error) => {
          if (error !== prevState.lastData) {
            dispatch(Actions.IndicatorsData.receive([], error, id));
            prevState.lastData = error;
          }
        },
        (response) => {
          if (JSON.stringify(response) !== prevState.lastData) {
            dispatch(Actions.IndicatorsData.receive(response, "", id));
            prevState.lastData = JSON.stringify(response);
          }
          $("#Indicator-Radio-" + indicatorLayer.id).removeClass("Loading");
        },
        false,
        false,
        filteredGeometries,
        relatedTableData,
        selectedAdminLevel,
      );
    }
  }, [
    referenceLayer,
    indicatorsData,
    relatedTableData,
    geoField,
    config,
    activated,
    filteredGeometries,
    selectedAdminLevel,
  ]);

  return null;
}

/**
 * Dynamic indicator layer config
 */
export function DynamicIndicatorLayerConfig({ indicatorLayer }) {
  const dispatch = useDispatch();
  const selectedDynamicIndicatorLayer = useSelector(
    (state) => state.selectedDynamicIndicatorLayer,
  );

  return (
    <div className="LayerIcon LayerConfig">
      {selectedDynamicIndicatorLayer === indicatorLayer.id ? (
        <FilterAltIcon
          fontSize={"small"}
          onClick={() => {
            dispatch(Actions.SelectedDynamicIndicatorLayer.change(null));
          }}
        />
      ) : (
        <FilterAltOffIcon
          fontSize={"small"}
          onClick={() => {
            dispatch(
              Actions.SelectedDynamicIndicatorLayer.change(indicatorLayer.id),
            );
          }}
        />
      )}
    </div>
  );
}
