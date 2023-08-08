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

export default function DataManagementIcon({ active = false }) {
  if (active) {
    return <svg width="9" height="11" viewBox="0 0 9 11" fill="none"
                xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.5 0.5C1.97672 0.5 0 1.68269 0 3.19231V7.80769C0 9.31731 1.97672 10.5 4.5 10.5C7.02328 10.5 9 9.31731 9 7.80769V3.19231C9 1.68269 7.02328 0.5 4.5 0.5ZM8.25 5.5C8.25 5.9625 7.88062 6.43413 7.23703 6.79423C6.51234 7.19952 5.54016 7.42308 4.5 7.42308C3.45984 7.42308 2.48766 7.19952 1.76297 6.79423C1.11937 6.43413 0.75 5.9625 0.75 5.5V4.7C1.54969 5.42115 2.91703 5.88462 4.5 5.88462C6.08297 5.88462 7.45031 5.41923 8.25 4.7V5.5ZM7.23703 9.10192C6.51234 9.50721 5.54016 9.73077 4.5 9.73077C3.45984 9.73077 2.48766 9.50721 1.76297 9.10192C1.11937 8.74183 0.75 8.27019 0.75 7.80769V7.00769C1.54969 7.72885 2.91703 8.19231 4.5 8.19231C6.08297 8.19231 7.45031 7.72692 8.25 7.00769V7.80769C8.25 8.27019 7.88062 8.74183 7.23703 9.10192Z"
        fill="currentColor"/>
    </svg>
  }
  return <svg width="9" height="11" viewBox="0 0 9 11" fill="none"
              xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.5"
          d="M4.40625 0.71875C1.93547 0.71875 0 1.83062 0 3.25V7.75C0 9.16938 1.93547 10.2812 4.40625 10.2812C6.87703 10.2812 8.8125 9.16938 8.8125 7.75V3.25C8.8125 1.83062 6.87703 0.71875 4.40625 0.71875ZM4.40625 1.28125C6.48984 1.28125 8.25 2.18266 8.25 3.25C8.25 4.31734 6.48984 5.21875 4.40625 5.21875C2.32266 5.21875 0.5625 4.31734 0.5625 3.25C0.5625 2.18266 2.32266 1.28125 4.40625 1.28125ZM8.25 7.75C8.25 8.81734 6.48984 9.71875 4.40625 9.71875C2.32266 9.71875 0.5625 8.81734 0.5625 7.75V6.75578C1.3125 7.52312 2.73609 8.03125 4.40625 8.03125C6.07641 8.03125 7.5 7.52312 8.25 6.75578V7.75ZM8.25 5.5C8.25 6.56734 6.48984 7.46875 4.40625 7.46875C2.32266 7.46875 0.5625 6.56734 0.5625 5.5V4.50578C1.3125 5.27313 2.73609 5.78125 4.40625 5.78125C6.07641 5.78125 7.5 5.27313 8.25 4.50578V5.5Z"
          fill="currentColor"/>
  </svg>
}