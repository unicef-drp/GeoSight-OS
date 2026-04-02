/**
* GeoSight is UNICEF's geospatial web-based business intelligence platform.
*
* Contact : geosight-no-reply@unicef.org
*
* .. note:: This program is free software; you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as published by
*     the Free Software Foundation; either version 3 of the License, or
*     (at your option) any later version.
*/

import {
  STORY_ACTION_NAME,
  STORY_ACTION_TYPE_ADD,
  STORY_ACTION_TYPE_REMOVE,
  STORY_ACTION_TYPE_UPDATE,
} from "./index";

export function add(payload) {
  return {
    name: STORY_ACTION_NAME,
    type: STORY_ACTION_TYPE_ADD,
    payload: payload,
  };
}

export function remove(payload) {
  return {
    name: STORY_ACTION_NAME,
    type: STORY_ACTION_TYPE_REMOVE,
    payload: payload,
  };
}

export function update(payload) {
  return {
    name: STORY_ACTION_NAME,
    type: STORY_ACTION_TYPE_UPDATE,
    payload: payload,
  };
}

export default {
  add,
  remove,
  update,
};
