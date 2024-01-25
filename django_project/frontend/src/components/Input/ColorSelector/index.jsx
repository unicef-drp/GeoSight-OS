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
 * __author__ = 'zakki@kartoza.com'
 * __date__ = '30/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';
import { DebounceInput } from "../DebounceInput";

import './style.scss';

/**
 * Color Selector
 * @param color Color value
 * @param onChange onChange function when color is changed
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function ColorSelector(
  {
    color,
    onChange,
    ...props
  }) {
  const className = props.fullWidth ? 'ColorConfig FullWidth' : 'ColorConfig';

  return (
    <div className={className}>
      {
        props.hideInput ? null :
          <DebounceInput
            type="text"
            name={props.name ? props.name : null}
            disabled={props.disabled ? true : false}
            value={color}
            onChange={onChange}
            spellCheck="false"/>
      }
      <div className='ColorConfigPreview'>
        <DebounceInput
          type="color"
          disabled={props.disabled ? true : false}
          spellCheck="false"
          value={color}
          onChange={onChange}/>
      </div>
    </div>
  )
}