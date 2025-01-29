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

import { getRelatedTableData } from "./relatedTable";
import { getIndicatorDataByLayer, UpdateStyleData } from "./indicatorData";
import { extractCode, GeorepoUrls } from "./georepo";
import {
  indicatorLayerId,
  isIndicatorLayerLikeIndicator
} from "./indicatorLayer";
import { dynamicStyleTypes, returnLayerStyleConfig } from "./Style";
import { dictDeepCopy } from "./main";
import { InternalReferenceDatasets } from "./urls";
import {
  FILL_LAYER_ID_KEY
} from "../pages/Dashboard/MapLibre/Layers/ReferenceLayer";
import { union } from "@turf/turf";

const temporary = {}

/**
 * Return value by geometry
 */
export function returnValueByGeometry(
  layer, indicators, indicatorsData, relatedTableData,
  selectedGlobalTime, geoField, filteredGeometries, referenceLayer, selectedAdminLevel
) {
  let identifier = JSON.stringify(layer) + JSON.stringify(indicators) + JSON.stringify(indicatorsData) + JSON.stringify(relatedTableData) + JSON.stringify(selectedGlobalTime) + JSON.stringify(geoField) + JSON.stringify(filteredGeometries)
  if (selectedAdminLevel) {
    identifier += selectedAdminLevel
  }
  const temp = temporary[identifier]
  if (temp) {
    return temp
  }
  indicatorsData = dictDeepCopy(indicatorsData)
  relatedTableData = dictDeepCopy(relatedTableData)

  let allData = []
  if (Object.keys(layer).length) {
    const id = indicatorLayerId(layer)
    // This is for non indicators
    if (indicatorsData[id]?.fetched) {
      indicatorsData[id]?.data.forEach(function (data) {
        data.indicatorLayer = layer
        allData.push(data);
      })
    }
    // This is for indicators
    if (layer.indicators.length) {
      layer.indicators.map(indicatorLayer => {
        const indicator = indicators.find(indicator => indicatorLayer.id === indicator.id)
        const indicatorData = getIndicatorDataByLayer(indicator.id, indicatorsData, layer, referenceLayer)
        if (indicator && indicatorData?.fetched) {
          indicatorData?.data.forEach(function (data) {
            data.indicator = indicator
            allData.push(data);
          })
        }
      })
    } else if (layer.related_tables.length) {
      const { rows } = getRelatedTableData(
        relatedTableData[layer.related_tables[0].id]?.data,
        layer.config,
        selectedGlobalTime,
        geoField,
        true,
        selectedAdminLevel
      )
      if (rows) {
        const data = UpdateStyleData(rows, layer)
        data.forEach(function (rowData) {
          rowData.related_table = layer.related_tables[0]
          allData.push(rowData);
        })
      }
    }
  }

  let config = returnLayerStyleConfig(layer, indicators)
  if (dynamicStyleTypes.includes(config.style_type)) {
    if (config?.style_config?.sync_filter && filteredGeometries) {
      allData = allData.filter(row => filteredGeometries.includes(row.concept_uuid))
    }
    allData = UpdateStyleData(allData, config)
  } else if (layer.override_style) {
    allData = UpdateStyleData(allData, layer)
  }

  const byGeometry = {}
  allData.forEach(function (rowData) {
    const code = extractCode(rowData, geoField)
    if (!byGeometry[code]) {
      byGeometry[code] = []
    }
    byGeometry[code].push(rowData);
  })

  // Save to temporary
  temporary[identifier] = byGeometry
  return byGeometry
}

/**
 * Return style
 */
export function returnStyle(layer, values, noDataStyle) {
  let style = null
  if (layer?.indicators?.length === 1 || layer?.related_tables?.length === 1 || isIndicatorLayerLikeIndicator(layer)) {
    if (values) {
      const indicatorData = values[0];
      if (indicatorData) {
        style = indicatorData.style ? indicatorData.style : { hide: true }
      } else {
        style = noDataStyle;
      }
    } else {
      style = noDataStyle;
    }
  }
  return style
}

export const RefererenceLayerUrls = {
  ViewDetail: function (referenceLayerDetail) {
    const identifier = referenceLayerDetail.identifier
    if (referenceLayerDetail.is_local) {
      return InternalReferenceDatasets.detail(identifier)
    } else {
      return GeorepoUrls.ViewDetail(identifier)
    }
  }
}
/**
 * Get Feature by concept UUID
 */
export const getFeatureByConceptUUID = (map, conceptUUID) => {
  const visibleLayerIds = map.getStyle().layers.filter(
    layer => layer.id.includes(FILL_LAYER_ID_KEY)
  ).map(layer => layer.id)
  const features = map.queryRenderedFeatures({
    layers: visibleLayerIds,
    filter: ['==', ['get', 'concept_uuid'], conceptUUID]
  })
  if (!features.length) {
    return null
  }
  let mergedPolygon = features[0];
  for (let i = 1; i < features.length; i++) {
    mergedPolygon = union(mergedPolygon, features[i]);
  }
  mergedPolygon.properties = features[0].properties
  return mergedPolygon
}