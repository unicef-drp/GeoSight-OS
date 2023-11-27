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

import FeatureService from 'mapbox-gl-arcgis-featureserver'
import parseArcRESTStyle from "../../../../utils/esri/esri-style";
import { addPopup, hasLayer, hasSource, loadImageToMap } from "../utils";
import { toFloat } from "../../../../utils/main";

/***
 * To prevent attribution created duplicated
 */
class CustomFeatureService extends FeatureService {
  _setAttribution() {
    const attributionController = this._map._controls.find(c => '_attribHTML' in c);
    if (attributionController) {
      if (this._esriServiceOptions.setAttributionFromService && this.serviceMetadata.copyrightText.length > 0) {
        this._map.style.sourceCaches[this.sourceId]._source.attribution = this.serviceMetadata.copyrightText;
        attributionController._updateAttributions();
      }
    }
  }
}

/*** Arcgis style */
function ArcGisStyle(map, id, layer) {
  const casesByType = {}
  const lineId = id + '-line'
  const fillId = id + '-fill'
  const outlineId = id + '-outline'
  const symbolId = id + '-symbol'
  const circleId = id + '-circle'

  const { data, defaultStyle } = layer
  const style = defaultStyle ? defaultStyle : parseArcRESTStyle(data);
  if (!style) {
    return null
  }

  /**
   * Assign Cases
   */
  const assignCases = (styleType, propertyType, cases) => {
    let layerId = null
    switch (styleType) {
      case 'polygon':
        layerId = fillId
        break
      case 'circle':
        layerId = circleId
        break
      case 'icon': {
        layerId = symbolId
        break
      }
      case 'line': {
        layerId = lineId
        break
      }
      case 'outline': {
        layerId = outlineId
        break
      }
    }
    if (layerId) {
      casesByType[layerId] = casesByType[layerId] ? casesByType[layerId] : {}
      casesByType[layerId][propertyType] = casesByType[layerId][propertyType] ? casesByType[layerId][propertyType] : []
      casesByType[layerId][propertyType] = casesByType[layerId][propertyType].concat(cases)
    }
  }
  switch (style.classificationValueMethod) {
    case "noClassification":
      // No classification
    {
      const classStyle = style.style.style
      for (const [key, value] of Object.entries(classStyle)) {
        if (value) {
          const cases = [value]
          let layerType = style.style.type
          if (layerType === 'polygon') {
            if (['color', 'weight'].includes(key)) {
              layerType = 'outline'
            }
          }
          assignCases(layerType, key, cases)
        }
      }
      break
    }
    case "classExactValue":
      // For class exact value
      if (!style.multipleField) {
        style.classifications.map((classification, idx) => {
          const classStyle = classification.style.style
          for (let [key, value] of Object.entries(classStyle)) {
            if (value) {
              const cases = []
              let classValue = classification.value
              if (!isNaN(value)) {
                value = parseFloat(value)
              }
              cases.push(
                ["==", ["get", style.fieldName], classValue]
              )
              cases.push(value)
              if (!isNaN(classValue)) {
                classValue = parseFloat(classValue)
                cases.push(
                  ["==", ["get", style.fieldName], classValue]
                )
                cases.push(value)
              }
              assignCases(classification.style.type, key, cases)
            }
          }
        })
      } else {
        const createClassification = (fieldName, classValue) => {
          if (classValue !== null) {
            return [["==", ["get", fieldName], classValue]]
          } else {
            return [["==", ["get", fieldName], null]]
          }
        }
        style.classifications.map((classification, idx) => {
          const classStyle = classification.style.style
          for (let [key, value] of Object.entries(classStyle)) {
            if (value) {
              const cases = []
              let classValues = classification.value.split(',')
              let fieldNames = style.fieldName.split(',')
              let valueClassification = []
              let valueClassificationNumber = []
              if (!isNaN(value)) {
                value = parseFloat(value)
              }

              // We create condition per field name
              fieldNames.map((fieldName, idx) => {
                let classValue = classValues[idx]
                if (classValue === '<Null>') {
                  classValue = null;
                }

                // Check if by default
                valueClassification.push(["==", ["get", fieldName], classValue])

                // Check if data is number
                if (!isNaN(classValue) && classValue !== null) {
                  classValue = parseFloat(classValue)
                  valueClassificationNumber.push(["==", ["get", fieldName], classValue])
                } else {
                  valueClassificationNumber.push(["==", ["get", fieldName], classValue])
                }
              })
              // For value classification
              if (valueClassification.length === 1) {
                cases.push(valueClassification[0])
                cases.push(value)
              } else if (valueClassification.length > 1) {
                cases.push([
                  "all", ...valueClassification
                ])
                cases.push(value)
              }
              // For value classification in number format
              if (valueClassificationNumber.length === 1) {
                cases.push(valueClassificationNumber[0])
                cases.push(value)
              } else if (valueClassificationNumber.length > 1) {
                cases.push([
                  "all", ...valueClassificationNumber
                ])
                cases.push(value)
              }
              assignCases(classification.style.type, key, cases)
            }
          }
        })
      }
      break
    case "classMaxValue": {
      // For max value type
      style.classifications.map((classification, idx) => {
        const classStyle = classification.style.style
        for (const [key, value] of Object.entries(classStyle)) {
          if (value) {
            const cases = []
            let styleValue = value
            if (!isNaN(styleValue)) {
              styleValue = parseFloat(styleValue)
            }
            cases.push(
              ["<=", ["get", style.fieldName], classification.classMaxValue]
            )
            cases.push(styleValue)
            assignCases(classification.style.type, key, cases)
          }
        }
      })
      break;
    }
  }

  // Let's repaint
  for (const [layerId, values] of Object.entries(casesByType)) {
    if (style.fieldName && !style.multipleField) {
      map.setFilter(layerId, ['!=', ['get', style.fieldName], null]);
    }

    // Apply paint
    for (const [property, cases] of Object.entries(values)) {
      let paintProperty = null
      let defaultValue = 0

      // Check based on layer id and property
      switch (property) {
        case 'iconUrl':
          switch (layerId) {
            case symbolId: {
              paintProperty = 'icon-image'
              break
            }
          }
          defaultValue = ''
          break;
        case 'color':
          switch (layerId) {
            case circleId: {
              paintProperty = 'circle-stroke-color'
              break
            }
            case fillId: {
              paintProperty = 'fill-outline-color'
              break
            }
            case outlineId:
            case lineId: {
              paintProperty = 'line-color'
              break
            }
          }
          defaultValue = `rgba(0, 0, 0, 0)`
          break;
        case 'fillOpacity':
          switch (layerId) {
            case circleId: {
              paintProperty = 'circle-opacity'
              break
            }
            case fillId: {
              paintProperty = 'fill-opacity'
              break
            }
          }
          defaultValue = 0
          break;
        case 'fillColor':
          switch (layerId) {
            case circleId: {
              paintProperty = 'circle-color'
              break
            }
            case fillId: {
              paintProperty = 'fill-color'
              break
            }
          }
          defaultValue = `rgba(255, 255, 255, 0)`
          break;
        case 'radius':
          switch (layerId) {
            case circleId: {
              paintProperty = 'circle-radius'
              break
            }
          }
          defaultValue = 1
          break;
        case 'weight':
          switch (layerId) {
            case outlineId:
            case lineId: {
              paintProperty = 'line-width'
              break
            }
          }
          defaultValue = 1
          break;
      }

      // Check if paint property found
      if (paintProperty) {
        switch (paintProperty) {
          case 'icon-image': {
            // This is for images
            let paint = defaultValue
            if (cases.length === 1) {
              paint = cases[0]
              loadImageToMap(map, paint, (error, image) => {
                if (!error) {
                  const iconSize = values.iconSize
                  map.setLayoutProperty(layerId, 'icon-image', paint);
                  if (iconSize && iconSize[0]) {
                    const scale = iconSize[0][0] / image.width
                    map.setLayoutProperty(layerId, 'icon-size', scale);
                  }
                }
              })
            } else if (cases.length) {
              paint = ["case"].concat(cases).concat(defaultValue)
              const sizeCases = []
              const finish = () => {
                map.setLayoutProperty(layerId, 'icon-image', paint);
                const sizePaint = ["case"].concat(sizeCases).concat(0)
                map.setLayoutProperty(layerId, 'icon-size', sizePaint)
              }

              const next = (idx) => {
                if (idx <= cases.length) {
                  loadImagesFromCases(idx + 1)
                } else {
                  // Finish
                  finish()
                }
              }
              const loadImagesFromCases = (idx) => {
                if (idx % 2 === 1) {
                  const icon = cases[idx]
                  if (icon) {
                    loadImageToMap(map, icon, (error, image) => {
                      if (!error) {
                        const iconSize = values?.iconSize[idx]
                        if (iconSize && iconSize[0]) {
                          if (cases[idx - 1]) {
                            const scale = iconSize[0] / image.width
                            sizeCases.push(cases[idx - 1])
                            sizeCases.push(scale)
                          }
                        }
                      }
                      next(idx)
                    })
                  } else {
                    next(idx)
                  }
                } else {
                  next(idx)
                }
              }
              loadImagesFromCases(0)
            }
            break
          }
          default: {
            let paint = defaultValue
            if (cases.length === 1) {
              paint = cases[0]
              if (paintProperty.includes('opacity') || paintProperty.includes('width')) {
                paint = toFloat(paint)
              }
            } else if (cases.length) {
              paint = ["case"].concat(cases).concat(defaultValue)
            }
            map.setPaintProperty(layerId, paintProperty, paint);
            if (paintProperty === 'circle-stroke-color') {
              map.setPaintProperty(layerId, 'circle-stroke-width', 1);
            }
          }
        }
      }
    }
  }
  return null;
}

