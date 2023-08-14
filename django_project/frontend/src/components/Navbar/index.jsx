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

import React, { useRef } from 'react';
import $ from 'jquery';
import i18n from "i18next";

import User from './User'
import { EmbedConfig } from "../../utils/embed";
import { CogIcon, HelpIcon } from "../Icons";
import { ThemeButton } from "../Elements/Button";

import './style.scss';
import { HelpPage } from "../HelpPage";

/**
 * Navbar.
 * **/
export default function NavBar({ minified }) {
  const helpPageRef = useRef(null);
  const { icon, favicon, site_title } = preferences;
  const { username, full_name, is_staff, is_contributor } = user;

  // Set width of logo
  // Not working using css on firefox
  $('.page__header-logo').width($('.page__header-link').width());
  const canAccessAdmin = is_contributor && !EmbedConfig().id
  return (
    <header>
      <div className='NavHeader'>
        <div className='NavHeaderLogo'>
          <a
            href='/'
            title={i18n.t('Homepage')}
            className='nav-header-link'
          >
            <img src={(minified ? favicon : icon)} alt="Logo"/>
          </a>
        </div>
        <a
          href='/'
          title={i18n.t('Homepage')}
          className='NavHeaderLink'
        >
          {site_title}
        </a>
        <div className='Separator'></div>
        {
          headerTitle ?
            <div className='MiddleSection'>{headerTitle}</div> : null
        }
        <div className='Separator'></div>
        {
          canAccessAdmin ? (
            <div className='LinkButton' style={{ marginRight: "1rem" }}>
              <a href={urls.admin.dashboardList}>
                <ThemeButton
                  variant="white"
                >
                  <CogIcon/> Admin panel
                </ThemeButton>
              </a>
            </div>
          ) : null
        }
        <div className='HelpButton .SvgButton'>
          <a href='#' onClick={_ => {
            helpPageRef?.current.open()
          }}>
            <HelpIcon/>
          </a>
        </div>
        <User/>
      </div>
      <HelpPage ref={helpPageRef}/>
    </header>
  )
}

