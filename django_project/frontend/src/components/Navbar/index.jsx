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
   NAVBAR
   ========================================================================== */

import React from 'react';
import $ from 'jquery';
import i18n from "i18next";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

import User from './User'
import { EmbedConfig } from "../../utils/embed";

import './style.scss';

/**
 * Navbar.
 * **/
export default function NavBar() {
  const { icon, site_title } = preferences;
  const { username, full_name, is_staff, is_contributor } = user;

  // Set width of logo
  // Not working using css on firefox
  $('.page__header-logo').width($('.page__header-link').width());
  const canAccessAdmin = is_contributor && !EmbedConfig().id
  return (
    <header>
      <div className='NavHeader'>
        <ul className='NavHeader Menu'>
          <li className='NavHeaderLogo'>
            <a
              href='/'
              title={i18n.t('Homepage')}
              className='nav-header-link'
            >
              <img src={icon} alt="Logo"/>
            </a>
          </li>
          <li className='NavHeaderTitle'>
            <button type='button'>
              <a
                href='/'
                title={i18n.t('Homepage')}
                className='NavHeaderLink'
              >
                {site_title}
              </a>
            </button>
            <span className='NavHeaderVersion'>{version}</span>
          </li>
          {
            headerTitle ?
              <li
                className='NavHeaderRight HeaderTitle'>{headerTitle}</li> : ''
          }
          {
            canAccessAdmin ? (
              <li className='NavHeaderRight First'>
                <div>
                  <button type="button">
                    <a href={urls.admin.dashboardList}
                       className='NavHeader-Options'
                       title={"Admin Panel"}><ManageAccountsIcon/></a>
                  </button>
                </div>
              </li>
            ) : ''
          }
          <li className={'NavHeaderRight ' + (!canAccessAdmin ? 'First' : "")}>
            <User/>
          </li>
        </ul>
      </div>
    </header>
  )
}

