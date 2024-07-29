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

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { returnWhere } from "../../../../utils/queryExtraction";
import { extractCode, fetchJson } from "../../../../utils/georepo";
import { allDataIsReady } from "../../../../utils/indicators";
import {
  indicatorLayerId,
  isIndicatorLayerLikeIndicator
} from "../../../../utils/indicatorLayer";
import { dictDeepCopy } from "../../../../utils/main";
import { UpdateStyleData } from "../../../../utils/indicatorData";
import { hideLabel, renderLabel, resetLabel, showLabel } from "./Label"
import { ExecuteWebWorker } from "../../../../utils/WebWorker";
import worker from "./Label/worker";
import { fetchJSON } from "../../../../Requests";
import { Actions } from "../../../../store/dashboard";
import { renderChart, renderPin, resetCharts } from "./Chart";

import './style.scss';

let lastConfig = {};
let lastRequest = null;
/**
 * GeometryCenter.
 */
export default function ReferenceLayerCentroid({ map }) {
  const dispatch = useDispatch();
  const {
    indicators,
    indicatorLayers,
    referenceLayer
  } = useSelector(state => state.dashboard.data)
  const { showIndicatorMapLabel } = useSelector(state => state.globalState)
  const { indicatorShow } = useSelector(state => state.map)
  const filteredGeometries = useSelector(state => state.filteredGeometries)
  const indicatorsData = useSelector(state => state.indicatorsData);
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)
  const selectedIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer)
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  const mapGeometryValue = useSelector(state => state.mapGeometryValue)
  const filtersData = useSelector(state => state.filtersData);

  const [geometries, setGeometries] = useState({});

  const where = returnWhere(filtersData ? filtersData : [])

  // When reference layer changed, fetch features
  useEffect(() => {
    const identifier = referenceLayer?.identifier
    if (identifier) {
      if (lastRequest === identifier) {
        return
      }
      lastRequest = identifier
      setGeometries({});

      // ----------------------------
      // TODO:
      //  Fetch reference layer entities
      // ----------------------------
      try {
        const geometryMemberByUcode = {}

        const url = `${preferences.georepo_api.api}/search/view/${referenceLayer.identifier}/centroid/`
        fetchJson(url).then(async data => {
          if (identifier === lastRequest) {
            for (let i = 0; i < data.length; i++) {
              const level = data[i]
              const response = await fetchJSON(level.url)
              const geometryDataDict = {}
              const geoms = {}

              response.features.map(feature => {
                const name = feature.properties.n
                const ucode = feature.properties.u
                const concept_uuid = feature.properties.c
                const parentsUcode = feature.properties.pu
                const properties = {
                  concept_uuid: feature.properties.c,
                  name: name,
                  ucode: ucode,
                  geometry: feature.geometry
                }
                const code = extractCode(properties)
                if (!code) {
                  return
                }
                properties.code = code
                geoms[code] = properties

                // Check parents
                let parents = []
                if (parentsUcode) {
                  parents = parentsUcode.map(parent => geometryMemberByUcode[parent]).filter(parent => !!parent)
                }

                // Save for geometries
                const memberData = {
                  name: name,
                  ucode: ucode,
                  code: code,
                }
                geometryDataDict[code] = {
                  label: name,
                  name: name,
                  code: code,
                  ucode: ucode,
                  concept_uuid: concept_uuid,
                  parents: parents,
                  members: parents.concat(memberData),
                }
                geometryMemberByUcode[ucode] = memberData
              })
              if (identifier === lastRequest) {
                geometries[level.level] = geoms
                setGeometries({ ...geometries })
                dispatch(
                  Actions.Geometries.addLevelData(level.level, geometryDataDict)
                )
              }
            }
          }
        })
      } catch (e) {
      }

    }
  }, [referenceLayer]);

  /** Chart data generator **/
  const chartData = (indicators) => {
    const labels = []
    const data = []
    const colors = []
    indicators.map(indicator => {
      labels.push(indicator.name)
      data.push(indicator.value)
      colors.push(indicator.color)
    })
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
          }
        },
        y: {
          display: false,
          grid: {
            drawTicks: false,
          }
        }
      }
    };
    return {
      labels: labels,
      data: data,
      colors: colors,
      options: options
    }
  }

  /** Resetting **/
  const reset = (map) => {
    resetLabel(map)
    resetCharts()
  }

  // When show label toggled
  useEffect(() => {
    if (showIndicatorMapLabel) {
      showLabel(map)
    } else {
      hideLabel(map)
    }
  }, [
    showIndicatorMapLabel
  ]);

  // When everything changed
  useEffect(() => {
    if (!map) {
      return;
    }
    let rendering = true
    // Check if multiple indicator or not
    let indicatorLayer = selectedIndicatorLayer
    if (selectedIndicatorSecondLayer?.indicators?.length >= 2) {
      indicatorLayer = selectedIndicatorSecondLayer
    }
    if (!indicatorLayer.indicators) {
      rendering = false
    }

    // Check if geometries data is exist
    let geometriesData = geometries[selectedAdminLevel.level]
    if (!geometriesData) {
      rendering = false
    }
    if (!rendering) {
      lastConfig = {}
      reset(map)
      return;
    }
    const geometriesLevel = Object.keys(geometriesData);
    let usedFilteredGeometries = filteredGeometries?.filter(geom => geometriesLevel.includes(geom))
    if (!usedFilteredGeometries && geometriesData) {
      usedFilteredGeometries = geometriesLevel
    }

    // ---------------------------------------------------------
    // CREATE CHARTS IF MULTIPLE INDICATORS
    // ---------------------------------------------------------
    const isRenderingChart = indicatorLayer?.indicators?.length >= 2
    if (isRenderingChart) {
      // Remove label when in chart
      resetLabel(map)

      // Get all data
      const usedIndicatorsData = {}
      const usedIndicatorsProperties = {}
      indicatorLayer.indicators.map(indicator => {
        usedIndicatorsData[indicator.id] = indicatorsData[indicator.id]
        const data = {}
        for (const [key, value] of Object.entries(indicator)) {
          if (!key.includes('style')) {
            data[key] = value
          }
        }
        usedIndicatorsProperties[indicator.id] = data
      })
      const layerId = indicatorLayerId(indicatorLayer)
      if (indicatorsData[layerId]) {
        usedIndicatorsData[layerId] = indicatorsData[layerId]
        const data = {}
        for (const [key, value] of Object.entries(indicatorLayer)) {
          if (!key.includes('style')) {
            data[key] = value
          }
        }
        usedIndicatorsProperties[layerId] = data
      }
      if (!allDataIsReady(usedIndicatorsData)) {
        rendering = false
      }
      if (!rendering) {
        reset(map)
        lastConfig = {}
        return;
      }

      // Check by config
      const chartStyle = indicatorLayer.chart_style
      const config = {
        indicators: indicatorLayer.indicators.map(indicator => indicator.id),
        indicatorLayer: indicatorLayer.id,
        indicatorLayerConfig: isIndicatorLayerLikeIndicator(indicatorLayer) ? indicatorLayer.config : {},
        filteredGeometries: usedFilteredGeometries,
        indicatorShow: indicatorShow,
        usedIndicatorsData: usedIndicatorsData,
        chartStyle: chartStyle
      }
      // If config is same, don't render to prevent flicker
      if (JSON.stringify(config) === JSON.stringify(lastConfig)) {
        return;
      }

      // Create data per geom
      // Creating features for center data
      let maxValue = 0
      const features = []

      let theGeometries = Object.keys(geometriesData)
      if (where && usedFilteredGeometries) {
        theGeometries = usedFilteredGeometries
      }

      // Create style
      const copiedUsedIndicatorsData = dictDeepCopy(usedIndicatorsData)
      indicatorLayer.indicators.map(indicator => {
        if (indicatorLayer.multi_indicator_mode === "Pin") {
          let config = indicator
          if (!indicator.style) {
            const obj = indicators.find(ind => ind.id === indicator.id)
            if (obj) {
              config = dictDeepCopy(obj)
              config.indicators = [indicator]
            }
          }
          if (copiedUsedIndicatorsData[indicator.id]) {
            copiedUsedIndicatorsData[indicator.id].data = UpdateStyleData(copiedUsedIndicatorsData[indicator.id].data, config)
          }
        }
      })

      // -----------------------
      // Split data per geometry
      // -----------------------
      const indicatorsByGeom = {}
      for (const [indicatorId, indicatorData] of Object.entries(copiedUsedIndicatorsData)) {
        indicatorData.data.forEach(function (data) {
          const code = extractCode(data)
          if (!indicatorsByGeom[code]) {
            indicatorsByGeom[code] = []
          }
          indicatorsByGeom[code].push(Object.assign({}, data, usedIndicatorsProperties[indicatorId]));
        })
      }
      theGeometries.map(geom => {
        const geometry = geometriesData[geom]
        if (indicatorsByGeom[geometry?.code]) {
          const properties = Object.assign({}, geometry, {
            chart_style: JSON.parse(JSON.stringify(chartStyle)),
            name: indicatorLayer.name
          })
          properties['data'] = indicatorsByGeom[geometry.code]
          properties['chartData'] = chartData(indicatorsByGeom[geometry.code])

          // Check pie chart graph
          let total = 0
          let maxFeatureValue = 0
          indicatorsByGeom[geometry.code].map(data => {
            total += data.value
            if (data.value > maxFeatureValue) {
              maxFeatureValue = data.value
            }
          })

          // We save the max value
          if (total > maxValue) {
            maxValue = total
          }
          properties['total'] = total
          properties['maxValue'] = maxFeatureValue
          features.push({
            "type": "Feature",
            "properties": properties,
            "geometry": geometry.geometry
          })
        }
      })

      // ------------------------------
      // Check the style
      // ------------------------------
      reset(map)
      if (indicatorLayer.multi_indicator_mode === "Pin") {
        renderPin(map, features, indicatorLayer, lastConfig, config)
      } else {
        // Change size of pie chart
        switch (chartStyle.sizeType) {
          case "Fixed size":
            break
          default:
            // TODO:
            //  We need to split the data between
            const minSize = chartStyle.minSize
            const maxSize = chartStyle.maxSize
            const diffSize = maxSize - minSize
            features.map(feature => {
              const properties = feature.properties
              const percentageSize = properties.total / maxValue
              properties.chart_style.size = (percentageSize * diffSize) + minSize
            })
        }
        renderChart(map, features, lastConfig, config)
      }
      lastConfig = config
    } else {
      lastConfig = {}
      // ---------------------------------------------------------
      // CREATE LABEL IF SINGLE INDICATOR
      // ---------------------------------------------------------
      // Remove charts when label
      resetCharts()

      // Hide label if indicator not show
      if (!indicatorShow) {
        reset(map)
        return;
      }

      // Check the data
      const indicatorDetail = indicators.find(
        indicator => indicator.id === indicatorLayer?.indicators[0]?.id
      )
      let config;
      if (indicatorDetail) {
        config = indicatorDetail?.label_config
      } else {
        config = indicatorLayer?.label_config
      }
      // When there is no config, no label rendered
      if (!(config?.style && config?.text)) {
        reset(map)
        return;
      }
      // ---------------------------------------------------------
      // LABEL
      // ---------------------------------------------------------
      if (!geometriesData) {
        renderLabel(map, [], config)
        return;
      }

      ExecuteWebWorker(
        worker, {
          geometriesData,
          mapGeometryValue,
          usedFilteredGeometries
        }, (features) => {
          renderLabel(map, features, config)
        }
      )
    }

  }, [
    geometries, filteredGeometries, indicatorsData,
    indicatorShow, indicatorLayers,
    selectedIndicatorLayer, selectedIndicatorSecondLayer,
    selectedAdminLevel, mapGeometryValue
  ]);

  return null
}