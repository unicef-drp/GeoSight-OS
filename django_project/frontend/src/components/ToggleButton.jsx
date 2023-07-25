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

/* ==========================================================================
   Toggle Button
   ========================================================================== */

import React, { useEffect, useState } from 'react';

export const LEFT = 'left';
export const RIGHT = 'right';
export const TOP = 'top';
export const BOTTOM = 'bottom';

/**
 * Left-Right toggle button.
 * @param {string} initState Initial state of toggle between left or right.
 * @param {function} onLeft Function when state is on lft.
 * @param {function} onRight Function when state is on right.
 */
export function LeftRightToggleButton(
  { initState, onLeft, onRight, ...props }
) {
  const [state, setState] = useState(LEFT);

  useEffect(() => {
    setState(initState)
  }, [])

  const change = () => {
    const newState = state === RIGHT ? LEFT : RIGHT;
    setState(newState);

    if (newState === LEFT) {
      onLeft()
    } else if (newState === RIGHT) {
      onRight()
    }
  };
  const className = `left-right-toggle-button ${state} ${props.className}`
  return (
    <div className={className}
         onClick={() => {
           change()
         }}>
      <div></div>
    </div>
  )
}

/**
 * Top Bottom toggle button.
 * @param {string} initState Initial state of toggle between left or right.
 * @param {function} onTop Function when state is on top.
 * @param {function} onBottom Function when state is on bottom.
 */
export function TopBottomToggleButton(
  { isOnTop, onTop, onBottom, ...props }
) {
  const [state, setState] = useState(TOP);

  useEffect(() => {
    setState(isOnTop ? TOP : BOTTOM)
  }, [isOnTop])

  const change = () => {
    const newState = state === TOP ? BOTTOM : TOP;
    setState(newState);

    if (newState === TOP) {
      onTop()
    } else if (newState === BOTTOM) {
      onBottom()
    }
  };
  const className = `top-bottom-toggle-button ${state} ${props.className}`
  return (
    <div className={className}
         onClick={() => {
           change()
         }}>
      <div></div>
    </div>
  )
}
