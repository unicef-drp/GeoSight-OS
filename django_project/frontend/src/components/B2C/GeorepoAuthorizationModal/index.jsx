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
 * __author__ = 'danang@kartoza.com'
 * __date__ = '26/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';
import GeorepoAuthorization from "../GeorepoAuthorization";

import './style.scss';

/**
 * Georepo authorization.
 */
export default function GeorepoAuthorizationModal() {
  if (!useAzureAuth) {
    return null
  }
  return <div className='GeorepoAuthorization'>
    <div className='wrapper'>
      You need to authorize to GeoRepo to access this page.
      <br/>
      <br/>
      <div>
        <GeorepoAuthorization/>
      </div>
    </div>
  </div>
}
