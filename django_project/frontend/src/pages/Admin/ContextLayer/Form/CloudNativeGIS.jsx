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
 * __date__ = '06/06/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

import React from 'react';

/**
 * Cloud Native GIS specific fields
 * @param {dict} data Data of context layer.
 * @param {function} onSetData Set the data.
 */
export default function CloudNativeGISFields(
  {
    data,
    onSetData
  }
) {

  return (
    <div className='BasicFormSection'>
      <label className="form-label required">
        Cloud Native GIS detail
      </label>
    </div>
  )
}