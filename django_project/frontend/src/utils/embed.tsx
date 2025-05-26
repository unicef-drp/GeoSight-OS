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
import { ProjectCheckpoint } from "../types/ProjectCheckpoint";

interface EmbedConfigProps {
  id: number | null;
  filter_tab: boolean;
  layer_tab: boolean;
  widget_tab: boolean,
  map: boolean;
  bookmark: ProjectCheckpoint | null
}

/** Return embed config */
export function EmbedConfig(): EmbedConfigProps {
  let _embedConfig = null
  try {
    // @ts-ignore
    _embedConfig = embedConfig;
  } catch (err) {

  }
  try {
    if (_embedConfig) {
      // @ts-ignore
      if (_embedConfig.extent) {
        return {
          id: _embedConfig.id,
          filter_tab: _embedConfig.filter_tab,
          layer_tab: _embedConfig.layer_tab,
          widget_tab: _embedConfig.widget_tab,
          map: _embedConfig.map,
          bookmark: {
            selected_basemap: _embedConfig.selected_basemap,
            selected_indicator_layers: _embedConfig.selected_indicator_layers,
            selected_context_layers: _embedConfig.selected_context_layers,
            filters: _embedConfig.filters,
            extent: _embedConfig.extent,
            indicator_layer_show: _embedConfig.indicator_layer_show,
            context_layer_show: _embedConfig.context_layer_show,
            selected_admin_level: _embedConfig.selected_admin_level,
            is_3d_mode: _embedConfig.is_3d_mode,
            position: _embedConfig.position,
            context_layers_config: _embedConfig.context_layers_config
          },
        }
      }
    }
  } catch (err) {

  }
  return {
    id: null,
    filter_tab: true,
    layer_tab: true,
    widget_tab: true,
    map: true,
    bookmark: null
  }
}