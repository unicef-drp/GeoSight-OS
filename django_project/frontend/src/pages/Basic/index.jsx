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

import React from 'react';

import App from '../../app';

import './style.scss';

/**
 * Basic Page App
 */
export default function BasicPage({ className, children }) {
  return (
    <App className={className}>
      <div className='PageContent'>
        {children}
      </div>
    </App>
  )
}