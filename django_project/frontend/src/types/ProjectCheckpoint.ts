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
 * __date__ = '20/05/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { Extent, Position } from "./Geometry";
import { TransparencyConfiguration } from "../pages/Admin/Dashboard/Form/General";

export interface ProjectCheckpoint {
  selected_basemap: number;
  selected_indicator_layers: number[];
  selected_context_layers: number[];
  filters: any;
  extent: Extent;
  indicator_layer_show: boolean;
  context_layer_show: boolean;
  selected_admin_level: number;
  is_3d_mode: boolean;
  position: Position;
  context_layers_config?: object;
  transparency_config?: TransparencyConfiguration;
}
