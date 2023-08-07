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
 * __date__ = '01/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';
import { DataGrid } from "@mui/x-data-grid";

/**
 * Customized Main Data Grid
 */
export function MainDataGrid({ ...props }) {
  return <DataGrid
    headerHeight={36}
    getRowHeight={() => 'auto'}
    {...props}
  />
}