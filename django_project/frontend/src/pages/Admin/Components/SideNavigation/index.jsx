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
import Tooltip from "@mui/material/Tooltip";

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
import ContactIcon from "../../../../components/Icons/ContactIcon";

import './style.scss';


function SidaNavigationButton({ title, minified, children }) {
  if (minified) {
    return <Tooltip title={title} placement="right">
      {children}
    </Tooltip>
  } else {
    return children
  }
}

/**
 * Admin side navigation bad
 * @param {string} pageName Page name indicator.
 * @param {boolean} minified Is side navigation minified.
 */
export default function SideNavigation({ pageName, minified }) {
  const dashboardList = urls.admin.dashboardList; // eslint-disable-line no-undef
  const indicatorList = urls.admin.indicatorList; // eslint-disable-line no-undef
  const basemapList = urls.admin.basemapList; // eslint-disable-line no-undef
  const contextLayerList = urls.admin.contextLayerList; // eslint-disable-line no-undef
  const styleList = urls.admin.styleList; // eslint-disable-line no-undef
  const userAndGroupList = urls.admin.userAndGroupList; // eslint-disable-line no-undef
  const dataset = urls.admin.dataset; // eslint-disable-line no-undef
  const dataAccess = urls.admin.dataAccess; // eslint-disable-line no-undef
  const relatedTableList = urls.admin.relatedTableList; // eslint-disable-line no-undef

  return (
    <div className={'SideNavigation ' + (minified ? 'Minified' : '')}>
      <div className='SideNavigationHeader'>
        <NavBar minified={minified}/>
      </div>
      <div className='SideNavigationContent'>
        <div className='SideNavigationContentGroup'>
          <div className='SideNavigationContentGroupTitle'>VISUALIZATION</div>
          <SidaNavigationButton minified={minified} title='Project'>
            <a href={dashboardList}
               className={'SideNavigation-Row ' + (pageName === pageNames.Dashboard ? 'active' : '')}>
              <ProjectIcon active={pageName === pageNames.Dashboard}/>
              <span className='SideNavigation-Row-Name'>Project</span>
            </a>
          </SidaNavigationButton>
          <SidaNavigationButton minified={minified} title='Indicators'>
            <a href={indicatorList}
               className={'SideNavigation-Row ' + (pageName === pageNames.Indicators ? 'active' : '')}>
              <ListIcon/>
              <span className='SideNavigation-Row-Name'>Indicators</span>
            </a>
          </SidaNavigationButton>
          <SidaNavigationButton minified={minified} title='Context Layers'>
            <a href={contextLayerList}
               className={'SideNavigation-Row ' + (pageName === pageNames.ContextLayer ? 'active' : '')}>
              <LayerIcon active={pageName === pageNames.ContextLayer}/>
              <span className='SideNavigation-Row-Name'>Context Layers</span>
            </a>
          </SidaNavigationButton>
          <SidaNavigationButton minified={minified} title='Basemaps'>
            <a href={basemapList}
               className={'SideNavigation-Row ' + (pageName === pageNames.Basemaps ? 'active' : '')}>
              <MapIcon active={pageName === pageNames.Basemaps}/>
              <span className='SideNavigation-Row-Name'>Basemaps</span>
            </a>
          </SidaNavigationButton>
          {
            user.is_contributor ? <Fragment>
              <SidaNavigationButton minified={minified} title='Styles'>
                <a href={styleList}
                   className={'SideNavigation-Row ' + (pageName === pageNames.Styles ? 'active' : '')}>
                  <StyleIcon active={pageName === pageNames.Styles}/>
                  <span className='SideNavigation-Row-Name'>Styles</span>
                </a>
              </SidaNavigationButton>
            </Fragment> : null
          }
        </div>
        <div className='SideNavigationContentGroup'>
          <div className='SideNavigationContentGroupTitle'>DATA</div>
          {/* TODO: For new importer */}
          {
            user.is_contributor ?
              <div className='SideNavigation-Row-Group'>
                <SidaNavigationButton minified={minified}
                                      title='Data Management'>
                  <a href={urls.admin.dataManagement}
                     className={'SideNavigation-Row ' + ([pageNames.Importer, pageNames.DataManagement].includes(pageName) ? 'active' : '')}>
                    <DataManagementIcon
                      active={[pageNames.Importer, pageNames.DataManagement].includes(pageName)}/>
                    <span
                      className='SideNavigation-Row-Name'>Data Management</span>
                  </a>
                </SidaNavigationButton>
              </div> : null
          }
          <SidaNavigationButton minified={minified} title='Data Data Browser'>
            <a href={dataset}
               className={'SideNavigation-Row ' + (pageName === pageNames.Dataset ? 'active' : '')}>
              <DataBrowserIcon active={pageName === pageNames.Dataset}/>
              <span className='SideNavigation-Row-Name'>Data Browser</span>
            </a>
          </SidaNavigationButton>

          <SidaNavigationButton minified={minified} title='Related Tables'>
            <a href={relatedTableList}
               className={'SideNavigation-Row ' + (pageName === pageNames.RelatedTables ? 'active' : '')}>
              <RelatedTableIcon active={pageName === pageNames.RelatedTables}/>
              <span className='SideNavigation-Row-Name'>Related Tables</span>
            </a>
          </SidaNavigationButton>
        </div>
        <div className='SideNavigationContentGroup'>
          <div className='SideNavigationContentGroupTitle'>ACCESS</div>
          {
            user.is_contributor ? <Fragment>
              <SidaNavigationButton minified={minified} title='Data Access'>
                <a href={dataAccess}
                   className={'SideNavigation-Row ' + (pageName === pageNames.DataAccess ? 'active' : '')}>
                  <DataAccessIcon active={pageName === pageNames.DataAccess}/>
                  <span className='SideNavigation-Row-Name'>Data Access</span>
                </a>
              </SidaNavigationButton>
            </Fragment> : null
          }
          {
            user.is_admin ? <Fragment>
              <SidaNavigationButton minified={minified}
                                    title='Users and groups'>
                <a href={userAndGroupList}
                   className={'SideNavigation-Row ' + (pageName === pageNames.UsersAndGroups ? 'active' : '')}>
                  <ContactIcon className='SideNavigation-Row-Icon'/>
                  <span
                    className='SideNavigation-Row-Name'>Users and groups</span>
                </a>
              </SidaNavigationButton>
            </Fragment> : null
          }
          <div className='SideNavigation-Row-Group'>
            <SidaNavigationButton minified={minified} title='Access Request'>
              <a href={urls.admin.accessRequest}
                 className={'SideNavigation-Row ' + (pageNames.AccessRequestList === pageName ? 'active' : '')}>
                <GppMaybeIcon className='SideNavigation-Row-Icon'/>
                <span
                  className='SideNavigation-Row-Name'>Access Request</span>
              </a>
            </SidaNavigationButton>
          </div>
        </div>
      </div>

      <div className='SideNavigationContentGroup ViewAllDashboard'>
        <SidaNavigationButton minified={minified} title='View all dashboard'>
          <a href='/' className='SideNavigation-Row Button'>
            <ViewsIcon/>
            <span className='SideNavigation-Row-Name'>View all dashboard</span>
          </a>
        </SidaNavigationButton>
      </div>
      <div className='SideNavigationFooter'>
        <User detail={true}/>
      </div>
    </div>
  );
}