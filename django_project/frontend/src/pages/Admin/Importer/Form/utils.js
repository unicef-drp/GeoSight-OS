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

/***
 * Update data for the form
 * @param data
 * @param setData
 * @param attributes
 */
export const updateDataWithSetState = (data, setData, attributes) => {
  const newData = Object.assign({}, attributes, data)
  if (JSON.stringify(newData) !== JSON.stringify(data)) {
    setData({ ...newData })
  }
  return newData
}