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

import React, { Fragment, useState } from "react";
import Menu from "@mui/material/Menu";
import Fade from "@mui/material/Fade";
import MenuItem from "@mui/material/MenuItem";

import './style.scss';

/** More action
 * @param {JSX.Element} moreIcon Start icon on the input.
 * @param {React.Component} children React component to be rendered
 */
export default function MoreAction({ moreIcon, children }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <div onClick={handleClick} className='MoreActionIcon'>
        {moreIcon}
      </div>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        TransitionComponent={Fade}
      >
        {
          children ? (
            React.Children.map(children, child => {
              if (child) {
                return (
                  <MenuItem className='MoreActionItem'>{
                    React.cloneElement(child)
                  }</MenuItem>
                )
              } else {
                return ''
              }
            })
          ) : ''
        }
      </Menu>
    </Fragment>
  )
}