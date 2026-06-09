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
 * __date__ = '08/06/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

import { createSelector } from "reselect";
import { IndicatorLayer } from "../types/IndicatorLayer";

/** Returns the currently active indicator layers from map state. */
export const selectIndicatorLayers = (state: any): IndicatorLayer[] =>
  state.map.indicatorLayers;

/** Returns a single active indicator layer by index from map state. */
export const selectIndicatorLayerByIdx =
  (idx: number) =>
  (state: any): IndicatorLayer =>
    state.map.indicatorLayers[idx];

/** Returns only the ids of active indicator layers. Memoized — same reference returned when ids unchanged. */
export const selectIndicatorLayerIds = createSelector(
  (state: any) => state.map.indicatorLayers as IndicatorLayer[],
  (layers) => layers.map((l) => l?.id),
);