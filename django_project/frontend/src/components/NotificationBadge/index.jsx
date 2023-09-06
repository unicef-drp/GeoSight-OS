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
 * __date__ = '05/09/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Notification Badge
   ========================================================================== */

import React, { useEffect, useState } from 'react';

import './style.scss';

export default function NotificationBadge() {
  const [data, setData] = useState(null)

  useEffect(
    () => {
      fetch('/api/access/request/count',)
        .then(response => response.json())
        .then((response) => {
          if (response.detail) {
            throw new Error(response.detail)
          }
          setData(response)
        })
        .catch(err => {
        })
    }, [])

  let count = 0
  if (data) {
    data.map(row => {
      count += row.count
    })
  }
  if (!count) {
    return null
  }
  return <div
    className='NotificationBadge'
    onClick={_ => {
      document.location.href = urls.admin.accessRequest
    }}
  >
    {count} new
  </div>
}