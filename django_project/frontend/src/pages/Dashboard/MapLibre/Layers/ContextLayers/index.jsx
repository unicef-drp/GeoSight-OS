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
   CONTEXT LAYER
   ========================================================================== */

import React, { Fragment, useEffect } from 'react';
import { centroid as turfCentroid } from '@turf/turf';
import { useSelector } from "react-redux";
import { hasLayer, hasSource, removeLayer, removeSource } from "../../utils";
import {arcGisLayer, geojsonLayer, rasterTileLayer} from "../../LayerType"
import { dictDeepCopy } from "../../../../../utils/main";
import { popupTemplate } from "../../Popup";
import {
  dataStructureToListData
} from "../../../../../components/SortableTreeForm/utilities";
import vectorTileLayer from "../../LayerType/VectorTile";
import relatedTableLayer from "../../LayerType/RelatedTable";

const ID = `context-layer`
const markersContextLayers = {}
const onLoadFunctions = {}

/**
 * Remove source and layer
 */
function removeLayers(map, id) {
  if (!map) {
    return
  }
  const layers = map.getStyle().layers.filter(layer => layer.id.includes(id + '-') || layer.id === id)
  layers.map(layer => {
    removeLayer(map, layer.id)
  })
  // Remove marker
  markersContextLayers[id]?.map(marker => {
    marker.remove();
  })
  markersContextLayers[id] = []
}

/**
 * Remove source and layer
 */
function removeSourceAndLayers(map, id) {
  removeLayers(map, id)
  const sources = Object.keys(map.getStyle().sources).filter(source => source.includes(id))
  sources.map(source => {
    removeSource(map, source)
  })
}


/*** For popup **/
const popupFeature = (featureProperties, name, fields, defaultField) => {
  let properties = dictDeepCopy(featureProperties)
  if (defaultField?.length) {
    fields = defaultField
  }
  if (fields) {
    fields.map(field => {
      if (field.visible !== false) {
        if (field.name) {
          properties[field.alias] = featureProperties[field.name]
          if (field.type === 'date') {
            try {
              properties[field.alias] = new Date(featureProperties[field.name]).toString()
            } catch (err) {

            }
          }
          if (field.name !== field.alias) {
            delete properties[field.name]
          }
        }
      } else {
        if (properties[field.name] !== undefined) {
          delete properties[field.name]
        }
      }
    })

    let newProperties = {}
    fields.forEach((field, idx) => {
      newProperties[field.alias] = properties[field.alias]
    })

    return popupTemplate(null, newProperties, {
      name: name,
      color: '#eee'
    })
  }
}

/**
 * Render label of data
 */
export function renderLabel(id, contextLayerData, contextLayer, map) {
  if (!contextLayerData?.data_fields) {
    return
  }
  const labels = contextLayerData.data_fields.filter(field => field.as_label)
  if (labels && labels.length && contextLayerData?.label_styles) {
    // Add label source
    const idLabel = id + '-label'
    if (!hasSource(map, idLabel)) {
      map.addSource(idLabel, {
        'type': 'geojson',
        'data': {
          type: 'FeatureCollection',
          features: []
        }
      });
    }

    // Add layer
    if (!hasLayer(map, idLabel)) {
      let minZoom = 0
      let maxZoom = 34
      const layout = {
        'text-anchor': 'bottom',
        'text-size': 14,
        'text-offset': [0, -1]
      }
      const paint = {
        'text-halo-blur': 2
      }
      const style = contextLayerData.label_styles
      minZoom = style.minZoom ? style.minZoom : minZoom
      maxZoom = style.maxZoom ? style.maxZoom : maxZoom
      paint['text-color'] = style.fontColor
      if (style.fontFamily) {
        const font = style.fontFamily.split(',')[0].replaceAll('"', '')
        layout['text-font'] = [font, font]
      } else {
        layout['text-font'] = ['Arial', 'Arial']
      }
      layout['text-size'] = style.fontSize
      paint['text-halo-color'] = style.haloColor
      paint['text-halo-width'] = style.haloWeight ? 1 : 0

      const textField = ['format']
      labels.map((label, idx) => {
        textField.push(['get', label.name])
        textField.push({})
        if (idx < labels - 1) {
          textField.push('\n')
          textField.push({})
        }
      })
      layout['text-field'] = textField
      map.addLayer(
        {
          id: idLabel,
          type: 'symbol',
          source: idLabel,
          filter: ['==', '$type', 'Point'],
          layout: layout,
          paint: paint,
          maxzoom: maxZoom,
          minzoom: minZoom
        }
      );
    }

    // For onload layer
    if (!onLoadFunctions[id]) {
      onLoadFunctions[id] = (e) => {
        if (e.sourceId === id && e?.source?.data?.features?.length) {
          const features = dictDeepCopy(e?.source?.data?.features)
          features.map(feature => {
            const centroid = turfCentroid({
              type: 'FeatureCollection',
              features: [feature]
            });
            feature.geometry = centroid.geometry
          })

          // Update the source
          map.getSource(idLabel).setData({
            type: 'FeatureCollection',
            features: features
          });
        }
      }
    }
    map.off('sourcedata', onLoadFunctions[id]);
    map.on('sourcedata', onLoadFunctions[id]);
  }
}

