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
 * __date__ = '07/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { ReactNode } from 'react';
import { GridColumns } from "@mui/x-data-grid";

export interface MainDataGridProps {
  columns: GridColumns<any>;
  rows?: readonly any[];
  rowIdKey?: string;

  [key: string]: any;
}

export interface DefaultProps {
  sort?: any[];
  search?: string;
  filters?: object;
}

export interface ServerTableProps extends MainDataGridProps {
  url: string;
  urlHeader?: object;
  dataName: string;
  className: string;

  // Selection model with ids
  selectionModel: any[];
  setSelectionModel: (data: any[]) => void;

  // Selection model with data
  selectionModelData: any[];
  setSelectionModelData: (data: any[]) => void;

  getParameters: (parameter: {}) => {};

  disableSelectionOnClick: boolean;
  defaults?: DefaultProps;
  rightHeader?: ReactNode;
  leftHeader?: ReactNode;
  enable?: {
    select: boolean;
    delete: boolean;
    singleSelection: boolean;
    filter: boolean
  }
}
