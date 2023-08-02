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
 * __date__ = '31/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";

export default function ContactIcon({ active = false }) {
  if (active) {
    return <svg width="7" height="4" viewBox="0 0 7 4" fill="none"
                xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L3.5 3L6 1" stroke="currentColor" stroke-linecap="round"/>
    </svg>

  }
  return <svg width="7" height="4" viewBox="0 0 7 4" fill="none"
              xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L3.5 3L6 1" stroke="currentColor" stroke-linecap="round"/>
  </svg>

}