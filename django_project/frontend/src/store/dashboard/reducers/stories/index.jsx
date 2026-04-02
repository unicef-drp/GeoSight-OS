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
  addChildToGroupInStructure,
  removeChildInGroupInStructure,
} from "../../../../components/SortableTreeForm/utilities";

export const STORY_ACTION_NAME = "STORY";
export const STORY_ACTION_TYPE_ADD = "STORY/ADD";
export const STORY_ACTION_TYPE_REMOVE = "STORY/REMOVE";
export const STORY_ACTION_TYPE_UPDATE = "STORY/UPDATE";

const initialState = [];

export default function storiesReducer(
  state = initialState,
  action,
  dashboardState,
) {
  switch (action.type) {
    case STORY_ACTION_TYPE_ADD: {
      action.payload.id =
        state.length === 0 ? 1 : Math.max(...state.map((story) => story.id)) + 1;
      addChildToGroupInStructure(
        action.payload.group,
        action.payload.id,
        dashboardState.storiesStructure,
      );
      return [...state, action.payload];
    }
    case STORY_ACTION_TYPE_REMOVE: {
      const newState = [];
      state.forEach(function (story) {
        if (story.id !== action.payload.id) {
          newState.push(story);
        }
      });
      const story = action.payload;
      removeChildInGroupInStructure(
        story.group,
        story.id,
        dashboardState.storiesStructure,
      );
      return newState;
    }
    case STORY_ACTION_TYPE_UPDATE: {
      const newState = [];
      state.forEach(function (story) {
        if (story.id === action.payload.id) {
          newState.push(action.payload);
        } else {
          newState.push(story);
        }
      });
      return newState;
    }
    default:
      return state;
  }
}
