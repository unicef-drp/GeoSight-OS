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

import React, { Fragment } from 'react';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';

import { pageNames } from '../../index'
import NavBar from "../../../../components/Navbar";
import User from "../../../../components/Navbar/User";
import {
  DataAccessIcon,
  DataBrowserIcon,
  DataManagementIcon,
  LayerIcon,
  ListIcon,
  MapIcon,
  ProjectIcon,
  RelatedTableIcon,
  StyleIcon,
  ViewsIcon
} from "../../../../components/Icons";

import './style.scss';


/**
 * Admin side navigation bad
 * @param {string} pageName Page name indicator
 */
export default function SideNavigation({ pageName }) {
  const dashboardList = urls.admin.dashboardList; // eslint-disable-line no-undef
  const indicatorList = urls.admin.indicatorList; // eslint-disable-line no-undef
  const basemapList = urls.admin.basemapList; // eslint-disable-line no-undef
  const contextLayerList = urls.admin.contextLayerList; // eslint-disable-line no-undef
  const styleList = urls.admin.styleList; // eslint-disable-line no-undef
  const userList = urls.admin.userList; // eslint-disable-line no-undef
  const groupList = urls.admin.groupList; // eslint-disable-line no-undef
  const dataset = urls.admin.dataset; // eslint-disable-line no-undef
  const dataAccess = urls.admin.dataAccess; // eslint-disable-line no-undef
  const relatedTableList = urls.admin.relatedTableList; // eslint-disable-line no-undef

  return (
    <div className='SideNavigation'>
      <div className='SideNavigationHeader'>
        <NavBar/>
      </div>
      <div className='SideNavigationContent'>
        <div className='SideNavigationContentGroup'>
          <div className='SideNavigationContentGroupTitle'>VISUALIZATION</div>
          <a href={dashboardList}
             className={'SideNavigation-Row ' + (pageName === pageNames.Dashboard ? 'active' : '')}>
            <ProjectIcon active={pageName === pageNames.Dashboard}/>
            <span className='SideNavigation-Row-Name'>Project</span>
          </a>
          <a href={indicatorList}
             className={'SideNavigation-Row ' + (pageName === pageNames.Indicators ? 'active' : '')}>
            <ListIcon/>
            <span className='SideNavigation-Row-Name'>Indicators</span>
          </a>
          <a href={contextLayerList}
             className={'SideNavigation-Row ' + (pageName === pageNames.ContextLayer ? 'active' : '')}>
            <LayerIcon active={pageName === pageNames.ContextLayer}/>
            <span className='SideNavigation-Row-Name'>Context Layers</span>
          </a>
          <a href={basemapList}
             className={'SideNavigation-Row ' + (pageName === pageNames.Basemaps ? 'active' : '')}>
            <MapIcon active={pageName === pageNames.Basemaps}/>
            <span className='SideNavigation-Row-Name'>Basemaps</span>
          </a>
          {
            user.is_contributor ? <Fragment>
              <a href={styleList}
                 className={'SideNavigation-Row ' + (pageName === pageNames.Styles ? 'active' : '')}>
                <StyleIcon active={pageName === pageNames.Styles}/>
                <span className='SideNavigation-Row-Name'>Styles</span>
              </a>
            </Fragment> : null
          }
        </div>
        <div className='SideNavigationContentGroup'>
          <div className='SideNavigationContentGroupTitle'>DATA</div>
          {/* TODO: For new importer */}
          {
            user.is_contributor ?
              <div className='SideNavigation-Row-Group'>
                <a href={urls.admin.importer}
                   className={'SideNavigation-Row ' + ([pageNames.Importer, pageNames.ScheduleJobs, pageNames.ImporterLogs].includes(pageName) ? 'active' : '')}>
                  <DataManagementIcon
                    active={[pageNames.Importer, pageNames.ScheduleJobs, pageNames.ImporterLogs].includes(pageName)}/>
                  <span
                    className='SideNavigation-Row-Name'>Data Importer</span>
                </a>
                <div className='SideNavigation-Row-Child'>
                  <a href={urls.admin.importer}
                     className={'SideNavigation-Row ' + (pageNames.Importer === pageName ? 'active' : '')}>
            <span
              className='SideNavigation-Row-Name'>Import Data</span>
                  </a>
                </div>
                <div className='SideNavigation-Row-Child'>
                  <a href={urls.admin.scheduledJobs}
                     className={'SideNavigation-Row ' + (pageNames.ScheduleJobs === pageName ? 'active' : '')}>
            <span
              className='SideNavigation-Row-Name'>Scheduled Jobs</span>
                  </a>
                </div>
                <div className='SideNavigation-Row-Child'>
                  <a href={urls.admin.importerLogs}
                     className={'SideNavigation-Row ' + (pageNames.ImporterLogs === pageName ? 'active' : '')}>
            <span
              className='SideNavigation-Row-Name'>Logs</span>
                  </a>
                </div>
              </div> : null
          }
          <a href={dataset}
             className={'SideNavigation-Row ' + (pageName === pageNames.Dataset ? 'active' : '')}>
            <DataBrowserIcon active={pageName === pageNames.Dataset}/>
            <span className='SideNavigation-Row-Name'>Data Browser</span>
          </a>

          <a href={relatedTableList}
             className={'SideNavigation-Row ' + (pageName === pageNames.RelatedTables ? 'active' : '')}>
            <RelatedTableIcon active={pageName === pageNames.RelatedTables}/>
            <span className='SideNavigation-Row-Name'>Related Tables</span>
          </a>
        </div>
        <div className='SideNavigationContentGroup'>
          <div className='SideNavigationContentGroupTitle'>ACCESS</div>
          {
            user.is_contributor ? <Fragment>
              <a href={dataAccess}
                 className={'SideNavigation-Row ' + (pageName === pageNames.DataAccess ? 'active' : '')}>
                <DataAccessIcon active={pageName === pageNames.DataAccess}/>
                <span className='SideNavigation-Row-Name'>Data Access</span>
              </a>
            </Fragment> : null
          }
          {
            user.is_admin ? <Fragment>
              <a href={userList}
                 className={'SideNavigation-Row ' + (pageName === pageNames.Users ? 'active' : '')}>
                <PersonIcon className='SideNavigation-Row-Icon'/>
                <span className='SideNavigation-Row-Name'>Users</span>
              </a>
              <a href={groupList}
                 className={'SideNavigation-Row ' + (pageName === pageNames.Groups ? 'active' : '')}>
                <GroupsIcon className='SideNavigation-Row-Icon'/>
                <span className='SideNavigation-Row-Name'>Groups</span>
              </a>
            </Fragment> : null
          }

          {
            user.is_staff ?
              <div className='SideNavigation-Row-Group'>
                <a href={urls.admin.accessRequestUser}
                   className={'SideNavigation-Row ' + ([pageNames.AccessRequestUser, pageNames.AccessRequestPermission].includes(pageName) ? 'active' : '')}>
                  <GppMaybeIcon className='SideNavigation-Row-Icon'/>
                  <span
                    className='SideNavigation-Row-Name'>Access Request</span>
                </a>
                <div className='SideNavigation-Row-Child'>
                  <a href={urls.admin.accessRequestUser}
                     className={'SideNavigation-Row ' + (pageNames.AccessRequestUser === pageName ? 'active' : '')}>
            <span
              className='SideNavigation-Row-Name'>New User</span>
                  </a>
                </div>
                <div className='SideNavigation-Row-Child'>
                  <a href={urls.admin.accessRequestPermission}
                     className={'SideNavigation-Row ' + (pageNames.AccessRequestPermission === pageName ? 'active' : '')}>
            <span
              className='SideNavigation-Row-Name'>Permission</span>
                  </a>
                </div>
              </div> : <a href={urls.admin.accessRequestPermission}
                          className={'SideNavigation-Row ' + (pageName === pageNames.AccessRequestPermission ? 'active' : '')}>
                <GppMaybeIcon className='SideNavigation-Row-Icon'/>
                <span className='SideNavigation-Row-Name'>Access Request</span>
              </a>
          }
        </div>
      </div>

      <div className='SideNavigationContentGroup'>
          <a href='/' className='SideNavigation-Row Button'>
            <ViewsIcon/>
            <span className='SideNavigation-Row-Name'>View all dashboard</span>
          </a>
        </div>
      <div className='SideNavigationFooter'>
        <User detail={true}/>
      </div>
    </div>
  );
}