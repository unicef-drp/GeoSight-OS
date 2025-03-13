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
  UsersAndGroups: 'Users And Groups',
  Styles: 'Style',
  Dataset: 'Data Browser',
  RelatedTables: 'Related Tables',
  RelatedTablesData: 'Related Tables Data',

  // Importer
  Importer: 'Data Importer',
  DataManagement: 'Data Management',
  ScheduledJobs: 'Scheduled Jobs',
  Logs: 'Logs',

  // Access Request
  AccessRequestList: 'Access Request',
  AccessRequestUserDetail: 'Request New User Detail',
  AccessRequestPermissionDetail: 'Request Permission Detail',

  // Profile
  UserProfile: 'User Profile',

  // ReferenceLayerView
  ReferenceLayerView: 'Reference Dataset',
  referenceDatesetImporter: 'Reference Dataset Importer',
}

/**
 * Base Admin App that contains side navigation and receive children
 * @param {string} pageName Current page name.
 * @param {React.Component} children React component to be rendered
 * @param props
 */
export function AdminPage({ pageName, children, ...props }) {
  return (
    <App className='Admin' hideNavbar={true}>
      <SideNavigation pageName={pageName}
                      minified={props.minifySideNavigation}/>
      {children}
    </App>
  );
}

/**
 * Base admin page content with the header
 * @param {JSX.Element} rightHeader Right header component.
 * @param {string} title Title of page.
 * @param {React.Component} children React component to be rendered
 */
export function AdminPageContent({ rightHeader, title, children }) {
  return <div className='AdminContent'>
    <div className='AdminContentHeader'>
      <div className='AdminContentHeader-Left'>
        <b className='light'
           dangerouslySetInnerHTML={{ __html: title ? title : contentTitle }}></b>
      </div>
      <div className='AdminContentHeader-Right'>
        {rightHeader ? rightHeader : ''}
      </div>
    </div>
    {children}
  </div>
}

/**
 * Base Admin App
 * @param {string} pageName Current page name.
 * @param {JSX.Element} rightHeader Right header component.
 * @param {React.Component} children React component to be rendered
 */
export default function Admin({ pageName, rightHeader, children, ...props }) {
  return (
    <AdminPage pageName={pageName} {...props}>
      <AdminPageContent rightHeader={rightHeader} children={children}/>
    </AdminPage>
  );
}
