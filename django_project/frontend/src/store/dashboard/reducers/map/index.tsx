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

import { IndicatorLayer } from "../../../../types/IndicatorLayer";
import { Entity } from "../../../../types/Entity";

/** MAP reducer */

export const MAP_ACTION_NAME = `MAP`;

// For checking all reference layers that is being used
export const MAP_REFERENCE_LAYER_CHANGED = `MAP/REFERENCE_LAYER_CHANGED`;

// Selected basemap layer
export const MAP_CHANGE_BASEMAP = `MAP/CHANGE_BASEMAP`;

// Selected indicator layers
export const MAP_UPDATE_INDICATOR_LAYERS = `MAP/UPDATE_INDICATOR_LAYERS`;
export const MAP_ADD_INDICATOR_LAYERS = `MAP/ADD_INDICATOR_LAYERS`;
export const MAP_REMOVE_INDICATOR_LAYERS = `MAP/REMOVE_INDICATOR_LAYERS`;
export const MAP_SWITCH_INDICATOR_LAYERS = `MAP/SWITCH_INDICATOR_LAYERS`;
export const MAP_UPDATE_INDICATOR_LAYER_AT_IDX = `MAP/UPDATE_INDICATOR_LAYER_AT_IDX`;

// Context layers
export const MAP_ADD_CONTEXTLAYERS = `MAP/ADD_CONTEXTLAYERS`;
export const MAP_REMOVE_CONTEXTLAYERS = `MAP/REMOVE_CONTEXTLAYERS`;
export const MAP_REMOVE_CONTEXTLAYERS_ALL = `MAP/REMOVE_CONTEXTLAYERS_ALL`;

// Map positions
export const MAP_ZOOM = `MAP/ZOOM`;
export const MAP_POSITION = `MAP/POSITION`;
export const MAP_IS_3D_MODE = `MAP/IS_3D_MODE`;
export const MAP_CENTER = `MAP/CENTER`;
export const MAP_EXTENT = `MAP/EXTENT`;

// Layer visibility
export const MAP_INDICATOR_SHOW = `MAP/INDICATOR_SHOW`;
export const MAP_CONTEXTLAYERS_SHOW = `MAP/CONTEXTLAYERS_SHOW`;

// Layer transparency
export const MAP_UPDATE_TRANSPARENCY = `MAP/MAP_UPDATE_TRANSPARENCY`;

// Selected entities
export const MAP_UPDATE_SELECTED_ENTITIES = `MAP/UPDATE_SELECTED_ENTITIES`;

interface ContextLayerEntry {
  render: boolean;
  layer: any;
  layer_type: any;
}

interface Transparency {
  indicatorLayer: number;
  contextLayer: number;
}

interface Extent {
  value: [number, number, number, number] | null;
  triggeredBy: number | null;
}

export interface MapPosition {
  pitch?: number;
  bearing?: number;
  zoom?: number;
  center?: [number, number];
}

interface Position {
  value: Partial<MapPosition> | null;
  triggeredBy: number | null;
}

export interface MapState {
  // For checking all reference layers that is being used
  // From default project and also from overridden layer
  referenceLayers: any[];

  // Selected basemap layer
  basemapLayer: any | null;

  // Selected indicator layers
  indicatorLayers: IndicatorLayer[];

  // Selected indicator layers
  // Making this as json because we need the context layer to just show/hid
  // The source will be keep
  contextLayers: Record<string | number, ContextLayerEntry>;

  // Map positions
  zoom: number;
  position: Position;
  is3dMode: boolean;
  center: any | null;
  extent: Extent | null;

  // Is map position being forced
  force: boolean;

  // Layer visibility
  indicatorShow: boolean;
  contextLayersShow: boolean;

  // Layer transparency
  transparency: Transparency;

  // Selected entities
  selectedEntities?: Entity[];
}

interface MapAction {
  name: string;
  type: string;
  payload?: any;
  id?: string | number;
  force?: boolean;
  triggeredBy?: number;
}

const mapInitialState: MapState = {
  referenceLayers: [],
  basemapLayer: null,
  indicatorLayers: [],
  contextLayers: {},
  center: null,
  selectedEntities: [],
  extent: {
    value: null,
    triggeredBy: null,
  },
  indicatorShow: true,
  contextLayersShow: true,
  zoom: 0,
  position: { value: null, triggeredBy: null },
  is3dMode: false,
  force: false,
  transparency: {
    indicatorLayer: 100,
    contextLayer: 100,
  },
};

