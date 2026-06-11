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
   Geometry Center
   ========================================================================== */

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { extractCode } from "../../../../utils/georepo";
import { allDataIsReady } from "../../../../utils/indicators";
import {
  indicatorLayerId,
  isIndicatorLayerLikeIndicator,
  SingleIndicatorTypes,
} from "../../../../utils/indicatorLayer";
import { dictDeepCopy } from "../../../../utils/main";
import {
  getIndicatorDataByLayer,
  UpdateStyleData,
} from "../../../../utils/indicatorData";
import {
  createLabelState,
  hideLabel,
  renderLabel,
  resetLabel,
  showLabel,
} from "./Label";
import { ExecuteWebWorker } from "../../../../utils/WebWorker";
import worker from "./Label/worker";
import {
  createChartState,
  renderChart,
  renderPin,
  resetCharts
} from "./Chart";
import workerMergeGeometries from "../../../../workers/merge_geometries";
import { ReferenceLayerFilterCentroid } from "./CentroidFiltered";

import "./style.scss";

/**
 * GeometryCenter.
 */
export default function ReferenceLayerCentroid({
  map,
  firstLayer,
  secondLayer,
  referenceLayers,
}) {
  const lastConfig = useRef({});
  const lastRequest = useRef(null);
  const lastRequestRender = useRef(null);
  const labelState = useRef(createLabelState());
  const chartState = useRef(createChartState());
  const { indicators, indicatorLayers, referenceLayer } = useSelector(
    (state) => state.dashboard.data,
  );
  const { showIndicatorMapLabel } = useSelector((state) => state.globalState);
  const { indicatorShow } = useSelector((state) => state.map);
  const datasetGeometries = useSelector((state) => state.datasetGeometries);
  const indicatorsData = useSelector((state) => state.indicatorsData);
  const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);
  const mapGeometryValue = useSelector((state) => state.mapGeometryValue);

  const [geometriesDataState, setGeometriesDataState] = useState({
    identifiers: null,
    geometries: {},
  });

  // TransparencySlider
  const indicatorLayerTransparency = useSelector(
    (state) => state.map.transparency?.indicatorLayer,
  );
  const transparency = indicatorLayerTransparency / 100;

  const filterRef = useRef(null);

  // When reference layer changed, fetch features
  useEffect(() => {
    const currRequest = new Date().getTime();
    lastRequestRender.current = currRequest;
    const identifiers = referenceLayers.map(
      (referenceLayer) => referenceLayer.identifier,
    );
    if (referenceLayers.length > 1) {
      ExecuteWebWorker(
        workerMergeGeometries,
        {
          referenceLayers: identifiers,
          datasetGeometries,
        },
        (features) => {
          if (currRequest === lastRequestRender.current) {
            setGeometriesDataState({
              identifiers: identifiers,
              geometries: features,
            });
          }
        },
      );
    } else {
      if (datasetGeometries[referenceLayers[0]?.identifier]) {
        setGeometriesDataState({
          identifiers: [referenceLayers[0]?.identifier],
          geometries: datasetGeometries[referenceLayers[0]?.identifier],
        });
      }
    }
  }, [referenceLayers, datasetGeometries]);

  /** Chart data generator **/
  const chartData = (indicators) => {
    const labels = [];
    const data = [];
    const colors = [];
    indicators.map((indicator) => {
      labels.push(indicator.name);
      data.push(indicator.value);
      colors.push(indicator.color);
    });
    const options = {
      plugins: {
        legend: {
          display: false,
        },
      },
      tooltips: { enabled: false },
      hover: { mode: null },
      events: [],
      scales: {
        x: {
          display: false,
          grid: {
            drawTicks: false,
          },
        },
        y: {
          display: false,
          grid: {
            drawTicks: false,
          },
        },
      },
    };
    return {
      labels: labels,
      data: data,
      colors: colors,
      options: options,
    };
  };

  /** Resetting **/
  const reset = (map) => {
    resetLabel(map, labelState.current);
    resetCharts(chartState.current);
  };

  // When show label toggled
  useEffect(() => {
    if (!map) return;
    if (showIndicatorMapLabel) {
      showLabel(map);
    } else {
      hideLabel(map);
    }
  }, [map, showIndicatorMapLabel]);

  const updateCentroid = () => {
    if (!map) {
      return;
    }
    const { identifiers, geometries } = geometriesDataState;

    let rendering = true;
    // Check if multiple indicator or not
    let indicatorLayer = firstLayer;
    if (secondLayer?.indicators?.length >= 2) {
      indicatorLayer = secondLayer;
    }
    if (!indicatorLayer?.indicators) {
      rendering = false;
    }

    // Check if geometries data is exist
    let geometriesData = geometries[selectedAdminLevel.level];
    if (!geometriesData) {
      rendering = false;
    }
    if (!rendering) {
      lastConfig.current = {};
      reset(map);
      return;
    }

    // ---------------------------------------------------------
    // CREATE LABEL IF SINGLE INDICATOR
    // ---------------------------------------------------------
    let labelConfig = indicatorLayer.label_config;
    let styleConfig = indicatorLayer;
    if (SingleIndicatorTypes.includes(indicatorLayer.type)) {
      const indicatorDetail = indicators.find(
        (indicator) => indicator.id === indicatorLayer?.indicators[0]?.id,
      );
      if (!indicatorLayer.override_style && indicatorDetail) {
        styleConfig = indicatorDetail;
      }
      if (indicatorDetail && (!labelConfig || !indicatorLayer.override_label)) {
        labelConfig = indicatorDetail.label_config;
      }
    }
    // ---------------------------------------------------------

    // ---------------------------------------------------------
    // CREATE CHARTS IF MULTIPLE INDICATORS
    // ---------------------------------------------------------
    const isRenderingChart = indicatorLayer?.indicators?.length >= 2;
    if (isRenderingChart) {
      // Remove label when in chart
      resetLabel(map, labelState.current);

      // Get all data
      const usedIndicatorsData = {};
      const usedIndicatorsProperties = {};
      indicatorLayer.indicators.map((indicator) => {
        usedIndicatorsData[indicator.id] = getIndicatorDataByLayer(
          indicator.id,
          indicatorsData,
          indicatorLayer,
          referenceLayer,
        );
        const data = {};
        for (const [key, value] of Object.entries(indicator)) {
          if (!key.includes("style")) {
            data[key] = value;
          }
        }
        usedIndicatorsProperties[indicator.id] = data;
      });
      const layerId = indicatorLayerId(indicatorLayer);
      if (indicatorsData[layerId]) {
        usedIndicatorsData[layerId] = indicatorsData[layerId];
        const data = {};
        for (const [key, value] of Object.entries(indicatorLayer)) {
          if (!key.includes("style")) {
            data[key] = value;
          }
        }
        usedIndicatorsProperties[layerId] = data;
      }
      if (!allDataIsReady(usedIndicatorsData)) {
        rendering = false;
      }
      if (!rendering) {
        reset(map);
        lastConfig.current = {};
        return;
      }

      // Check by config
      const chartStyle = indicatorLayer.chart_style;
      const config = {
        indicators: indicatorLayer.indicators.map((indicator) => indicator.id),
        indicatorLayer: indicatorLayer.id,
        indicatorLayerConfig: isIndicatorLayerLikeIndicator(indicatorLayer)
          ? indicatorLayer.config
          : {},
        indicatorShow: indicatorShow,
        usedIndicatorsData: usedIndicatorsData,
        chartStyle: chartStyle,
        referenceLayers: identifiers,
      };
      // If config is same, don't render to prevent flicker
      if (JSON.stringify(config) === JSON.stringify(lastConfig.current)) {
        return;
      }

      // Create data per geom
      // Creating features for center data
      let maxValue = 0;
      const features = [];

      let theGeometries = Object.keys(geometriesData);

      // Create style
      const copiedUsedIndicatorsData = dictDeepCopy(usedIndicatorsData);
      indicatorLayer.indicators.map((indicator) => {
        if (indicatorLayer.multi_indicator_mode === "Pin") {
          let config = indicator;
          if (!indicator.style) {
            const obj = indicators.find((ind) => ind.id === indicator.id);
            if (obj) {
              config = dictDeepCopy(obj);
              config.indicators = [indicator];
            }
          }
          if (copiedUsedIndicatorsData[indicator.id]) {
            copiedUsedIndicatorsData[indicator.id].data = UpdateStyleData(
              copiedUsedIndicatorsData[indicator.id].data,
              config,
            );
          }
        }
      });

      // -----------------------
      // Split data per geometry
      // -----------------------
      const indicatorsByGeom = {};
      for (const [indicatorId, indicatorData] of Object.entries(
        copiedUsedIndicatorsData,
      )) {
        indicatorData.data.forEach(function (data) {
          const code = extractCode(data);
          if (!indicatorsByGeom[code]) {
            indicatorsByGeom[code] = [];
          }
          indicatorsByGeom[code].push(
            Object.assign({}, data, usedIndicatorsProperties[indicatorId]),
          );
        });
      }
      theGeometries.map((geom) => {
        const geometry = geometriesData[geom];
        if (indicatorsByGeom[geometry?.code]) {
          const properties = Object.assign({}, geometry, {
            chart_style: JSON.parse(JSON.stringify(chartStyle)),
            name: indicatorLayer.name,
          });
          properties["data"] = indicatorsByGeom[geometry.code];
          properties["chartData"] = chartData(indicatorsByGeom[geometry.code]);

          // Check pie chart graph
          let total = 0;
          let maxFeatureValue = 0;
          indicatorsByGeom[geometry.code].map((data) => {
            total += data.value;
            if (data.value > maxFeatureValue) {
              maxFeatureValue = data.value;
            }
          });

          // We save the max value
          if (total > maxValue) {
            maxValue = total;
          }
          properties["total"] = total;
          properties["maxValue"] = maxFeatureValue;
          features.push({
            type: "Feature",
            properties: properties,
            geometry: geometry.geometry,
          });
        }
      });

      // ------------------------------
      // Check the style
      // ------------------------------
      reset(map);
      if (indicatorLayer.multi_indicator_mode === "Pin") {
        renderPin(
          map,
          features,
          indicatorLayer,
          lastConfig.current,
          config,
          transparency,
          chartState.current,
        );
      } else {
        // Change size of pie chart
        switch (chartStyle.sizeType) {
          case "Fixed size":
            break;
          default:
            // TODO:
            //  We need to split the data between
            const minSize = chartStyle.minSize;
            const maxSize = chartStyle.maxSize;
            const diffSize = maxSize - minSize;
            features.map((feature) => {
              const properties = feature.properties;
              const percentageSize = properties.total / maxValue;
              properties.chart_style.size = percentageSize * diffSize + minSize;
            });
        }
        renderChart(
          map,
          features,
          lastConfig.current,
          config,
          transparency,
          chartState.current,
        );
      }
      lastConfig.current = config;
      filterRef.current?.call();
    } else {
      // ---------------------------------------------------------
      // CREATE LABEL IF SINGLE INDICATOR
      // ---------------------------------------------------------
      // Remove charts when label
      resetCharts(chartState.current);

      // Hide label if indicator not show
      if (!indicatorShow) {
        reset(map);
        return;
      }
      // When there is no config, no label rendered
      if (!labelConfig) {
        reset(map);
        return;
      }
      if (!showIndicatorMapLabel) {
        return;
      }
      // ---------------------------------------------------------
      // LABEL
      // ---------------------------------------------------------
      if (!geometriesData) {
        renderLabel(map, [], labelConfig, labelState.current);
        return;
      }
      const config = {
        selectedIndicators: [firstLayer?.id, secondLayer?.id],
        referenceLayers: referenceLayers.map(
          (referenceLayer) => referenceLayer.identifier,
        ),
        selectedAdminLevel: selectedAdminLevel.level,
      };
      if (JSON.stringify(config) !== JSON.stringify(lastConfig.current)) {
        reset(map);
      }
      lastConfig.current = config;

      const currRequest = new Date().getTime();
      lastRequest.current = currRequest;
      ExecuteWebWorker(
        worker,
        {
          geometriesData,
          mapGeometryValue,
        },
        (features) => {
          if (currRequest === lastRequest.current) {
            renderLabel(map, features, labelConfig, labelState.current);
            filterRef.current?.call();
          }
        },
      );
    }
  };
  // When everything changed
  useEffect(() => {
    updateCentroid();
  }, [
    geometriesDataState,
    indicatorsData,
    indicatorShow,
    indicatorLayers,
    firstLayer,
    secondLayer,
    selectedAdminLevel,
    mapGeometryValue,
    referenceLayers,
    showIndicatorMapLabel,
  ]);

  return (
    <>
      <ReferenceLayerFilterCentroid map={map} ref={filterRef} />
    </>
  );
}
