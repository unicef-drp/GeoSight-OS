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

import React, { Fragment, useState } from 'react';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import Tooltip from "@mui/material/Tooltip";

import { pageNames } from '../../index'
import NavBar from "../../../../components/Navbar";
import User from "../../../../components/Navbar/User";
import {
  ContactActiveIcon,
  ContactIcon,
  DataAccessActiveIcon,
  DataAccessIcon,
  DataBrowserActiveIcon,
  DataBrowserIcon,
  DataManagementActiveIcon,
  DataManagementIcon,
  GridIcon,
  HelpIcon,
  LayerActiveIcon,
  LayerIcon,
  ListIcon,
  MapActiveIcon,
  MapIcon,
  ProjectActiveIcon,
  ProjectIcon,
  StyleActiveIcon,
  StyleIcon,
  TableActiveIcon,
  TableIcon,
} from "../../../../components/Icons";
import NotificationBadge from "../../../../components/NotificationBadge";

import './style.scss';
import {
  DocsCrawlerGeosight
} from "../../../../components/DocsCrawlerGeosight";


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

  const [openHelp, setOpenHelp] = useState(false)

  return (
    <div className={'SideNavigation ' + (minified ? 'Minified' : '')}>
      <div className='SideNavigationHeader'>
        <NavBar minified={minified}/>
      </div>
      <div className='SideNavigationContent'>
        {
          user.is_contributor ?
            <Fragment>
              <div className='SideNavigationContentGroup'>
                <div className='SideNavigationContentGroupTitle'>VISUALIZATION
                </div>
                <SidaNavigationButton minified={minified} title='Project'>
                  <a href={dashboardList}
                     className={'SideNavigation-Row ' + (pageName === pageNames.Dashboard ? 'active' : '')}>
                    {pageName === pageNames.Dashboard ? <ProjectActiveIcon/> :
                      <ProjectIcon/>}
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
                <SidaNavigationButton minified={minified}
                                      title='Context Layers'>
                  <a href={contextLayerList}
                     className={'SideNavigation-Row ' + (pageName === pageNames.ContextLayer ? 'active' : '')}>
                    {pageName === pageNames.ContextLayer ? <LayerActiveIcon/> :
                      <LayerIcon/>}
                    <span
                      className='SideNavigation-Row-Name'>Context Layers</span>
                  </a>
                </SidaNavigationButton>
                <SidaNavigationButton minified={minified} title='Basemaps'>
                  <a href={basemapList}
                     className={'SideNavigation-Row ' + (pageName === pageNames.Basemaps ? 'active' : '')}>
                    {pageName === pageNames.Basemaps ? <MapActiveIcon/> :
                      <MapIcon/>}
                    <span className='SideNavigation-Row-Name'>Basemaps</span>
                  </a>
                </SidaNavigationButton>
                {
                  user.is_admin ? <Fragment>
                    <SidaNavigationButton minified={minified} title='Styles'>
                      <a href={styleList}
                         className={'SideNavigation-Row ' + (pageName === pageNames.Styles ? 'active' : '')}>
                        {pageName === pageNames.Styles ? <StyleActiveIcon/> :
                          <StyleIcon/>}
                        <span className='SideNavigation-Row-Name'>Styles</span>
                      </a>
                    </SidaNavigationButton>
                  </Fragment> : null
                }
              </div>
              <div className='SideNavigationContentGroup'>
                <div className='SideNavigationContentGroupTitle'>DATA</div>
                <div className='SideNavigation-Row-Group'>
                  <SidaNavigationButton
                    minified={minified}
                    title='Data Management'>
                    <a href={urls.admin.dataManagement}
                       className={'SideNavigation-Row ' + ([pageNames.Importer, pageNames.DataManagement].includes(pageName) ? 'active' : '')}>
                      {
                        [pageNames.Importer, pageNames.DataManagement].includes(pageName) ?
                          <DataManagementActiveIcon/> : <DataManagementIcon/>
                      }
                      <span
                        className='SideNavigation-Row-Name'>Data Management</span>
                    </a>
                  </SidaNavigationButton>
                </div>
                <SidaNavigationButton
                  minified={minified}
                  title='Data Data Browser'>
                  <a href={dataset}
                     className={'SideNavigation-Row ' + (pageName === pageNames.Dataset ? 'active' : '')}>
                    {
                      pageName === pageNames.Dataset ?
                        <DataBrowserActiveIcon/> :
                        <DataBrowserIcon/>
                    }
                    <span
                      className='SideNavigation-Row-Name'>Data Browser</span>
                  </a>
                </SidaNavigationButton>
                <SidaNavigationButton minified={minified}
                                      title='Related Tables'>
                  <a href={relatedTableList}
                     className={'SideNavigation-Row ' + ([pageNames.RelatedTables, pageNames.RelatedTablesData].includes(pageName) ? 'active' : '')}>
                    {[pageNames.RelatedTables, pageNames.RelatedTablesData].includes(pageName) ?
                      <TableActiveIcon/> :
                      <TableIcon/>}
                    <span
                      className='SideNavigation-Row-Name'>Related Tables</span>
                  </a>
                </SidaNavigationButton>
              </div>
              <div className='SideNavigationContentGroup'>
                <div className='SideNavigationContentGroupTitle'>ACCESS</div>
                {
                  user.is_admin ? <Fragment>
                    <SidaNavigationButton
                      minified={minified}
                      title='Data Access'>
                      <a href={dataAccess}
                         className={'SideNavigation-Row ' + (pageName === pageNames.DataAccess ? 'active' : '')}>
                        {
                          pageName === pageNames.DataAccess ?
                            <DataAccessActiveIcon/> : <DataAccessIcon/>
                        }
                        <span
                          className='SideNavigation-Row-Name'>Data Access</span>
                      </a>
                    </SidaNavigationButton>
                  </Fragment> : null
                }
                {
                  user.is_admin ? <Fragment>
                    <SidaNavigationButton
                      minified={minified}
                      title='Users and groups'>
                      <a href={userAndGroupList}
                         className={'SideNavigation-Row ' + (pageName === pageNames.UsersAndGroups ? 'active' : '')}>
                        {pageName === pageNames.UsersAndGroups ?
                          <ContactActiveIcon/> : <ContactIcon/>}
                        <span
                          className='SideNavigation-Row-Name'>Users and groups</span>
                      </a>
                    </SidaNavigationButton>
                  </Fragment> : null
                }
                <div className='SideNavigation-Row-Group'>
                  <SidaNavigationButton
                    minified={minified}
                    title='Access Request'>
                    <a href={urls.admin.accessRequest}
                       className={'SideNavigation-Row ' + (pageNames.AccessRequestList === pageName ? 'active' : '')}>
                      <GppMaybeIcon className='SideNavigation-Row-Icon'/>
                      <span className='SideNavigation-Row-Name'>
                        Access Request
                      </span>
                      <NotificationBadge/>
                    </a>
                  </SidaNavigationButton>
                </div>
              </div>
            </Fragment> : null
        }
        {
          user.id ?
            <div className='SideNavigationContentGroup'>
              <div className='SideNavigationContentGroupTitle'>USER</div>
              <div className='SideNavigation-Row-Group'>
                <SidaNavigationButton minified={minified} title='Profile'>
                  <a href={`/admin/user/${user.username}/edit`}
                     className={'SideNavigation-Row ' + (pageNames.UserProfile === pageName ? 'active' : '')}>
                    {
                      pageName === pageNames.UserProfile ?
                        <ContactActiveIcon/> : <ContactIcon/>
                    }
                    <span className='SideNavigation-Row-Name'>Profile</span>
                    <NotificationBadge/>
                  </a>
                </SidaNavigationButton>
              </div>
            </div> : null
        }
      </div>

      <div className='SideNavigationContentGroup ViewAllDashboard'>
        <SidaNavigationButton
          minified={minified} title='View all dashboard(s)'>
          <a href='/' className='SideNavigation-Row Button'>
            <GridIcon/>
            <span className='SideNavigation-Row-Name'>
              View all dashboard(s)
            </span>
          </a>
        </SidaNavigationButton>
        <SidaNavigationButton minified={minified} title='Help'>
          <a href='#' className='SideNavigation-Row' onClick={_ => {
            setOpenHelp(true)
          }}>
            <HelpIcon/>
            <span className='SideNavigation-Row-Name'>Help</span>
          </a>
        </SidaNavigationButton>
      </div>
      <div className='SideNavigationFooter'>
        <User detail={true}/>
      </div>

      <DocsCrawlerGeosight open={openHelp} setOpen={setOpenHelp}/>
    </div>
  );
}