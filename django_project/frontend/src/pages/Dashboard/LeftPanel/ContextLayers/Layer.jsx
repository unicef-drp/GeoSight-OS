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
   Return layer
   ========================================================================== */

import React from 'react';

import EsriData from "../../../../utils/esri/esri-data";
import { dictDeepCopy } from "../../../../utils/main";
import { popupTemplate } from "../../MapLibre/Popup";
import { createElement } from "../../MapLibre/utils";
import { Actions } from "../../../../store/dashboard";
import { fetchingData } from "../../../../Requests";
import LegendControl from "mapboxgl-legend";

import 'mapboxgl-legend/dist/style.css';
import './style.scss'

/** Vector tile layer **/
export function VectorTileLayer(
  layerData, layerFn, legendFn, errorFn, onEachFeature
) {
  // If there is url legend, use the image
  if (!layerData.url_legend) {
    legendFn(`<img src="${layerData.url_legend}"/>`)
  } else {
    try {
      const layers = JSON.parse(layerData.styles)
      const legend = new LegendControl();
      const legendHtml = []
      const blocksExist = []
      layers.filter(layer => layer.source && layer.source !== 'composite').forEach(layer => {
        const { id, layout, paint, metadata } = layer;

        // Construct all required blocks, break if none
        let paneBlocks = Object.entries({ ...layout, ...paint })
          .reduce((acc, [attribute, value]) => {
            const blocks = legend._getBlocks("Key", layer, attribute, value);
            blocks?.forEach(block => acc.push(block));
            return acc;
          }, []);
        if (paneBlocks.length <= 1) return;

        // Filter if the legend is already there
        paneBlocks = paneBlocks.filter(block => {
          const added = !blocksExist.includes(block.outerHTML)
          blocksExist.push(block.outerHTML)
          return added
        })

        const pane = createElement('details', {
          classes: ['mapboxgl-ctrl-legend-pane'],
          attributes: { open: true },
          content: [
            createElement('summary', {
              content: [
                metadata?.name || id,
              ],
            }),
            ...paneBlocks,
          ],
        });

        // Update value for case
        let outerHtml = pane.outerHTML
        for (const [key, value] of Object.entries(layer.paint)) {
          if (value[0] === 'case') {
            const paints = dictDeepCopy(value)
            paints.shift();
            let last = paints.pop();
            paints.map((paint, idx) => {
              if (idx % 2 !== 0) {
                const _case = paints[idx - 1]
                if (_case[2] !== undefined) {
                  let operator = ''
                  if (_case[0] !== '==') {
                    operator = _case[0]
                  }
                  let label = `${_case[2]}`
                  if (operator) {
                    label = `${operator} ${label}`
                  }
                  outerHtml = outerHtml.replace(`>${paint}`, `>${label}`)
                }
              }
            })
            outerHtml = outerHtml.replace(`>${last}`, `>other`)
          }
        }
        legendHtml.push(outerHtml)
      });
      legendFn('<div class="mapboxgl-ctrl-legend">' + legendHtml.join('<br/>') + '</div>')
    } catch (e) {
      console.log(e)
    }
  }
  layerData.parameters['maxNativeZoom'] = 19;
  layerData.parameters['maxZoom'] = maxZoom;
  layerFn(layerData)
}

/** Related Table layer **/
export function RelatedTableLayer(
  layerData, layerFn, legendFn, errorFn, onEachFeature
) {
  layerFn(layerData)
}

/** Raster tile layer **/
export function RasterTileLayer(
  layerData, layerFn, legendFn, errorFn, onEachFeature
) {
  if (layerData.url_legend) {
    legendFn(`<img src="${layerData.url_legend}"/>`)
  }
  layerData.parameters['maxNativeZoom'] = 19;
  layerData.parameters['maxZoom'] = maxZoom;
  layerFn(layerData)
}

/** Arcgis layer **/
export async function ArcgisLayer(
  layerData, layerFn, legendFn, errorFn, onEachFeature, objectFn
) {

  let url = layerData.url
  if (layerData.arcgis_config) {
    layerData.parameters['url'] = encodeURIComponent(layerData.url)
    url = `/api/arcgis/${layerData.arcgis_config}/proxy`
  }

  const options = {
    token: layerData.token
  };
  const esriData = new EsriData(
    layerData.name, url,
    layerData.parameters, options,
    layerData.styles, onEachFeature
  );
  esriData.load().then(output => {
    if (output.layer) {
      layerFn(output.layer);
      const legend = esriData.getLegend();
      legendFn(legend);
    } else {
      errorFn(output.error);
    }
    if (objectFn) {
      objectFn(esriData)
    }
  });
  return esriData
}