export default function mapReducer(
  state: MapState = mapInitialState,
  action: MapAction,
): MapState {
  if (action.name === MAP_ACTION_NAME) {
    switch (action.type) {
      // Reference layers
      case MAP_REFERENCE_LAYER_CHANGED: {
        const identifierList: any[] = [];
        const views = action.payload.filter((view: any) => {
          const found = identifierList.includes(view.identifier);
          identifierList.push(view.identifier);
          return !found;
        });
        if (JSON.stringify(state.referenceLayers) !== JSON.stringify(views)) {
          return {
            ...state,
            referenceLayers: views,
          };
        }
        break;
      }
      // Basemap
      case MAP_CHANGE_BASEMAP: {
        return {
          ...state,
          basemapLayer: action.payload,
        };
      }
      // Indicator layers
      case MAP_UPDATE_INDICATOR_LAYERS: {
        return {
          ...state,
          indicatorLayers: action.payload,
        };
      }
      case MAP_ADD_INDICATOR_LAYERS: {
        const exists = state.indicatorLayers.some(
          (l) => l.id === action.payload.id,
        );
        return {
          ...state,
          indicatorLayers: exists
            ? state.indicatorLayers.map((l) =>
                l.id === action.payload.id ? action.payload : l,
              )
            : [...state.indicatorLayers, action.payload],
        };
      }
      case MAP_REMOVE_INDICATOR_LAYERS: {
        return {
          ...state,
          indicatorLayers: state.indicatorLayers.filter(
            (layer) => layer.id !== action.id,
          ),
        };
      }
      case MAP_SWITCH_INDICATOR_LAYERS: {
        const { firstIdx, secondIdx } = action.payload;
        const layers = [...state.indicatorLayers];
        [layers[firstIdx], layers[secondIdx]] = [
          layers[secondIdx],
          layers[firstIdx],
        ];
        return { ...state, indicatorLayers: layers };
      }
      case MAP_UPDATE_INDICATOR_LAYER_AT_IDX: {
        const layers = [...state.indicatorLayers];
        layers[action.payload.idx] = action.payload.layer;
        return { ...state, indicatorLayers: layers };
      }
      // Context layers
      case MAP_ADD_CONTEXTLAYERS: {
        const contextLayers = Object.assign({}, state.contextLayers);
        const { layer, layer_type } = action.payload;
        contextLayers[action.id] = {
          render: true,
          layer: layer,
          layer_type: layer_type,
        };
        return {
          ...state,
          contextLayers: contextLayers,
        };
      }
      case MAP_REMOVE_CONTEXTLAYERS: {
        const contextLayers = Object.assign({}, state.contextLayers);
        if (contextLayers[action.id]) {
          delete contextLayers[action.id];
        }
        return {
          ...state,
          contextLayers: contextLayers,
        };
      }
      case MAP_REMOVE_CONTEXTLAYERS_ALL: {
        return {
          ...state,
          contextLayers: {},
        };
      }
      // Map positions
      case MAP_ZOOM: {
        return {
          ...state,
          zoom: action.payload,
        };
      }
      case MAP_POSITION: {
        return {
          ...state,
          position: {
            value: action.payload,
            triggeredBy: action.triggeredBy,
          },
          force: false,
        };
      }
      case MAP_IS_3D_MODE: {
        return {
          ...state,
          is3dMode: action.payload,
          force: false,
        };
      }
      case MAP_CENTER: {
        return {
          ...state,
          center: action.payload,
        };
      }
      case MAP_EXTENT: {
        return {
          ...state,
          extent: {
            value: action.payload,
            triggeredBy: action.triggeredBy,
          },
        };
      }
      // Layer visibility
      case MAP_INDICATOR_SHOW: {
        return {
          ...state,
          indicatorShow: action.payload,
        };
      }
      case MAP_CONTEXTLAYERS_SHOW: {
        return {
          ...state,
          contextLayersShow: action.payload,
        };
      }
      // Selected entities
      case MAP_UPDATE_SELECTED_ENTITIES: {
        return {
          ...state,
          selectedEntities: action.payload,
        };
      }
      // Layer transparency
      case MAP_UPDATE_TRANSPARENCY: {
        const { key, value } = action.payload as {
          key: keyof Transparency;
          value: number;
        };
        return {
          ...state,
          transparency: {
            ...state.transparency,
            [key]: value,
          },
        };
      }
    }
  }
  return state;
}
