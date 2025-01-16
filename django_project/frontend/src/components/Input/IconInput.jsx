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
 * __date__ = '27/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';
import SearchIcon from "@mui/icons-material/Search";
import { IconTextField } from "../Elements/Input";

/** Search Input */
export function SearchInput(
  {
    placeholder,
    value,
    onChange,
    ...props
  }) {
  return <IconTextField
    placeholder={placeholder}
    value={value}
    iconEnd={<SearchIcon/>}
    onChange={evt => onChange(evt.target.value)}
    {...props}
  />
}
