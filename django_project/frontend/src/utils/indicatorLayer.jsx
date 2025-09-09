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

import { capitalize, dictDeepCopy } from "./main";
import nunjucks from "nunjucks";
import { extractCode } from "./georepo";
import { getRelatedTableData } from "./relatedTable";
import { getIndicatorDataByLayer, UpdateStyleData } from "./indicatorData";

export const SingleIndicatorType = "Single Indicator";
export const SingleIndicatorTypes = [SingleIndicatorType, "Float"];
export const MultiIndicatorType = "Multi Indicator";
export const DynamicIndicatorType = "Dynamic Indicator";
export const RelatedTableLayerType = "Related Table";
export const CompositeIndexLayerType = "Composite Index Layer";

export const defaultFields = [
  "indicator.name",
  "indicator.value",
  "indicator.label",
  "indicator.time",
  "geometry_data.admin_level",
  "geometry_data.admin_level_name",
  "geometry_data.concept_uuid",
  "geometry_data.geom_code",
  "geometry_data.name",
  "indicator.attributes",
];

export function indicatorLayerId(indicatorLayer) {
  return "layer_" + indicatorLayer.id;
}

/***
 * Return indicator layers that has behaviour like indicator data
 */
export function isIndicatorLayerLikeIndicator(indicatorLayer) {
  return [DynamicIndicatorType, CompositeIndexLayerType].includes(
    indicatorLayer.type,
  );
}

/***
 * Return indicator layers that has behaviour like indicator data
 */
export function indicatorLayersLikeIndicator(indicatorLayers) {
  return indicatorLayers.filter((indicatorLayer) =>
    isIndicatorLayerLikeIndicator(indicatorLayer),
  );
}

/***
 * Return indicators for dynamic indicator layer
 */
export function dynamicLayerIndicatorList(indicatorLayer, indicators) {
  return indicators.filter((indicator) => {
    return (
      indicatorLayer?.config.expression?.includes(indicator.shortcode) ||
      indicatorLayer?.config.expression?.includes(indicator.id)
    );
  });
}

/***
 * Return data of dynamic layer
 * The structure of context is
 * {
 *   values: {
 *     <indicator.shortcode> : value
 *   }
 * }
 */
export function dynamicLayerData(indicatorLayer, context) {
  indicatorLayer?.config.exposedVariables.map((variable) => {
    context.values[variable.field] = variable.value;
  });
  let valueData = nunjucks.renderString(indicatorLayer?.config.expression, {
    context: context,
  });
  if (!isNaN(parseFloat(valueData))) {
    valueData = parseFloat(valueData);
  }
  return valueData;
}

/***
 * Return indicators for dynamic indicator layer
 */
export function fetchDynamicLayerData(
  indicatorLayer,
  indicators,
  indicatorsData,
  geoField,
  onError,
  onSuccess,
  skipAggregate,
  updateStyle = false,
) {
  const dynamicLayerIndicators = dynamicLayerIndicatorList(
    indicatorLayer,
    indicators,
  );

  let error = "";
  let data = [];
  dynamicLayerIndicators.map((indicator) => {
    if (indicatorsData[indicator.id]?.data) {
      indicatorsData[indicator.id].data.map((row) => {
        data.push({
          admin_level: row.admin_level,
          concept_uuid: row.concept_uuid,
          date: row.date,
          geometry_code: row.geometry_code,
          value: row.value,
          id: indicator.shortcode ? indicator.shortcode : indicator.id,
        });
      });
    }
    if (indicatorsData[indicator.id].error) {
      error = indicatorsData[indicator.id].error;
    }
  });

  // If error, set error
  if (error) {
    onError(error);
  } else {
    // Get data per code
    const dataDict = {};
    data.map((row) => {
      let code = extractCode(row, geoField);
      if (skipAggregate) {
        code += "-" + row.date;
      }
      if (!dataDict[code]) {
        dataDict[code] = {
          admin_level: null,
          concept_uuid: null,
          date: null,
          geometry_code: null,
          values: {},
        };
      }
      dataDict[code].admin_level = row.admin_level;
      dataDict[code].concept_uuid = row.concept_uuid;
      dataDict[code].date = row.date;
      dataDict[code].geometry_code = row.geometry_code;
      dataDict[code].values[row.id] = row.value;
    });

    // Construct data
    let response = [];
    for (const [key, value] of Object.entries(dataDict)) {
      response.push({
        admin_level: value.admin_level,
        concept_uuid: value.concept_uuid,
        date: value.date,
        geometry_code: value.geometry_code,
        value: dynamicLayerData(indicatorLayer, value),
      });
    }
    if (updateStyle) {
      response = UpdateStyleData(response, indicatorLayer);
    }
    onSuccess(response);
  }
}

