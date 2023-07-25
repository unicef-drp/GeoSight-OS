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
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import StorageIcon from '@mui/icons-material/Storage';
import ColorLensIcon from '@mui/icons-material/ColorLens';

import { pageNames } from '../../index'

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
      <a href='/' className='SideNavigation-Row'>
        <HomeIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Home</span>
      </a>
      <a href={dashboardList}
         className={'SideNavigation-Row ' + (pageName === pageNames.Dashboard ? 'active' : '')}>
        <InsertDriveFileIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Projects</span>
      </a>
      <a href={indicatorList}
         className={'SideNavigation-Row ' + (pageName === pageNames.Indicators ? 'active' : '')}>
        <ListAltIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Indicators</span>
      </a>
      <a href={contextLayerList}
         className={'SideNavigation-Row ' + (pageName === pageNames.ContextLayer ? 'active' : '')}>
        <LayersIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Context Layers</span>
      </a>
      <a href={basemapList}
         className={'SideNavigation-Row ' + (pageName === pageNames.Basemaps ? 'active' : '')}>
        <MapIcon className='SideNavigation-Row-Icon'/>
        <span className='SideNavigation-Row-Name'>Basemaps</span>
      </a>
      {
        user.is_contributor ? <Fragment>
          <a href={styleList}
             className={'SideNavigation-Row ' + (pageName === pageNames.Styles ? 'active' : '')}>
            <ColorLensIcon className='SideNavigation-Row-Icon'/>
            <span className='SideNavigation-Row-Name'>Styles</span>
          </a>
        </Fragment> : ""
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
        </Fragment> : ""
      }
      <a href={dataset}
         className={'SideNavigation-Row ' + (pageName === pageNames.Dataset ? 'active' : '')}>

        {/* CUSTOM SVG */}
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
             className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium SideNavigation-Row-Icon"
             viewBox="0 0 1000 1000">
          <g>
            <path
              d="M436.7,379.5c229.3,0,415.1-82.7,415.1-184.8C851.8,92.7,666,10,436.7,10C207.4,10,21.6,92.7,21.6,194.8C21.6,296.8,207.4,379.5,436.7,379.5L436.7,379.5z M436.7,571.5c6.1,0,12-0.3,18.1-0.4c39.2-84.7,124.7-143.6,224.2-143.6c48.7,0,93.9,14.3,132.2,38.6c25.8-24.1,40.6-50.9,40.6-79.3V245.4c0,102.1-185.8,184.8-415.1,184.8c-229.3,0-415.1-82.7-415.1-184.8v141.3C21.6,488.8,207.4,571.5,436.7,571.5L436.7,571.5z M436.7,763.4c3.9,0,7.7-0.2,11.6-0.3c-10.6-27.5-16.6-57.2-16.6-88.4c0-18.1,2.1-35.6,5.7-52.6c-0.3,0-0.5,0-0.8,0c-229.3,0-415.1-82.7-415.1-184.8v141.3C21.6,680.8,207.4,763.4,436.7,763.4L436.7,763.4z M610.3,911.9c-56.1-16.2-104.1-51.4-136.1-98.6c-12.4,0.5-24.9,0.8-37.5,0.8c-229.3,0-415.1-82.7-415.1-184.8v141.3c0,102.1,185.8,184.8,415.1,184.8c64.1,0,124.4-6.7,178.6-18.3c-3.4-6.9-5.3-14.5-5.3-22.5C610,913.7,610.2,912.8,610.3,911.9L610.3,911.9z M969.2,913.2L840.4,784.5c-1.2-1.2-2.5-2.3-3.9-3.3c20.7-31.6,32.7-69.3,32.7-109.8c0-110.7-90.1-200.8-200.8-200.8c-110.7,0-200.8,90.1-200.8,200.8c0,110.7,90.1,200.8,200.8,200.8c36.2,0,70.2-9.7,99.6-26.5c1.3,2.3,2.9,4.3,4.8,6.2l128.7,128.7c14.7,14.7,41.8,11.6,60.4-7.1C980.7,955,983.9,927.9,969.2,913.2L969.2,913.2z M523.6,671.5c0-79.9,65-144.8,144.8-144.8c79.9,0,144.9,65,144.9,144.8s-65,144.8-144.9,144.8C588.6,816.3,523.6,751.3,523.6,671.5L523.6,671.5z"
            />
          </g>
        </svg>
        <span className='SideNavigation-Row-Name'>Data Browser</span>
      </a>
      {
        user.is_contributor ? <Fragment>
          <a href={dataAccess}
             className={'SideNavigation-Row ' + (pageName === pageNames.DataAccess ? 'active' : '')}>
            <StorageIcon className='SideNavigation-Row-Icon'/>
            <span className='SideNavigation-Row-Name'>Data Access</span>
          </a>
        </Fragment> : ""
      }

      <a href={relatedTableList}
         className={'SideNavigation-Row ' + (pageName === pageNames.RelatedTables ? 'active' : '')}>

        {/* CUSTOM SVG */}
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
             className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium SideNavigation-Row-Icon"
             viewBox="0 0 1000 1000">
          <g>
            <path
              d="M436.7,379.5c229.3,0,415.1-82.7,415.1-184.8C851.8,92.7,666,10,436.7,10C207.4,10,21.6,92.7,21.6,194.8C21.6,296.8,207.4,379.5,436.7,379.5L436.7,379.5z M436.7,571.5c6.1,0,12-0.3,18.1-0.4c39.2-84.7,124.7-143.6,224.2-143.6c48.7,0,93.9,14.3,132.2,38.6c25.8-24.1,40.6-50.9,40.6-79.3V245.4c0,102.1-185.8,184.8-415.1,184.8c-229.3,0-415.1-82.7-415.1-184.8v141.3C21.6,488.8,207.4,571.5,436.7,571.5L436.7,571.5z M436.7,763.4c3.9,0,7.7-0.2,11.6-0.3c-10.6-27.5-16.6-57.2-16.6-88.4c0-18.1,2.1-35.6,5.7-52.6c-0.3,0-0.5,0-0.8,0c-229.3,0-415.1-82.7-415.1-184.8v141.3C21.6,680.8,207.4,763.4,436.7,763.4L436.7,763.4z M610.3,911.9c-56.1-16.2-104.1-51.4-136.1-98.6c-12.4,0.5-24.9,0.8-37.5,0.8c-229.3,0-415.1-82.7-415.1-184.8v141.3c0,102.1,185.8,184.8,415.1,184.8c64.1,0,124.4-6.7,178.6-18.3c-3.4-6.9-5.3-14.5-5.3-22.5C610,913.7,610.2,912.8,610.3,911.9L610.3,911.9z M969.2,913.2L840.4,784.5c-1.2-1.2-2.5-2.3-3.9-3.3c20.7-31.6,32.7-69.3,32.7-109.8c0-110.7-90.1-200.8-200.8-200.8c-110.7,0-200.8,90.1-200.8,200.8c0,110.7,90.1,200.8,200.8,200.8c36.2,0,70.2-9.7,99.6-26.5c1.3,2.3,2.9,4.3,4.8,6.2l128.7,128.7c14.7,14.7,41.8,11.6,60.4-7.1C980.7,955,983.9,927.9,969.2,913.2L969.2,913.2z M523.6,671.5c0-79.9,65-144.8,144.8-144.8c79.9,0,144.9,65,144.9,144.8s-65,144.8-144.9,144.8C588.6,816.3,523.6,751.3,523.6,671.5L523.6,671.5z"
            />
          </g>
        </svg>
        <span className='SideNavigation-Row-Name'>Related Tables</span>
      </a>

      {/* TODO: For new importer */}
      {
        user.is_contributor ?
          <div className='SideNavigation-Row-Group'>
            <a href={urls.admin.importer}
               className={'SideNavigation-Row ' + ([pageNames.Importer, pageNames.ScheduleJobs, pageNames.ImporterLogs].includes(pageName) ? 'active' : '')}>
              <CloudSyncIcon className='SideNavigation-Row-Icon'/>
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
          </div> : null
      }
    </div>
  );
}