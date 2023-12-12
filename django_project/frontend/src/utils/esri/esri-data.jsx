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
   Context Layers SELECTOR
   ========================================================================== */

import React from 'react';
import { fetchJSON } from '../../Requests'
import { hexToRGB, jsonToUrlParams } from '../main'
import parseArcRESTStyle from './esri-style'

export default class EsriData {
  constructor(name, url, params, options, style, onEachFeature) {
    const urls = url.split('?')
    if (urls[1]) {
      let updatedParams = urls[1].split('&')
      updatedParams.map(param => {
        const split = param.split('=')
        const value = split.splice(1);
        params[split[0]] = value.join('=')
      })
    }

    this.name = name;
    this.url = urls[0];
    this.data = null;
    this.params = params;

    // for the options
    if (!options) {
      options = {}
    }
    this.token = options.token;
    this.username = options.username;
    this.password = options.password;
    this.layer = null;
    this.defaultStyle = style;
    this.onEachFeature = onEachFeature;
  }

  preFetch(url) {
    /**
     * Prepare fetch request headers.
     * Either a key/token or user/pass.
     *
     * TODO currently only tested for ArcREST token. Basic auth for WFS needs work.
     * @param  {string} url URL that will be requested
     * @return {array}     str url and fetch options (including GET method and headers)
     */
    let options = { method: 'GET', mode: "cors" }
    if (this.token) {
      url += `&token=${this.token}`
    } else if (this.username && this.password) {
      options['headers'] = new Headers({
        'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`)
      })
    }
    return [url, options]
  }


  async load() {
    /**
     * Fetch the drawing info from the service before we can load features
     * ESRI Alpha is scaled up tp 255 - use maxTrans ceiling
     * Return esri data
     */
    const that = this;
    const urls = this.url.split('?')
    const params = JSON.parse(JSON.stringify(this.params))
    params['f'] = 'json'
    const url = urls[0] + '?' + jsonToUrlParams(params)
    return fetchJSON(...this.preFetch(url))
      .then(data => {
        if (data.error) {
          return {
            layer: null,
            error: data.error.message ? data.error.message : data.error.details ? data.error.details : data.error
          }
        }
        if (data.drawingInfo === undefined) {
          if (data.type === "Raster Layer" || (data.layers && data.layers[0] && data.layers[0].type === "Raster Layer")) {
            return {
              layer: null,
              error: 'Drawing info is empty'
            }
          }
        }
        this.data = data;
        return {
          layer: this,
          error: null
        }
      })
      .catch(error => {
        return {
          layer: null,
          error: error.details ? error.details : error
        }
      })
  }

  /**
   * Add Legend
   */
  getLegend() {
    const style = this.defaultStyle ? this.defaultStyle : parseArcRESTStyle(this.data);
    if (!style) {
      return null
    }
    const that = this;
    let legend = '';

    /** LINE LEGEND **/
    const line = (styleData, label) => {
      const color = hexToRGB(styleData.color, 1);
      return '<tr>' +
        `<td><div class="line" style="width: 30px; height: 2px; background-color: ${color};"></div></td>` +
        `<td>${label ? label : ""}</td>` +
        '</tr>'
    }

    /** CIRCLE LEGEND **/
    const circle = (styleData, label) => {
      const size = parseInt(styleData.radius) + 4;
      const fillColor = hexToRGB(styleData.fillColor, styleData.fillOpacity);
      const outlineColor = styleData.color;
      const weight = styleData.weight;
      return '<tr>' +
        `<td><div class="circle" style="width: ${size}px; height: ${size}px; background-color: ${fillColor};border: ${weight ? weight : 1}px solid ${outlineColor}"></div></td>` +
        `<td>${label ? label : ""}</td>` +
        '</tr>'
    }

    /** SQUARE LEGEND **/
    const square = (styleData, label) => {
      const size = styleData.radius ? parseInt(styleData.radius) + 4 : 10;
      const fillColor = hexToRGB(styleData.fillColor, styleData.fillOpacity);
      const outlineColor = styleData.color;
      const weight = styleData.weight;
      return '<tr>' +
        `<td><div class="square" style="width: ${size}px; height: ${size}px; background-color: ${fillColor};border: ${weight ? weight : 1}px solid ${outlineColor}"></div></td>` +
        `<td>${label ? label : ""}</td>` +
        '</tr>'
    }

    /** ICON LEGEND **/
    const icon = (styleData, label) => {
      const url = styleData.iconUrl
      const size = styleData.iconSize ? styleData.iconSize : [0, 0]

      return '<tr>' +
        `<td><img src="${url}" width="${size[0]}" height="${size[1]}"></td>` +
        `<td>${label ? label : ""}</td>` +
        '</tr>'
    }
    switch (style.geometryType) {
      // This is for esriGeometryPolyline
      case "esriGeometryPolyline": {
        if (style.classifications) {
          style.classifications.forEach(function (classification, index) {
            legend += line(classification.style.style, classification.label)
          });
        } else {
          legend += line(style.style.style, that.name)
        }
        break;
      }
      // This is for polygon
      case "esriGeometryPolygon": {
        if (style.classifications) {
          style.classifications.forEach(function (classification, index) {
            legend += square(classification.style.style, classification.label)
          });
        } else {
          legend += square(style.style.style, that.name)
        }
        break;
      }
      // This is for line
      case "esriGeometryPolyline": {
        if (style.classifications) {
          style.classifications.forEach(function (classification, index) {
            const color = classification.style.style.color;
            const width = classification.style.style.width * 2;
            legend += '' +
              '<tr>' +
              `<td><div class="line" style="height: ${width}px; background-color: ${color}"></div></td>` +
              `<td>${classification.label}</td>` +
              '</tr>'
          });
        }
        break;
      }
      // This is for point
      case 'esriGeometryPoint': {
        if (style.classifications) {
          style.classifications.forEach(function (classification, index) {
            const label = style.classifications.length === 1 ? that.name : classification.label;
            switch (classification.style.type) {
              case 'circle': {
                legend += circle(classification.style.style, label)
                break
              }
              case 'square': {
                legend += square(classification.style.style, label)
                break
              }
              case 'icon':
                legend += icon(classification.style.style, label)
                break
            }
          });
        } else {
          switch (style.style.type) {
            case 'circle': {
              legend += circle(style.style.style, that.name)
              break
            }
            case 'square': {
              legend += square(style.style.style, that.name)
              break
            }
            case 'icon':
              legend += icon(style.style.style, that.name)
              break
          }
        }
        break;
      }
    }
    return `<table>${legend}</table>`;
  }
}