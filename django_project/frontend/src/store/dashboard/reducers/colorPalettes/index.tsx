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

import { APIReducer } from "../../../reducers_api";
import { ColorPalette } from "../../../../types/Color";

/**
 * RELATED_TABLE_DATA reducer
 */

export const ACTION_NAME = "COLOR_PALETTE_REQUEST";

const initialState: ColorPalette[] | null = null;
export default function ColorPaletteReducer(state = initialState, action: any) {
  if (action.name === ACTION_NAME) {
    switch (action.type) {
      default: {
        // @ts-ignore
        return APIReducer(state, action, ACTION_NAME).data;
      }
    }
  }
  return state;
}
