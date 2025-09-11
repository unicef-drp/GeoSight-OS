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
 * __date__ = '09/09/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { IndicatorLayer } from "../../../../types/IndicatorLayer";
import {
  defaultCompositeIndexLayer
} from "../../../../components/IndicatorLayer/CompositeIndexLayer/variable";

/** MAP_MODE reducer */

export const ACTION_NAME = "COMPOSITE_INDICATOR_LAYER";
export const ACTION_TYPE_UPDATE = "COMPOSITE_INDICATOR_LAYER/UPDATE";
export const ACTION_TYPE_UPDATE_INDICATOR_LAYERS =
  "COMPOSITE_INDICATOR_LAYER/UPDATE_INDICATOR_LAYERS";

interface props {
  data: IndicatorLayer;
}

const initialState: props = {
  // @ts-ignore
  data: {},
};
export default function compositeIndexLayerReducer(
  state = initialState,
  action: any,
) {
  if (action.name === ACTION_NAME) {
    // If not data, we make default
    if (!state.data) {
      // @ts-ignore
      state.data = defaultCompositeIndexLayer();
    }

    // Make actions
    switch (action.type) {
      case ACTION_TYPE_UPDATE: {
        let { data, force } = action;
        // We meed to be able to force update
        if (force) {
          return {
            ...state,
            data: { ...data },
          };
        }
        return {
          ...state,
          data: { ...data, config: { ...state.data.config } },
        };
      }
      case ACTION_TYPE_UPDATE_INDICATOR_LAYERS: {
        let { data } = action;
        if (!state.data.config) {
          state.data.config = {};
        }
        if (!state.data.config.indicatorLayers) {
          state.data.config.indicatorLayers = [];
        }
        data.forEach((layerId: number) => {
          if (
            !state.data.config.indicatorLayers.find(
              (layer: any) => layer.id === layerId,
            )
          ) {
            state.data.config.indicatorLayers.push({
              id: layerId,
              weight: 1,
              invert: false,
            });
          }
        });
        return {
          ...state,
          data: { ...state.data },
        };
      }
    }
  }
  return state;
}
