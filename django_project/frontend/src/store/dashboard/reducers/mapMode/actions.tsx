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

import {
  MAP_MODE_ACTION_NAME,
  MAP_MODE_ACTION_TYPE_COMPARE,
  MAP_MODE_ACTION_TYPE_COMPOSITE,
  MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW,
  MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW_SYNC,
} from "./index";

const makeAction = (type: string, value?: boolean) => ({
  name: MAP_MODE_ACTION_NAME,
  type,
  value,
});

export const changeCompareMode = () => makeAction(MAP_MODE_ACTION_TYPE_COMPARE);
export const activateCompare = () =>
  makeAction(MAP_MODE_ACTION_TYPE_COMPARE, true);
export const deactivateCompare = () =>
  makeAction(MAP_MODE_ACTION_TYPE_COMPARE, false);

export const toggleCompositeMode = () =>
  makeAction(MAP_MODE_ACTION_TYPE_COMPOSITE);
export const activateComposite = () =>
  makeAction(MAP_MODE_ACTION_TYPE_COMPOSITE, true);
export const deactivateComposite = () =>
  makeAction(MAP_MODE_ACTION_TYPE_COMPOSITE, false);

export const toggleSideBySideView = () =>
  makeAction(MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW);
export const activateSideBySideView = () =>
  makeAction(MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW, true);
export const deactivateSideBySideView = () =>
  makeAction(MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW, false);

export const toggleSideBySideViewSync = () =>
  makeAction(MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW_SYNC);
export const activateSideBySideViewSync = () =>
  makeAction(MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW_SYNC, true);
export const deactivateSideBySideViewSync = () =>
  makeAction(MAP_MODE_ACTION_TYPE_SIDE_BY_SIDE_VIEW_SYNC, false);

export default {
  changeCompareMode,
  activateCompare,
  deactivateCompare,
  toggleCompositeMode,
  activateComposite,
  deactivateComposite,
  toggleSideBySideView,
  activateSideBySideView,
  deactivateSideBySideView,
  toggleSideBySideViewSync,
  activateSideBySideViewSync,
  deactivateSideBySideViewSync,
};
