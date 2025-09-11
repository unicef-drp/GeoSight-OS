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

import {
  ACTION_NAME,
  ACTION_TYPE_UPDATE,
  ACTION_TYPE_UPDATE_INDICATOR_LAYERS,
} from "./index";
import { IndicatorLayer } from "../../../../types/IndicatorLayer";

/** Update composite indicator layer.
 * If force, it will update all data
 * If not, it will only update the data that has changed.
 * */
export function update(data: IndicatorLayer, force: boolean = false) {
  return {
    name: ACTION_NAME,
    type: ACTION_TYPE_UPDATE,
    data: data,
    force: force,
  };
}

export function updateIndicatorLayers(data: IndicatorLayer) {
  return {
    name: ACTION_NAME,
    type: ACTION_TYPE_UPDATE_INDICATOR_LAYERS,
    data: data,
  };
}

export default {
  update,
  updateIndicatorLayers,
};
