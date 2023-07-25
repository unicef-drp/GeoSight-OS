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

/** Utils specifically for data context **/

export function updateContextData(
  context, referenceLayerData, currentIndicatorLayer, currentIndicatorSecondLayer
) {
  const datasetlevelDict = {}
  referenceLayerData?.data?.dataset_levels?.map(level => {
    datasetlevelDict[level.level] = level.level_name
  })
  // Add level name
  context.admin_boundary.admin_level_name = datasetlevelDict[context.admin_boundary.admin_level]
  context.admin_boundary.children.map(child => {
    child.admin_level_name = datasetlevelDict[child.admin_level]
  })
  context.admin_boundary.siblings.map(child => {
    child.admin_level_name = datasetlevelDict[child.admin_level]
  })

  const contextIndicators = []
  currentIndicatorLayer?.indicators?.map(indicator => {
    contextIndicators.push({
      id: indicator.id,
      name: indicator.name,
      shortcode: indicator.shortcode,
    })
  })
  currentIndicatorSecondLayer?.indicators?.map(indicator => {
    contextIndicators.push({
      id: indicator.id,
      name: indicator.name,
      shortcode: indicator.shortcode,
    })
  })
  context.indicators = contextIndicators
}