/**
 * Return layer data
 */
export function getLayerData(
  indicatorsData,
  relatedTableData,
  indicatorLayer,
  referenceLayer,
  ignoreRT,
) {
  const data = [];
  indicatorLayer.indicators?.map((indicator) => {
    const indicatorData = getIndicatorDataByLayer(
      indicator.id,
      indicatorsData,
      indicatorLayer,
      referenceLayer,
    );
    if (indicatorData) {
      data.push(indicatorData);
    }
  });
  if (indicatorsData[indicatorLayerId(indicatorLayer)]) {
    data.push(indicatorsData[indicatorLayerId(indicatorLayer)]);
  }
  if (!ignoreRT) {
    indicatorLayer.related_tables?.map((obj) => {
      if (relatedTableData[obj.id]) {
        data.push(relatedTableData[obj.id]);
      }
    });
  }
  return data;
}

/**
 * Return if layer has data
 */
export function indicatorHasData(indicatorsData, indicator) {
  let hasData = false;
  if (indicatorsData[indicator.id]?.fetched) {
    hasData = true;
  }
  return hasData;
}

/**
 * Return layer data
 */
export function getLayerDataCleaned(
  indicatorsData,
  relatedTableData,
  indicatorLayer,
  selectedGlobalTime,
  geoField,
  filteredGeometries,
  referenceLayer,
  adminLevel,
) {
  indicatorsData = dictDeepCopy(indicatorsData);
  relatedTableData = dictDeepCopy(relatedTableData);
  let data = getLayerData(
    indicatorsData,
    relatedTableData,
    indicatorLayer,
    referenceLayer,
    true,
  );
  indicatorLayer.related_tables?.map((obj) => {
    if (relatedTableData[obj.id]) {
      const { rows } = getRelatedTableData(
        relatedTableData[indicatorLayer.related_tables[0].id]?.data,
        indicatorLayer.config,
        selectedGlobalTime,
        geoField,
        true,
        adminLevel,
      );
      data.push({
        data: rows,
      });
    }
  });

  if (filteredGeometries && Array.isArray(data[0]?.data)) {
    data[0].data = data[0].data.filter((row) =>
      filteredGeometries.includes(row.concept_uuid),
    );
  }
  return data;
}

/**
 *
 * @param indicatorsData
 * @param relatedTableData
 * @param indicatorLayers
 * @param referenceLayer
 * @returns {boolean}
 */
export function allLayerDataIsReady(
  indicatorsData,
  relatedTableData,
  indicatorLayers,
  referenceLayer,
) {
  let done = true;
  indicatorLayers.map((indicatorLayer) => {
    getLayerData(
      indicatorsData,
      relatedTableData,
      indicatorLayer,
      referenceLayer,
    ).map((data) => {
      if (data?.fetching) {
        done = false;
      }
    });
  });
  return done;
}

/**
 * Data fields default
 */
export function dataFieldsDefault() {
  return defaultFields.map((field, idx) => {
    let fieldName = field.split(".")[1];
    if (field === "indicator.name") {
      fieldName = "indicator";
    }
    if (field === "indicator.time") {
      fieldName = "date";
    }
    return {
      name: "context.current." + field,
      alias: capitalize(fieldName),
      visible:
        field.includes("geometry_data") || field.includes("attributes")
          ? false
          : true,
      type: field.includes("date") ? "date" : "string",
      order: idx,
    };
  });
}

/**
 * Return reference layer of indicator layer
 */
export function referenceLayerIndicatorLayer(referenceLayer, indicatorLayer) {
  return indicatorLayer?.level_config?.referenceLayer
    ? indicatorLayer?.level_config?.referenceLayer
    : referenceLayer;
}

/** Return list of indicator by expression */
export function getIndicatorsOfIndicatorLayers(layer, indicators) {
  let _indicators = layer?.indicators ? layer?.indicators : [];
  if (isIndicatorLayerLikeIndicator(layer) && indicators) {
    _indicators = indicators.filter((indicator) =>
      layer?.config.expression?.includes(indicator.shortcode),
    );
  }
  return _indicators;
}
