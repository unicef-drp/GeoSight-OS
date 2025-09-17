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
 * __date__ = '22/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/** Selection state reducer */
/** TODO: We need to migrate all selected reducers to this **/

export const SELECTION_STATE = "SELECTION_STATE";
export const SELECTION_STATE_FILTER_ADD_INDICATOR =
  SELECTION_STATE + "/FILTER/ADD_INDICATOR";
export const SELECTION_STATE_FILTER_REMOVE_INDICATOR =
  SELECTION_STATE + "/FILTER/REMOVE_INDICATOR";
export const SELECTION_STATE_FILTER_ADD_INDICATOR_LAYER =
  SELECTION_STATE + "/FILTER/ADD_INDICATOR_LAYER";
export const SELECTION_STATE_FILTER_REMOVE_INDICATOR_LAYER =
  SELECTION_STATE + "/FILTER/REMOVE_INDICATOR_LAYER";
export const SELECTION_STATE_FILTER_ADD_RELATED_TABLE =
  SELECTION_STATE + "/FILTER/ADD_RELATED_TABLE";
export const SELECTION_STATE_FILTER_REMOVE_RELATED_TABLE =
  SELECTION_STATE + "/FILTER/REMOVE_RELATED_TABLE";

export const SELECTION_STATE_COMPOSITE_INDICATOR_LAYERS =
  SELECTION_STATE + "/COMPOSITE/INDICATOR_LAYERS";

export interface Props {
  filter: {
    indicatorIds: number[];
    indicatorLayerIds: number[];
    relatedTableIds: number[];
  };
  composite: {
    indicatorLayerIds: number[];
  };
}

export interface ActionProps {
  name: string;
  type: string;
  payload: any;
}

const initialState: Props = {
  filter: {
    indicatorIds: [],
    indicatorLayerIds: [],
    relatedTableIds: [],
  },
  composite: {
    indicatorLayerIds: [],
  },
};
export default function selectedAdminLevelReducer(
  state = initialState,
  action: ActionProps,
) {
  if (action.name === SELECTION_STATE) {
    switch (action.type) {
      case SELECTION_STATE_FILTER_ADD_INDICATOR: {
        return {
          ...state,
          filter: {
            indicatorIds: [...state.filter.indicatorIds, action.payload],
            indicatorLayerIds: state.filter.indicatorLayerIds,
            relatedTableIds: state.filter.relatedTableIds,
          },
        };
      }
      case SELECTION_STATE_FILTER_REMOVE_INDICATOR: {
        const index = state.filter.indicatorIds.findIndex(
          (id: number) => id === action.payload,
        );
        if (index === -1) return state;
        return {
          ...state,
          filter: {
            indicatorIds: [
              ...state.filter.indicatorIds.slice(0, index),
              ...state.filter.indicatorIds.slice(index + 1),
            ],
            indicatorLayerIds: state.filter.indicatorLayerIds,
            relatedTableIds: state.filter.relatedTableIds,
          },
        };
      }
      case SELECTION_STATE_FILTER_ADD_INDICATOR_LAYER: {
        return {
          ...state,
          filter: {
            indicatorIds: state.filter.indicatorIds,
            indicatorLayerIds: [
              ...state.filter.indicatorLayerIds,
              action.payload,
            ],
            relatedTableIds: state.filter.relatedTableIds,
          },
        };
      }
      case SELECTION_STATE_FILTER_REMOVE_INDICATOR_LAYER: {
        const index = state.filter.indicatorLayerIds.findIndex(
          (id: number) => id === action.payload,
        );
        if (index === -1) return state;
        return {
          ...state,
          filter: {
            indicatorIds: state.filter.indicatorIds,
            indicatorLayerIds: [
              ...state.filter.indicatorLayerIds.slice(0, index),
              ...state.filter.indicatorLayerIds.slice(index + 1),
            ],
            relatedTableIds: state.filter.relatedTableIds,
          },
        };
      }
      case SELECTION_STATE_FILTER_ADD_RELATED_TABLE: {
        return {
          ...state,
          filter: {
            indicatorIds: state.filter.indicatorIds,
            indicatorLayerIds: state.filter.indicatorLayerIds,
            relatedTableIds: [...state.filter.relatedTableIds, action.payload],
          },
        };
      }
      case SELECTION_STATE_FILTER_REMOVE_RELATED_TABLE: {
        const index = state.filter.relatedTableIds.findIndex(
          (id: number) => id === action.payload,
        );
        if (index === -1) return state;
        return {
          ...state,
          filter: {
            indicatorIds: state.filter.indicatorIds,
            indicatorLayerIds: state.filter.indicatorLayerIds,
            relatedTableIds: [
              ...state.filter.relatedTableIds.slice(0, index),
              ...state.filter.relatedTableIds.slice(index + 1),
            ],
          },
        };
      }
      case SELECTION_STATE_COMPOSITE_INDICATOR_LAYERS: {
        return {
          ...state,
          composite: {
            indicatorLayerIds: action.payload,
          },
        };
      }
    }
  }
  return state;
}
