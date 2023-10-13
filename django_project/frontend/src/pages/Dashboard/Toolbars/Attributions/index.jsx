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
 * __date__ = '11/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Toggle Attributions
   ========================================================================== */

import React, { useState } from 'react';
import { useSelector } from "react-redux";

import './style.scss';

/**
 * FullScreen component.
 */
export default function Attributions() {
  const [open, setOpen] = useState(true);
  const { attributions } = useSelector(state => state.globalState);
  if (!attributions?.length) {
    return null
  }
  return <div className='Attributions' title='Attributions'>
    <div
      className={'Content' + (open ? ' Open' : '')}
      dangerouslySetInnerHTML={{ __html: attributions.join(' | ') }}
    ></div>
    <div className='Button' onClick={() => setOpen(!open)}></div>
  </div>
}