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

import React from 'react';
import App from '../../app';
import SideNavigation from './Components/SideNavigation'

import './style.scss';

export const pageNames = {
  Dashboard: 'Project',
  Indicators: 'Indicator',
  Basemaps: 'Basemap',
  ContextLayer: 'Context Layer',
  Users: 'Users',
  Groups: 'Groups',
  Styles: 'Styles',
  Dataset: 'Data Browser',
  DataAccess: 'Data Access',
  RelatedTables: 'Related Tables',

  // Importer
  Importer: 'Related Table Importer',
  ImporterLogs: 'Importer Logs',
  ScheduleJobs: 'Scheduled Jobs',

  AccessRequestUser: 'Request New User',
  AccessRequestPermission: 'Request Permission',
}
/**
 * Base Admin App
 * @param {string} pageName Current page name.
 * @param {JSX.Element} rightHeader Right header component.
 * @param {React.Component} children React component to be rendered
 */
export default function Admin({ pageName, rightHeader, children }) {
  return (
    <App className='Admin'>
      <SideNavigation pageName={pageName}/>
      <div className='AdminContent'>
        <div className='AdminContentHeader'>
          <div className='AdminContentHeader-Left'>
            <b className='light'
               dangerouslySetInnerHTML={{ __html: contentTitle }}></b>
          </div>
          <div className='AdminContentHeader-Right'>
            {rightHeader ? rightHeader : ''}
          </div>
        </div>
        {children}
      </div>
    </App>
  );
}
