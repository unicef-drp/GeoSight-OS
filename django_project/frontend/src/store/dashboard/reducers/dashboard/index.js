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

import { APIReducer } from '../../../reducers_api';
import indicatorReducer, { INDICATOR_ACTION_NAME } from '../indicators'
import indicatorLayersReducer, {
  INDICATOR_LAYERS_ACTION_NAME
} from '../indicatorLayers'
import basemapsReducer, { BASEMAP_ACTION_NAME } from '../basemap'
import widgetsReducer, { WIDGET_ACTION_NAME } from "../widgets";
import extentReducer, { EXTENT_DEFAULT_ACTION_NAME } from "../extent";
import filtersReducer, { FILTERS_ACTION_NAME } from "../filters";
import relatedTableReducer, {
  RELATED_TABLE_ACTION_NAME
} from "../relatedTable";
import referenceLayerReducer, {
  REFERENCE_LAYER_ACTION_NAME
} from '../referenceLayer'
import contextLayersReducer, {
  CONTEXT_LAYER_ACTION_NAME
} from '../contextLayers'
import dashboardToolReducer, {
  DASHBOARD_TOOL_ACTION_NAME
} from "../dashboardTool";

/**
 * DASHBOARD REQUEST reducer
 */
export const DASHBOARD_ACTION_NAME = 'DASHBOARD';
export const DASHBOARD_ACTION_TYPE_UPDATE = 'DASHBOARD/UPDATE';
export const DASHBOARD_ACTION_TYPE_UPDATE_PROPS = 'DASHBOARD/UPDATE_PROPS';
export const DASHBOARD_ACTION_TYPE_FILTERS_ALLOW_MODIFY = 'DASHBOARD/FILTERS_ALLOW_MODIFY';
export const DASHBOARD_ACTION_TYPE_UPDATE_SHARE = 'DASHBOARD/UPDATE_SHARE';
export const DASHBOARD_ACTION_TYPE_UPDATE_GEOFIELD = 'DASHBOARD/UPDATE_GEOFIELD';
export const DASHBOARD_ACTION_TYPE_UPDATE_STRUCTURE = 'DASHBOARD/UPDATE_STRUCTURE';

const dashboardInitialState = {
  fetching: false,
  fetched: false,
  error: null,
  data: {}
};

export default function dashboardReducer(
  state = dashboardInitialState, action
) {
  switch (action.name) {
    case DASHBOARD_ACTION_NAME: {
      switch (action.type) {
        case DASHBOARD_ACTION_TYPE_UPDATE: {
          return {
            ...state,
            data: action.payload
          }
        }
        case DASHBOARD_ACTION_TYPE_UPDATE_PROPS: {
          return {
            ...state,
            data: {
              ...state.data,
              ...action.payload
            }
          }
        }
        case DASHBOARD_ACTION_TYPE_FILTERS_ALLOW_MODIFY: {
          return {
            ...state,
            data: {
              ...state.data,
              filtersAllowModify: !state.data.filtersAllowModify
            }
          }
        }
        case DASHBOARD_ACTION_TYPE_UPDATE_SHARE: {
          return {
            ...state,
            data: {
              ...state.data,
              permission: action.payload
            }
          }
        }
        case DASHBOARD_ACTION_TYPE_UPDATE_GEOFIELD: {
          const { geoField } = action.payload
          return {
            ...state,
            data: {
              ...state.data,
              geoField: geoField
            }
          }
        }
        case DASHBOARD_ACTION_TYPE_UPDATE_STRUCTURE: {
          const { key, structure } = action.payload
          state.data[key] = structure
          return {
            ...state,
            data: {
              ...state.data
            }
          }
        }
        default: {
          return APIReducer(state, action, DASHBOARD_ACTION_NAME)
        }
      }
    }

    /** INDICATOR REDUCER **/
    case INDICATOR_ACTION_NAME: {
      const newIndicator = indicatorReducer(state.data.indicators, action);
      if (newIndicator !== state.data.indicators) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          indicators: newIndicator
        }
        return newState;
      }
      return state
    }

    /** INDICATOR LAYERS REDUCER **/
    case INDICATOR_LAYERS_ACTION_NAME: {
      const indicatorLayers = indicatorLayersReducer(
        state.data.indicatorLayers, action, state.data
      );
      if (indicatorLayers !== state.data.indicatorLayers) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          indicatorLayers: indicatorLayers
        }
        return newState;
      }
      return state
    }

    /** EXTENT REDUCER **/
    case EXTENT_DEFAULT_ACTION_NAME: {
      const data = extentReducer(state.data.extent, action);
      if (data !== state.data.extent) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          extent: data
        }
        return newState;
      }
      return state
    }

    /** FILTERS REDUCER **/
    case FILTERS_ACTION_NAME: {
      const data = filtersReducer(state.data.filters, action);
      if (data !== state.data.filters) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          filters: data
        }
        return newState;
      }
      return state
    }

    /** BASEMAP REDUCER **/
    case BASEMAP_ACTION_NAME: {
      const data = basemapsReducer(
        state.data.basemapsLayers, action, state.data
      );
      if (data !== state.data.basemapsLayers) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          basemapsLayers: data
        }
        return newState;
      }
      return state
    }

    /** CONTEXT LAYER REDUCER **/
    case CONTEXT_LAYER_ACTION_NAME: {
      const data = contextLayersReducer(
        state.data.contextLayers, action, state.data
      );
      if (data !== state.data.contextLayers) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          contextLayers: data
        }
        return newState;
      }
      return state
    }

    /** RELATED TABLE REDUCER **/
    case RELATED_TABLE_ACTION_NAME: {
      const data = relatedTableReducer(state.data.relatedTables, action);
      if (data !== state.data.relatedTables) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          relatedTables: data
        }
        return newState;
      }
      return state
    }

    /** REFERENCE LAYER REDUCER **/
    case REFERENCE_LAYER_ACTION_NAME: {
      const data = referenceLayerReducer(state.data.referenceLayer, action);
      if (data !== state.data.referenceLayer) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          referenceLayer: data
        }
        return newState;
      }
      return state
    }

    // WIDGET REDUCER
    case WIDGET_ACTION_NAME: {
      const newWidgets = widgetsReducer(
        state.data.widgets, action, state.data
      );
      if (newWidgets !== state.data.widgets) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          widgets: newWidgets
        }
        return newState;
      }
      return state
    }

    /** TOOLS REDUCER **/
    case DASHBOARD_TOOL_ACTION_NAME: {
      const data = dashboardToolReducer(state.data.tools, action);
      if (data !== state.data.tools) {
        const newState = { ...state }
        newState.data = {
          ...newState.data,
          tools: data
        }
        return newState;
      }
      return state
    }
    default:
      return state
  }
}