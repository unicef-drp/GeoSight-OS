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
 * __date__ = '14/02/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export const LocalBoundary = {
  list: () => {
    return `/api/v1/boundary/`
  },
  detail: (identifier) => {
    return `${window.location.origin}/api/v1/boundary/${identifier}/`
  },
  centroid: (identifier) => {
    return `${window.location.origin}/georepo/boundary/${identifier}/centroid`
  }
}