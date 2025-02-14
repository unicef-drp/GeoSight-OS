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
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { ReactElement } from "react";

export interface ContentProps {
  name: string;
  content: ReactElement;
}

export interface AdminTabProps {
  tabName: string;
  disabled: boolean;
  selected: boolean;

  onClick: () => void;
}

export interface AdminProps {
  contents: ContentProps[];
  pageName: string;
  onTabChanged: (tab: string) => void;
  renderLeftSidebar: boolean;

  [key: string]: any;
}