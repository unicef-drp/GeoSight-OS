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

import React, { useState } from "react";

import Tooltip from '@mui/material/Tooltip';
import './style.scss';

/** More action
 * @param {String} text Text to be copied
 */
export default function CopyToClipboard({ text }) {
  const [open, setOpen] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setOpen(true)
    setTimeout(function () {
      setOpen(false)
    }, 1000);
  }
  return (
    <Tooltip
      placement="right"
      PopperProps={{
        disablePortal: true,
      }}
      open={open}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      title="Copied"
    >
      <span className='CopyToClipboard' onClick={() => copy()}>
        {text}
      </span>
    </Tooltip>
  )
}