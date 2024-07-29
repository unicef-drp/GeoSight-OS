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
 * __date__ = '25/07/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { GET_RESOURCE } from "./ResourceRequests";

export async function returnLayerDetail(layerId) {
  const _detail = await GET_RESOURCE.CLOUD_NATIVE_GIS.DETAIL(layerId)
  let defaultStyle;
  if (_detail.default_style?.style_url) {
    defaultStyle = await (await fetch(_detail.default_style?.style_url)).json()
  }
  _detail.mapbox_style = defaultStyle
  return _detail
}

export async function updateDataWithMapbox(data) {
  const _detail = await returnLayerDetail(data.cloud_native_gis_layer)
  return {
    ...data,
    cloud_native_gis_layer_detail: _detail,
    mapbox_style: _detail.mapbox_style
  }
}