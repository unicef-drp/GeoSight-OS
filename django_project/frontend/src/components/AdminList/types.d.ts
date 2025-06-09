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

import { ReactNode } from "react";
import { DefaultProps, MainDataGridProps } from "../Table/types";

export interface UrlProps {
  list: string;
  create?: string;
  edit?: string;
  batch?: string;
  detail?: string;
}

export interface AdminListProps extends MainDataGridProps {
  url: UrlProps;
  pageName: string;
  title: string;
  initData?: any[];
  rightHeader?: ReactNode;
  middleContent?: ReactNode;
  defaults?: DefaultProps;
  multipleDelete?: boolean;
  selection?: any[];
  selectionChanged?: (data: any[]) => void;
  className?: string;
  useSearch?: boolean;
  searchKey?: string;
  enableFilter?: boolean;

  parentGetParameters?: (parameters: any[]) => any[];
  selectableFunction?: (parameters: any) => boolean;
}

export interface AdminListContentProps extends AdminListProps {
}
