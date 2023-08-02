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

import { fetchingData } from "../../../../Requests";

import {
  DASHBOARD_ACTION_NAME,
  DASHBOARD_ACTION_TYPE_FILTERS_ALLOW_MODIFY,
  DASHBOARD_ACTION_TYPE_UPDATE,
  DASHBOARD_ACTION_TYPE_UPDATE_GEOFIELD,
  DASHBOARD_ACTION_TYPE_UPDATE_PROPS,
  DASHBOARD_ACTION_TYPE_UPDATE_SHARE,
  DASHBOARD_ACTION_TYPE_UPDATE_STRUCTURE
} from './index'
import { dictDeepCopy } from "../../../../utils/main";
import { dataFieldsDefault } from "../../../../utils/indicatorLayer";
import { updateColorPaletteData } from "../../../../utils/Style";

const REQUEST_DASHBOARD = 'REQUEST/' + DASHBOARD_ACTION_NAME;
const RECEIVE_DASHBOARD = 'RECEIVE/' + DASHBOARD_ACTION_NAME;


/**
 * Request dashboard data.
 */
function request() {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: REQUEST_DASHBOARD
  };
}

const groupDefault = {
  'group': '',
  'children': []
}

/**
 * Receive response dashboard data.
 */
function receive(data, error = null) {
  if (data) {
    if (!data.filtersAllowModify) {
      data.filtersAllowModify = data.filters_allow_modify
      delete data.filters_allow_modify
    }

    if (!data.referenceLayer) {
      data.referenceLayer = data.reference_layer
      delete data.reference_layer
    }

    if (!data.geoField) {
      data.geoField = data.geo_field
      delete data.geo_field
    }

    if (!data.indicatorLayers) {
      data.indicatorLayers = data.indicator_layers
      data.indicatorLayers.map(layer => {
        if (!layer.data_fields) {
          layer.data_fields = dataFieldsDefault()
        }
      })
      delete data.indicator_layers
    }
    data.indicatorLayersStructure = dictDeepCopy(groupDefault)
    if (data.indicator_layers_structure) {
      data.indicatorLayersStructure = data.indicator_layers_structure
    }
    delete data.indicator_layers_structure

    if (!data.contextLayers) {
      data.contextLayers = data.context_layers
      delete data.context_layers
    }
    data.contextLayersStructure = dictDeepCopy(groupDefault)
    if (data.context_layers_structure) {
      data.contextLayersStructure = data.context_layers_structure
    }
    delete data.context_layers_structure

    if (!data.basemapsLayers) {
      data.basemapsLayers = data.basemaps_layers
      delete data.basemaps_layers
    }
    data.basemapsLayersStructure = dictDeepCopy(groupDefault)
    if (data.basemaps_layers_structure) {
      data.basemapsLayersStructure = data.basemaps_layers_structure
    }
    delete data.basemaps_layers_structure

    data.widgetsStructure = dictDeepCopy(groupDefault)
    if (data.widgets_structure) {
      data.widgetsStructure = data.widgets_structure
    }
    delete data.widgets_structure
    if (!data.relatedTables) {
      data.relatedTables = data.related_tables
      delete data.related_tables
    }
    if (!data.levelConfig) {
      data.levelConfig = data.level_config
      delete data.level_config
    }
  }

  return {
    name: DASHBOARD_ACTION_NAME,
    type: RECEIVE_DASHBOARD,
    data,
    error,
    receivedAt: Date.now()
  };
}

/**
 * Fetching dashboard data.
 */
export function fetch(dispatch) {
  fetchingData(
    urls.dashboardData, {}, {}, function (response, error) {
      fetchingData(
        // Fetch palette color first
        `/api/color/palette/list`,
        {}, {}, (palettes, paletteError) => {
          updateColorPaletteData(palettes)
          const recError = !error && paletteError ? paletteError : error
          dispatch(receive(response, recError))
        }
      )
    }
  )
  return request();
}

/**
 * Update dashboard data.
 * @param {object} payload Dashboard data.
 */
export function update(payload) {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: DASHBOARD_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

/**
 * Update dashboard data by new json.
 * @param {object} payload New data.
 */
export function updateProps(payload) {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: DASHBOARD_ACTION_TYPE_UPDATE_PROPS,
    payload: payload
  };
}

/**
 * Update dashboard permission.
 * @param {object} payload Dashboard permission.
 */
export function updatePermission(payload) {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: DASHBOARD_ACTION_TYPE_UPDATE_SHARE,
    payload: payload
  };
}

/**
 * Update filters allow modify.
 */
export function updateFiltersAllowModify() {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: DASHBOARD_ACTION_TYPE_FILTERS_ALLOW_MODIFY
  };
}

/**
 * Change geofield
 */
export function changeGeoField(geoField) {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: DASHBOARD_ACTION_TYPE_UPDATE_GEOFIELD,
    payload: {
      geoField: geoField
    }
  };
}

/**
 * Change updateStructure
 */
export function updateStructure(key, structure) {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: DASHBOARD_ACTION_TYPE_UPDATE_STRUCTURE,
    payload: {
      key: key,
      structure: structure
    }
  };
}

export default {
  fetch,
  update,
  updateProps,
  updateFiltersAllowModify,
  updatePermission,
  changeGeoField,
  updateStructure
}