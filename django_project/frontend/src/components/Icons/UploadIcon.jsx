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

export default function UploadIcon({ active = false }) {
  return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
              xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 6.90414V10.1808C11 10.3981 10.9137 10.6064 10.7601 10.7601C10.6065 10.9137 10.3981 11 10.1809 11H0.819149C0.601897 11 0.393543 10.9137 0.239923 10.7601C0.086303 10.6064 0 10.3981 0 10.1808V6.90414C0 6.81103 0.0369869 6.72173 0.102824 6.65589C0.168661 6.59005 0.257956 6.55307 0.351064 6.55307C0.444172 6.55307 0.533466 6.59005 0.599303 6.65589C0.665141 6.72173 0.702128 6.81103 0.702128 6.90414V10.1808C0.702128 10.2119 0.714457 10.2416 0.736402 10.2636C0.758348 10.2855 0.788113 10.2979 0.819149 10.2979H10.1809C10.2119 10.2979 10.2417 10.2855 10.2636 10.2636C10.2855 10.2416 10.2979 10.2119 10.2979 10.1808V6.90414C10.2979 6.81103 10.3349 6.72173 10.4007 6.65589C10.4665 6.59005 10.5558 6.55307 10.6489 6.55307C10.742 6.55307 10.8313 6.59005 10.8972 6.65589C10.963 6.72173 11 6.81103 11 6.90414ZM3.40766 2.93935L5.14894 1.19861V6.90414C5.14894 6.99725 5.18592 7.08655 5.25176 7.15239C5.3176 7.21823 5.40689 7.25521 5.5 7.25521C5.59311 7.25521 5.6824 7.21823 5.74824 7.15239C5.81408 7.08655 5.85106 6.99725 5.85106 6.90414V1.19861L7.59234 2.93935C7.65889 3.00136 7.74691 3.03512 7.83786 3.03352C7.92881 3.03191 8.01559 2.99507 8.07991 2.93075C8.14423 2.86642 8.18107 2.77964 8.18268 2.68869C8.18428 2.59774 8.15052 2.50972 8.08851 2.44316L5.74809 0.102673C5.68226 0.036928 5.59303 0 5.5 0C5.40697 0 5.31774 0.036928 5.25191 0.102673L2.91149 2.44316C2.84948 2.50972 2.81572 2.59774 2.81732 2.68869C2.81893 2.77964 2.85577 2.86642 2.92009 2.93075C2.98441 2.99507 3.07119 3.03191 3.16214 3.03352C3.25309 3.03512 3.34111 3.00136 3.40766 2.93935Z"
      fill="white"/>
  </svg>
}