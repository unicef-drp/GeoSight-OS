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
 * __date__ = '25/01/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useMemo, useState } from 'react';
import { debounce } from '@mui/material/utils';

/**
 * Color Selector
 * @param color Color value
 * @param onChange onChange function when color is changed
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function Input(
  {
    value,
    onChange,
    ...props
  }) {
  const [valueInput, setValueInput] = useState(value);

  useEffect(() => {
    setValueInput(value)
  }, [value])

  const update = useMemo(
    () =>
      debounce(
        (newValue) => {
          if (newValue !== value) {
            onChange({
              target: {
                value: newValue
              }
            })
          }
        },
        400
      ),
    []
  )

  useEffect(() => {
    update(valueInput)
  }, [valueInput])

  return <input
    {...props}
    value={valueInput}
    onChange={(evt) => setValueInput(evt.target.value)}/>
}