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
   USER NAVBAR
   ========================================================================== */

import React, { Fragment, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import LoginIcon from '@mui/icons-material/Login';

import { EmbedConfig } from "../../utils/embed";
import GeorepoAuthorization from "../../components/B2C/GeorepoAuthorization";
import { ThemeButton } from "../Elements/Button";

/**
 * User dropdown.
 **/
export default function User() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Signin Modal Functions.
   **/
  const { username, full_name, is_staff, is_contributor } = user;
  const logoutUrl = urls.logout; // eslint-disable-line no-undef
  const loginUrl = urls.login; // eslint-disable-line no-undef

  // Admin URLS
  const adminUrl = urls.admin.djangoAdmin; // eslint-disable-line no-undef
  const canAccessAdmin = is_staff && !EmbedConfig().id

  if (username) {
    return (
      <Fragment>
        <div className='Account' onClick={handleClick}>{username[0]}</div>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          TransitionComponent={Fade}
        >
          <MenuItem className='MenuItem-Header Description'>
            Logged as : {username}
            {
              useAzureAuth && !preferences.georepo_api.api_key_is_public ?
                <div style={{ color: "gray" }}>
                  <i>Authorized to GeoRepo</i>
                </div> : null
            }
          </MenuItem>
          {
            useAzureAuth && preferences.georepo_api.api_key_is_public ?
              <MenuItem
                className='MenuItem-Header MenuItem-Button Description'>
                <GeorepoAuthorization/>
              </MenuItem> : null
          }
          {
            canAccessAdmin ? (
              <MenuItem className='MenuItem-Header DjangoAdmin'>
                <a href={adminUrl}>Django Admin</a>
              </MenuItem>
            ) : null
          }
          <MenuItem className='MenuItem-Header'>
            <a href={logoutUrl}>Logout</a>
          </MenuItem>
        </Menu>
      </Fragment>
    )
  } else {
    return (
      <div className='LinkButton'>
        <a href={loginUrl}>
          <ThemeButton
            variant="white"
          >
            <LoginIcon/> Login
          </ThemeButton>
        </a>
      </div>
    );
  }
}