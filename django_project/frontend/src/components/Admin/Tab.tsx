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
 * __date__ = '15/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React from 'react';
import { AdminTabProps } from "./types";


/** Multiple admin content */

export const AdminTab = (
  { tabName, selected, onClick, disabled }: AdminTabProps
) => {
  return <div
    key={tabName}
    onClick={_ => {
      if (!disabled) {
        onClick()
      }
    }}
    className={(selected ? 'Selected ' : '') + (disabled ? 'Disabled' : '')}
  >
    {tabName}
  </div>
}
export default AdminTab;