/**
 * Context layer rendering data
 */
export function contextLayerRendering(id, contextLayerData, contextLayer, map, contextLayerOrder) {
  if (map) {
    if (contextLayer?.layer && !hasLayer(map, id)) {
      const { layer, layer_type } = contextLayer
      switch (layer_type) {
        case 'Geojson': {
          const markers = geojsonLayer(map, id, layer, featureProperties => {
            return popupFeature(
              featureProperties, contextLayerData.name, [], contextLayerData.data_fields
            )
          })
          markersContextLayers[id] = markers
          break;
        }
        case 'Raster Tile': {
          rasterTileLayer(map, id, layer)
          break;
        }
        case 'ARCGIS': {
          arcGisLayer(map, id, layer, contextLayerData, (featureProperties, arcgisField) => {
            return popupFeature(
              featureProperties, contextLayerData.name, arcgisField, contextLayerData.data_fields
            )
          }, contextLayerOrder)
          renderLabel(id, contextLayerData, contextLayer, map)
          break;
        }
        case 'Vector Tile': {
          removeLayers(map, id)
          vectorTileLayer(
            map, id, layer, contextLayerData, (featureProperties) => {
              return popupFeature(
                featureProperties, contextLayerData.name, null, Object.keys(featureProperties).map(property => {
                  return {
                    name: property,
                    alias: property,
                  }
                })
              )

            }, contextLayerOrder
          )
          break;
        }
        case 'Related Table': {
          removeLayers(map, id)
          relatedTableLayer(
            map, id, layer, contextLayerData, featureProperties => {
              return popupFeature(
                featureProperties, contextLayerData.name, null, Object.keys(featureProperties).map(property => {
                  return {
                    name: property,
                    alias: property,
                  }
                })
              )
            }, contextLayerOrder
          )
          break
        }
      }
    }
  }
}

/**
 * ReferenceLayer selector.
 */
export function ContextLayer({ contextLayerData, map, contextLayerOrder }) {
  const { contextLayersShow } = useSelector(state => state.map);
  const contextLayer = useSelector(state => state.map?.contextLayers[contextLayerData.id]);
  const id = ID + '-' + contextLayerData.id

  /** CONTEXT LAYER CHANGED */
  useEffect(() => {
    if (map && contextLayersShow) {
      contextLayerRendering(id, contextLayerData, contextLayer, map, contextLayerOrder)
    } else {
      removeLayers(map, id)
    }
  }, [map, contextLayer, contextLayersShow]);
  return ""
}

/**
 * ReferenceLayer selector.
 */
export default function ContextLayers({ map }) {
  const {
    contextLayers,
    contextLayersStructure
  } = useSelector(state => state.dashboard.data);
  const contextLayersData = useSelector(state => state.map?.contextLayers);
  const contextLayerOrder = dataStructureToListData(contextLayers, contextLayersStructure).filter(row => row?.id).map(row => row?.id)
  contextLayerOrder.reverse()

  /** Remove context layers when not in selected data */
  useEffect(() => {
    contextLayers.map(contextLayerData => {
      const id = ID + '-' + contextLayerData.id
      if (!contextLayersData[contextLayerData.id]) {
        removeLayers(map, id)
      }
    })
  }, [contextLayers, contextLayersData]);

  return <Fragment>{
    contextLayers ?
      contextLayers.map(contextLayer => {
        return <ContextLayer
          key={contextLayer.id}
          contextLayerData={contextLayer}
          map={map}
          contextLayerOrder={contextLayerOrder}
        />
      }) : ""
  }</Fragment>
}
