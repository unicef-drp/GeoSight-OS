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

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import maplibregl from "maplibre-gl";
import Chart from 'chart.js/auto';
import { returnWhere } from "../../../../utils/queryExtraction";
import { popupTemplate } from "../Popup";
import { addPopupEl } from "../utils";
import { extractCode, fetchJson } from "../../../../utils/georepo";
import { allDataIsReady } from "../../../../utils/indicators";
import {
  indicatorLayerId,
  isIndicatorLayerLikeIndicator
} from "../../../../utils/indicatorLayer";
import { dictDeepCopy } from "../../../../utils/main";
import { UpdateStyleData } from "../../../../utils/indicatorData";
import { hideLabel, renderLabel, showLabel } from "./Label"
import { ExecuteWebWorker } from "../../../../utils/WebWorker";
import worker from "./Label/worker";
import { fetchJSON } from "../../../../Requests";

import './style.scss';
import { Actions } from "../../../../store/dashboard";

let centroidMarker = []
let charts = {}
const INDICATOR_LABEL_ID = 'indicator-label'
let centroidConfig = {}

let lastRequest = null
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

                // Save for geometries
                if (parentsUcode) {
                  const parents = parentsUcode.map(parent => geometryMemberByUcode[parent]).filter(parent => !!parent)
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
                }
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

  /**
   * Render chart
   * **/
  const renderChart = (features, config) => {
    if (JSON.stringify(config) !== JSON.stringify(centroidConfig)) {
      return;
    }
    features.map(feature => {
      const properties = feature.properties
      const chartStyle = properties.chart_style;
      const code = properties.code
      const size = chartStyle.size;
      const { labels, data, colors, options } = properties.chartData

      if (charts[code]) {
        charts[code].clear();
        $(`${code}-chart`).remove()
      }

      const popup = new maplibregl.Popup({
        closeOnClick: false,
        closeButton: false,
        anchor: 'center'
      })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`<div style="display: block; box-sizing: border-box; height: ${size}px; width: ${size}px;"><canvas id="${code}-chart" width="${size}" height="${size}" data-size="${size}"></div>`)
        .addTo(map);
      centroidMarker.push(popup)

      // Create charts
      setTimeout(function () {
        // Don't render if config is not same
        if (JSON.stringify(config) !== JSON.stringify(centroidConfig)) {
          return;
        }
        const el = document.getElementById(`${code}-chart`)
        if (!el) {
          return
        }
        const ctx = el.getContext('2d');
        try {
          const chart = new Chart(ctx, {
            type: chartStyle.chartType ? chartStyle.chartType.toLowerCase() : 'pie',
            data: {
              labels: labels,
              datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1,
                barPercentage: 1.0,
                categoryPercentage: 1.0
              }]
            },
            options: options
          });
          charts[code] = chart

          // Popup for marker
          addPopupEl(map, el, feature.geometry.coordinates, properties, properties => {
              const markerProperties = JSON.parse(JSON.stringify(properties))
              const maxValue = properties.maxValue
              const cleanProperties = {}
              markerProperties.data.map(data => {
                cleanProperties[data.name] = `
              <div class="PopupMultiDataTable">
                <div class="PopupMultiDataTableGraph" style="background-color: ${data.color}; width: ${(data.value / maxValue) * 100}%"></div>
                <div class="PopupMultiDataTableValue">${data.value}</div>
              </div>`
              })
              const name = markerProperties['name']
              cleanProperties['code'] = markerProperties['code']
              cleanProperties['label'] = markerProperties['label']
              cleanProperties['type'] = markerProperties['type']
              return popupTemplate(null, cleanProperties, {
                name: name,
                color: '#eee'
              })
            },
            {
              'bottom': [0, -1 * size],
            }
          )
        } catch (err) {

        }
      }, 200)
    })
  }

  /**
   * Render PIN
   * **/
  const renderPin = (features, config, indicatorLayer) => {
    if (JSON.stringify(config) !== JSON.stringify(centroidConfig)) {
      return;
    }
    features.map(feature => {
      const properties = feature.properties
      const chartStyle = properties.chart_style;
      const code = properties.code
      const size = chartStyle.size ? chartStyle.size : 20;

      if (charts[code]) {
        charts[code].clear();
        $(`${code}-chart`).remove()
      }
      const children = []
      indicatorLayer.indicators.map(indicator => {
        const data = feature.properties.data?.find(row => row.indicator === indicator.indicator)
        if (data) {
          children.push(`<div class="pin" title="${data.indicator} - ${data.value}" style="background-color: ${data.style?.color}; height: ${size}px; width: ${size}px;"></div>`)
        } else {
          children.push(`<div class="pin empty"></div>`)
        }
      })

      const popup = new maplibregl.Popup({
        closeOnClick: false,
        closeButton: false,
        anchor: 'center'
      })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`<div id="${code}-pin" class="pins">${children.join('')}</div>`)
        .addTo(map)
      centroidMarker.push(popup)
    })
  }

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
  const reset = () => {
    renderLabel(map, [], {})
    for (const [code, chart] of Object.entries(charts)) {
      chart.clear();
      $(`${code}-chart`).remove()
    }
    centroidMarker.map(marker => marker.remove())
    centroidMarker = []
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
    // Check if all data is ready
    let indicatorLayer = selectedIndicatorLayer
    if (selectedIndicatorSecondLayer?.indicators?.length >= 2) {
      indicatorLayer = selectedIndicatorSecondLayer
    }
    if (!indicatorLayer.indicators) {
      reset()
      return;
    }

    const isRenderingChart = indicatorLayer?.indicators?.length >= 2

    let rendering = true
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
    // Check if geometries is exist
    let geometriesData = geometries[selectedAdminLevel.level]
    if (!geometriesData) {
      rendering = false
    }
    if (!rendering) {
      reset()
      centroidConfig = {}
      return;
    }
    const geometriesLevel = Object.keys(geometriesData);
    let usedFilteredGeometries = filteredGeometries?.filter(geom => geometriesLevel.includes(geom))
    if (!usedFilteredGeometries && geometriesData) {
      usedFilteredGeometries = geometriesLevel
    }

    // Check by config
    const config = {
      indicators: indicatorLayer.indicators.map(indicator => indicator.id),
      indicatorLayer: indicatorLayer.id,
      indicatorLayerConfig: isIndicatorLayerLikeIndicator(indicatorLayer) ? indicatorLayer.config : {},
      filteredGeometries: usedFilteredGeometries,
      indicatorShow: indicatorShow,
      usedIndicatorsData: usedIndicatorsData
    }
    // If config is same, don't render to prevent flicker
    if (JSON.stringify(config) === JSON.stringify(centroidConfig)) {
      return;
    }
    reset()
    centroidConfig = config

    // If not show
    if (!indicatorShow) {
      return;
    }

    // ---------------------------------------------------------
    // CREATE CHARTS IF MULTIPLE INDICATORS
    // ---------------------------------------------------------
    if (isRenderingChart) {
      // Create data per geom
      // Creating features for center data
      let maxValue = 0
      const features = []

      const chartStyle = indicatorLayer.chart_style
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
      if (indicatorLayer.multi_indicator_mode === "Pin") {
        renderPin(features, config, indicatorLayer)
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
        renderChart(features, config)
      }
    } else {
      // ---------------------------------------------------------
      // CREATE LABEL IF SINGLE INDICATOR
      // ---------------------------------------------------------
      let indicatorLayerId = null
      if (indicatorLayer?.indicators) {
        indicatorLayerId = indicatorLayer?.indicators[0]?.id
      }
      const indicatorDetail = indicators.find(indicator => indicator.id === indicatorLayerId)
      let config;
      if (indicatorDetail) {
        config = indicatorDetail?.label_config
      } else {
        config = indicatorLayer?.label_config
      }
      // When there is no config, no label rendered
      if (!(config?.style && config?.text)) {
        reset()
        return;
      }
      // ---------------------------------------------------------
      // LABEL
      // ---------------------------------------------------------
      if (!geometriesData) {
        renderLabel([], config)
        return;
      }

      ExecuteWebWorker(
        worker, {
          geometriesData,
          usedIndicatorsData,
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
    selectedAdminLevel
  ]);

  return null
}