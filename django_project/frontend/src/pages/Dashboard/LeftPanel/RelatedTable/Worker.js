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
 * __date__ = '27/05/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
export default () => {
  /*** Parse DateTime */
  const parseDateTime = (value) => {
    try {
      if (!isNaN(value)) {
        if ([9, 10].includes(('' + value).length)) {
          return new Date(value * 1000).toISOString()
        } else if (('' + value).length === 13) {
          return new Date(value).toISOString()
        }
      }
    } catch (err) {
    }
    return value
  }

  /** Is key x value is date */
  const isValueDate = (key) => {
    return (
      key.toLowerCase().replaceAll('_', '').includes('date') ||
      key.toLowerCase().replaceAll('_', '').includes('time')
    )
  }
  self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
    if (!e) return;
    let {
      response
    } = e.data;
    response.map(row => {
      for (const [key, value] of Object.entries(row)) {
        const isDate = isValueDate(key)
        if (isDate && !isNaN(value)) {
          row[key] = parseDateTime(value)
        }
      }
    })

    postMessage(response);
  })
}