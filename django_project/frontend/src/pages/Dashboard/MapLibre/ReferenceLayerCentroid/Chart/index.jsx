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
 * __date__ = '29/07/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Geometry Center
   ========================================================================== */

import { addPopupEl } from "../../utils";
import $ from "jquery";
import maplibregl from "maplibre-gl";
import Chart from 'chart.js/auto';
import { popupTemplate } from "../../Popup";

let charts = {}
let markers = []
let chartLastConfig = []


/** Resetting **/
export const resetCharts = () => {
  for (const [code, chart] of Object.entries(charts)) {
    chart.clear();
    $(`${code}-chart`).remove()
  }
  markers.map(marker => marker.remove())
  markers = []
}


export const renderChart = (map, features, lastConfig, config) => {
  if (!config.indicatorShow) {
    resetCharts();
    return;
  }
  if (JSON.stringify(config) === JSON.stringify(lastConfig)) {
    return;
  } else {
    resetCharts()
  }
  chartLastConfig = config

  /** Render charts to Map */
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
      .setHTML(`<div id="${code}-wrapper" class="centroid-chart" style="display: block; box-sizing: border-box; height: ${size}px; width: ${size}px;"><canvas id="${code}-chart" width="${size}" height="${size}" data-size="${size}"></div>`)
      .addTo(map);
    markers.push(popup)

    // Create charts
    setTimeout(function () {
      // Don't render if config is not same
      if (JSON.stringify(config) !== JSON.stringify(chartLastConfig)) {
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
export const renderPin = (map, features, indicatorLayer, lastConfig, config) => {
  if (!config.indicatorShow) {
    resetCharts();
    return;
  }
  if (JSON.stringify(config) === JSON.stringify(lastConfig)) {
    return;
  } else {
    resetCharts()
  }
  chartLastConfig = config
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
      .setHTML(`<div id="${code}-pin" class="pins centroid-chart">${children.join('')}</div>`)
      .addTo(map)
    markers.push(popup)
  })
}