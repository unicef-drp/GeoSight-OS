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

/** MAP_MODE reducer */

export const MAP_MODE_ACTION_NAME = "MAP_MODE";
export const MAP_MODE_ACTION_TYPE_COMPARE = "MAP_MODE/COMPARE";
export const MAP_MODE_ACTION_TYPE_COMPOSITE = "MAP_MODE/COMPOSITE";
export const MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW =
  "MAP_MODE/SIDE_BY_SIDE_VIEW";
export const MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW_SYNC =
  "MAP_MODE/SIDE_BY_SIDE_VIEW_SYNC";

export const SIDE_BY_SIDE_VIEW_MODE = "SIDE_BY_SIDE_VIEW";
export const COMPARE_MODE = "COMPARE";

interface mapModeProps {
  compareMode: boolean;
  compositeMode: boolean;
  sideBySideViewMode: boolean;
  sideBySideViewModeSync: boolean;
}

const initialState: mapModeProps = {
  compareMode: false,
  compositeMode: false,
  sideBySideViewMode: false,
  sideBySideViewModeSync: true,
};
export default function mapCompareModeReducer(
  state = initialState,
  action: any,
) {
  if (action.name !== MAP_MODE_ACTION_NAME) return state;

  const activate = (field: keyof mapModeProps) => {
    const value = action.value ?? !state[field];
    if (value) {
      return {
        compareMode: false,
        compositeMode: false,
        sideBySideViewMode: false,
        sideBySideViewModeSync: state.sideBySideViewModeSync,
        [field]: true,
      };
    }
    return { ...state, [field]: false };
  };

  switch (action.type) {
    case MAP_MODE_ACTION_TYPE_COMPARE:
      return activate("compareMode");
    case MAP_MODE_ACTION_TYPE_COMPOSITE:
      return activate("compositeMode");
    case MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW:
      return activate("sideBySideViewMode");
    case MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW_SYNC: {
      const value = action.value ?? !state.sideBySideViewModeSync;
      return { ...state, sideBySideViewModeSync: value };
    }
  }
  return state;
}