/***
 * Render geojson layer
 */
export default function arcGisLayer(map, id, data, contextLayerData, popupFeatureFn, contextLayerOrder) {
  // Create the source
  if (!data.url) {
    return
  }

  // We find the before layers
  let before = null;
  if (contextLayerOrder) {
    const contextLayerIdx = contextLayerOrder.indexOf(contextLayerData.id)
    for (let idx = 0; idx < contextLayerOrder.length; idx++) {
      if (map && idx > contextLayerIdx) {
        const currentId = 'context-layer-' + contextLayerOrder[idx] + '-line'
        if (hasLayer(map, currentId)) {
          before = currentId
          break;
        }
      }
    }
  }

  if (!hasSource(map, id)) {
    const params = Object.assign({}, data.params, {
      url: data.url,
      token: data.token,
      minZoom: 0
    })
    new CustomFeatureService(id, map, params)
  }
  const fillId = id + '-fill'
  const outlineId = id + '-outline'
  const lineId = id + '-line'
  const symbolId = id + '-symbol'
  const circleId = id + '-circle'

// And then add it as a layer to your map
  if (!hasLayer(map, fillId)) {
    map.addLayer({
      id: symbolId,
      type: 'symbol',
      source: id,
      filter: ['==', '$type', 'Point'],
      layout: {
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    }, before)
    map.addLayer({
      id: circleId,
      type: 'circle',
      source: id,
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-color': `rgba(0, 0, 0, 0)`
      }
    }, symbolId)
    map.addLayer({
      id: lineId,
      type: 'line',
      source: id,
      filter: ['==', '$type', 'LineString']
    }, circleId)
    map.addLayer({
      id: outlineId,
      type: 'line',
      source: id,
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'line-width': 0
      }
    }, lineId)
    map.addLayer({
      id: fillId,
      type: 'fill',
      source: id,
      filter: ['==', '$type', 'Polygon']
    }, outlineId)
    const popupFeature = (properties) => {
      return popupFeatureFn(properties, data?.data?.fields)
    }
    addPopup(map, lineId, popupFeature)
    addPopup(map, fillId, popupFeature)
    addPopup(map, outlineId, popupFeature)
    addPopup(map, circleId, popupFeature)
    addPopup(map, symbolId, popupFeature)
  }
  ArcGisStyle(map, id, data)
}