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

/**
 * RELATED TABLE reducer
 */


export const RELATED_TABLE_ACTION_NAME = 'RELATED_TABLE';
export const RELATED_TABLE_ACTION_TYPE_ADD = 'RELATED_TABLE/ADD';
export const RELATED_TABLE_ACTION_TYPE_UPDATE = 'RELATED_TABLE/UPDATE';
export const RELATED_TABLE_ACTION_TYPE_REMOVE = 'RELATED_TABLE/REMOVE';
export const RELATED_TABLE_ACTION_TYPE_REARRANGE = 'RELATED_TABLE/REARRANGE';

const initialState = []
export default function relatedTableReducer(state = initialState, action) {
  if (action.name === RELATED_TABLE_ACTION_NAME) {
    switch (action.type) {
      case RELATED_TABLE_ACTION_TYPE_ADD: {
        return [
          ...state,
          action.payload
        ]
      }
      case RELATED_TABLE_ACTION_TYPE_REMOVE: {
        const relatedTables = []
        state.forEach(function (relatedTable) {
          if (relatedTable.id !== action.payload.id) {
            relatedTables.push(relatedTable)
          }
        })
        return relatedTables
      }
      case RELATED_TABLE_ACTION_TYPE_UPDATE: {
        const relatedTables = []
        state.forEach(function (relatedTable) {
          if (relatedTable.id === action.payload.id) {
            relatedTables.push(action.payload)
          } else {
            relatedTables.push(relatedTable)
          }
        })
        return relatedTables
      }
      case RELATED_TABLE_ACTION_TYPE_REARRANGE: {
        const relatedTables = []
        for (const [groupName, groupValue] of Object.entries(action.payload)) {
          for (const value of groupValue) {
            state.forEach(function (obj) {
              if (obj.id === value.data.id) {
                obj.order = value.data.order;
                obj.group = value.group;
                obj.group_parent = value.group_parent;
                relatedTables.push(obj)
              }
            })
          }
        }
        return relatedTables
      }
      default:
        return state
    }
  }
}