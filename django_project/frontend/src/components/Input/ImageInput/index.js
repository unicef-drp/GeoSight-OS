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
 * __date__ = '02/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useState } from 'react';
import { ThemeButton } from "../../Elements/Button";

import './style.scss'

/** Search Input */
export function ImageInput(
  {
    image,
    ...props
  }) {

  const [iconSrc, setIconSrc] = useState(image);

  /** Image changed */
  const imageChanged = (event) => {
    const [file] = event.target.files
    if (file) {
      setIconSrc(URL.createObjectURL(file));
    } else {
      setIconSrc(image);
    }
    props.onChange()
  }

  return <div className='ImageInput'>
    <ThemeButton variant="primary Reverse Basic">Browse File</ThemeButton>
    <div className='ImageInput-Input'>
      <input
        type="file" name="icon"
        accept="image/png, image/jpeg"
        {...props}
        onChange={imageChanged}
      />
    </div>
    {iconSrc ? <img src={iconSrc}/> : null}
  </div>
}
