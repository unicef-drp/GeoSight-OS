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
 * __date__ = '04/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/** Change filters to flat dict */
export function filtersToFlatDict(filters, parent = '.') {
  let output = {}
  filters?.queries?.map((query, idx) => {
    if (query.type === 'GROUP') {
      const id = `${parent}/-${idx}-`
      output[id] = query
      output = Object.assign({}, output, filtersToFlatDict(query, parent + '.'))
    } else {
      const id = `${parent}/${query.name}`
      output[id] = query
    }
  })
  return output
}

export function compareFilters(filters, secondFiltersDict, parent = '.',) {
  filters?.queries?.map((query, idx) => {
    if (query.type === 'GROUP') {
      const id = `${parent}/-${idx}-`
      const targetFilter = secondFiltersDict[id]
      if (targetFilter) {
        query.operator = targetFilter.operator
      }
      compareFilters(query, secondFiltersDict, parent + '.')
    } else {
      const id = `${parent}/${query.name}`
      const targetFilter = secondFiltersDict[id]
      if (targetFilter) {
        query.active = targetFilter.active
        query.value = targetFilter.value
        query.operator = targetFilter.operator
      }
    }
  })
  return filters
}