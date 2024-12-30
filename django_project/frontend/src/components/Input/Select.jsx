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
 * __date__ = '08/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';
import ReactSelect from 'react-select'
import { ArrowDownwardIcon } from "../Icons";

const formatOptionLabel = ({ value, label, help }) => {
  if (help) {
    return <div>
      {label} <span dangerouslySetInnerHTML={{ __html: help }}/>
    </div>
  } else {
    return label
  }
};

export default function Select({ ...props }) {
  const formatOptionLabelfn = props.options[0]?.help ? formatOptionLabel : null;
  return <ReactSelect
    {...props}
    className={"ReactSelect " + (props.className ? props.className : '')}
    classNamePrefix="ReactSelect"
    formatOptionLabel={formatOptionLabelfn}
    components={{
      IndicatorSeparator: () => null,
      DropdownIndicator: () => <div className='DropdownIndicator'>
        <ArrowDownwardIcon/></div>,
    }}
  />
}