/** Geojson layer **/
export function GeojsonLayer(
  layerData, layerFn, legendFn, errorFn, onEachFeature
) {
  fetchingData(
    layerData.url, layerData.params, {}, (data) => {
      layerFn(data);
    }
  )
}

/**
 * Initiate layer from the data.
 * @param {dict} layerData Data of layer.
 * @param {Function} setLayer Set the layer.
 * @param {Function} setLegend Set the legend.
 * @param {Function} setError Set the error.
 * @param {Function} setObject Set the object.
 * @param dispatch Dispatcher.
 */
export const getLayer = function (
  layerData, setLayer,
  setLegend, setError, dispatch, setObject = null
) {
  const layerType = layerData.layer_type;

  // this is for each feature
  const onEachFeature = (feature, layer, fields) => {
    let properties = dictDeepCopy(feature.properties)
    if (layerData.data_fields.length) {
      fields = layerData.data_fields
    }
    if (fields) {
      properties = []
      const tooltip = []
      fields.map(field => {
        if (field.visible !== false) {
          properties[field.alias] = feature.properties[field.name]
          if (field.type === 'date') {
            try {
              properties[field.alias] = new Date(feature.properties[field.name]).toString()
            } catch (err) {

            }
          }
        }

        if (field.as_label) {
          tooltip.push(`<div>${feature.properties[field.name]}</div>`)
        }
      })

      if (tooltip.length) {
        const style = Object.assign({}, {
          minZoom: 0,
          maxZoom: 24,
          fontFamily: '"Rubik", sans-serif',
          fontSize: 14,
          fontColor: '#000000',
          fontWeight: 300,
          strokeColor: '#FFFFFF',
          strokeWeight: 0
        }, layerData.label_styles);

        const styles = [
          'font-size: ' + style.fontSize + 'px',
          'font-weight: ' + style.fontWeight,
          'font-family: ' + style.fontFamily + '!important',
          '-webkit-text-fill-color: ' + style.fontColor,
          '-webkit-text-stroke-color: ' + style.strokeColor,
          '-webkit-text-stroke-width: ' + style.strokeWeight + 'px',
        ]
        if (style.haloWeight) {
          styles.push(`text-shadow : 0px 0px ${style.haloWeight}px ${style.haloColor}, 0px 0px ${style.haloWeight}px ${style.haloColor}`)
        }
        layer.bindTooltip(
          `<div style='${styles.join(';')}'>
            ${tooltip.join('')}
            </div>`,
          {
            permanent: true,
            className: `Leaflet-Label ${layerData.id}`,
            direction: "top",
            offset: [0, 0],
            minZoom: style.minZoom,
            maxZoom: style.maxZoom
          }
        );
      }
    }

    layer.bindPopup(
      popupTemplate(null, properties, {
        name: layerData.name,
        color: '#eee'
      })
    );

    if (dispatch) {
      layer.on('click', function (event) {
        dispatch(
          Actions.Map.updateCenter(event.latlng)
        )
      }, this);
    }
  }
  switch (layerType) {
    case 'Raster Tile': {
      return RasterTileLayer(
        layerData,
        (layer) => setLayer(layer),
        (legend) => setLegend(legend),
        (error) => setError(error),
        onEachFeature
      )
    }
    case 'ARCGIS': {
      const ArcGisData = ArcgisLayer(
        layerData,
        (layer) => setLayer(layer),
        (legend) => setLegend(legend),
        (error) => setError(error),
        (feature, layer) => {
          return onEachFeature(feature, layer, ArcGisData?.data?.fields)
        },
        (obj) => {
          setObject ? setObject(obj) : null
        }
      )
      return ArcGisData
    }
    case 'Related Table': {
      return RelatedTableLayer(
        layerData,
        (layer) => setLayer(layer),
        (legend) => setLegend(legend),
        (error) => setError(error),
        onEachFeature
      )
    }
    case 'Geojson': {
      return GeojsonLayer(
        layerData,
        (layer) => setLayer(layer),
        (legend) => setLegend(legend),
        (error) => setError(error),
        onEachFeature
      )
    }
    case 'Vector Tile': {
      return VectorTileLayer(
        layerData,
        (layer) => setLayer(layer),
        (legend) => setLegend(legend),
        (error) => setError(error),
        onEachFeature
      )
    }
  }
}