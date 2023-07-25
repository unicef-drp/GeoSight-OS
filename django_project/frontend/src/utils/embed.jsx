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
 * Return embed config
 */
export function EmbedConfig() {
  try {
    if (embedConfig) {
      if (embedConfig.extent) {
        embedConfig.bookmark = {
          context_layer_show: embedConfig.context_layer_show,
          extent: embedConfig.extent,
          filters: embedConfig.filters,
          indicator_layer_show: embedConfig.indicator_layer_show,
          is_3d_mode: embedConfig.is_3d_mode,
          position: embedConfig.position,
          selected_admin_level: embedConfig.selected_admin_level,
          selected_basemap: embedConfig.selected_basemap,
          selected_context_layers: embedConfig.selected_context_layers,
          selected_indicator_layer: embedConfig.selected_indicator_layer,
        }
      }
      return embedConfig
    }
  } catch (err) {

  }
  return {
    filter_tab: true,
    layer_tab: true,
    map: true,
    widget_tab: true,
    bookmark: null
  }
}