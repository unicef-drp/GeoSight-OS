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

import React, { Fragment, useRef } from 'react';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import Tooltip from "@mui/material/Tooltip";

import { pageNames } from '../../index'
import NavBar from "../../../../components/Navbar";
import User from "../../../../components/Navbar/User";
import {
  ContactActiveIcon,
  ContactIcon,
  DataBrowserActiveIcon,
  DataBrowserIcon,
  DataManagementActiveIcon,
  DataManagementIcon,
  GlobeIcon,
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
import { HelpCenter } from "../../../../components/HelpCenter";

import './style.scss';
import NotificationBadge from "../../../../components/NotificationBadge";
import NotificationMaintenance
  from "../../../../components/NotificationMaintenance";
import LanguageSelector from '../../../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';


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
  const referenceDatasetList = urls.admin.referenceDatasetList; // eslint-disable-line no-undef
  const referenceDatesetImporterList = urls.admin.referenceDatesetImporterList; // eslint-disable-line no-undef
  const helpPageRef = useRef(null);
  const { t } = useTranslation();

  return (
    <div className={'SideNavigation ' + (minified ? 'Minified' : '')}>
      <div className='SideNavigationHeader'>
        <NavBar minified={minified} />
      </div>
      <div className='SideNavigationContent'>
        {
          user.is_contributor ?
            <Fragment>
              <div className='SideNavigationContentGroup'>
                <div className='SideNavigationContentGroupTitle'>{t('admin.visualization')}</div>
                <SidaNavigationButton minified={minified} title={t('admin.project')}>
                  <a href={dashboardList}
                    className={'SideNavigation-Row ' + (pageName === pageNames.Dashboard ? 'active' : '')}>
                    {pageName === pageNames.Dashboard ? <ProjectActiveIcon /> :
                      <ProjectIcon />}
                    <span className='SideNavigation-Row-Name'>{t('admin.project')}</span>
                  </a>
                </SidaNavigationButton>
                <SidaNavigationButton minified={minified} title={t('admin.indicators')}>
                  <a href={indicatorList}
                    className={'SideNavigation-Row ' + (pageName === pageNames.Indicators ? 'active' : '')}>
                    <ListIcon />
                    <span className='SideNavigation-Row-Name'>{t('admin.indicators')}</span>
                  </a>
                </SidaNavigationButton>
                <SidaNavigationButton minified={minified} title={t('admin.contextLayers')}>
                  <a href={contextLayerList}
                    className={'SideNavigation-Row ' + (pageName === pageNames.ContextLayer ? 'active' : '')}>
                    {pageName === pageNames.ContextLayer ? <LayerActiveIcon /> :
                      <LayerIcon />}
                    <span className='SideNavigation-Row-Name'>{t('admin.contextLayers')}</span>
                  </a>
                </SidaNavigationButton>
                <SidaNavigationButton minified={minified} title={t('admin.basemaps')}>
                  <a href={basemapList}
                    className={'SideNavigation-Row ' + (pageName === pageNames.Basemaps ? 'active' : '')}>
                    {pageName === pageNames.Basemaps ? <MapActiveIcon /> :
                      <MapIcon />}
                    <span className='SideNavigation-Row-Name'>{t('admin.basemaps')}</span>
                  </a>
                </SidaNavigationButton>
                <SidaNavigationButton minified={minified} title={t('admin.styles')}>
                  <a href={styleList}
                    className={'SideNavigation-Row ' + (pageName === pageNames.Styles ? 'active' : '')}>
                    {pageName === pageNames.Styles ? <StyleActiveIcon /> :
                      <StyleIcon />}
                    <span className='SideNavigation-Row-Name'>{t('admin.styles')}</span>
                  </a>
                </SidaNavigationButton>
              </div>
              <div className='SideNavigationContentGroup'>
                <div className='SideNavigationContentGroupTitle'>{t('admin.data')}</div>
                <div className='SideNavigation-Row-Group'>
                  <SidaNavigationButton minified={minified} title={t('admin.dataManagement')}>
                    <a href={urls.admin.dataManagement}
                      className={'SideNavigation-Row ' + ([pageNames.Importer, pageNames.DataManagement].includes(pageName) ? 'active' : '')}>
                      {[pageNames.Importer, pageNames.DataManagement].includes(pageName) ?
                        <DataManagementActiveIcon /> : <DataManagementIcon />}
                      <span className='SideNavigation-Row-Name'>{t('admin.dataManagement')}</span>
                    </a>
                  </SidaNavigationButton>
                </div>
                <SidaNavigationButton minified={minified} title={t('admin.dataBrowser')}>
                  <a href={dataset}
                    className={'SideNavigation-Row ' + (pageName === pageNames.Dataset ? 'active' : '')}>
                    {pageName === pageNames.Dataset ?
                      <DataBrowserActiveIcon /> : <DataBrowserIcon />}
                    <span className='SideNavigation-Row-Name'>{t('admin.dataBrowser')}</span>
                  </a>
                </SidaNavigationButton>
                <SidaNavigationButton minified={minified} title={t('admin.relatedTables')}>
                  <a href={relatedTableList}
                    className={'SideNavigation-Row ' + ([pageNames.RelatedTables, pageNames.RelatedTablesData].includes(pageName) ? 'active' : '')}>
                    {[pageNames.RelatedTables, pageNames.RelatedTablesData].includes(pageName) ?
                      <TableActiveIcon /> : <TableIcon />}
                    <span className='SideNavigation-Row-Name'>{t('admin.relatedTables')}</span>
                  </a>
                </SidaNavigationButton>
              </div>
              {user.is_admin && localReferenceDatasetEnabled ?
                <div className='SideNavigationContentGroup'>
                  <div className='SideNavigationContentGroupTitle'>{t('admin.referenceDatasets')}</div>
                  <SidaNavigationButton minified={minified} title={t('admin.referenceDatasetsLower')}>
                    <a href={referenceDatasetList}
                      className={'SideNavigation-Row ' + ([pageNames.ReferenceLayerView].includes(pageName) ? 'active' : '')}>
                      {[pageNames.ReferenceLayerView].includes(pageName) ?
                        <LayerActiveIcon /> : <LayerIcon />}
                      <span className='SideNavigation-Row-Name'>{t('admin.referenceDatasetsLower')}</span>
                    </a>
                  </SidaNavigationButton>
                  <SidaNavigationButton minified={minified} title={t('admin.importers')}>
                    <a href={referenceDatesetImporterList}
                      className={'SideNavigation-Row ' + ([pageNames.referenceDatesetImporter].includes(pageName) ? 'active' : '')}>
                      {[pageNames.referenceDatesetImporter].includes(pageName) ?
                        <LayerActiveIcon /> : <LayerIcon />}
                      <span className='SideNavigation-Row-Name'>{t('admin.importers')}</span>
                    </a>
                  </SidaNavigationButton>
                </div> : null}
              <div className='SideNavigationContentGroup'>
                <div className='SideNavigationContentGroupTitle'>{t('admin.access')}</div>
                {user.is_admin ? <Fragment>
                  <SidaNavigationButton minified={minified} title={t('admin.usersAndGroups')}>
                    <a href={userAndGroupList}
                      className={'SideNavigation-Row ' + (pageName === pageNames.UsersAndGroups ? 'active' : '')}>
                      {pageName === pageNames.UsersAndGroups ?
                        <ContactActiveIcon /> : <ContactIcon />}
                      <span className='SideNavigation-Row-Name'>{t('admin.usersAndGroups')}</span>
                    </a>
                  </SidaNavigationButton>
                </Fragment> : null}
                <div className='SideNavigation-Row-Group'>
                  <SidaNavigationButton minified={minified} title={t('admin.accessRequest')}>
                    <a href={urls.admin.accessRequest}
                      className={'SideNavigation-Row ' + (pageNames.AccessRequestList === pageName ? 'active' : '')}>
                      <GppMaybeIcon className='SideNavigation-Row-Icon' />
                      <span className='SideNavigation-Row-Name'>{t('admin.accessRequest')}</span>
                      <NotificationBadge />
                    </a>
                  </SidaNavigationButton>
                </div>
              </div>
            </Fragment> : null}
        {user.id ?
          <div className='SideNavigationContentGroup'>
            <div className='SideNavigationContentGroupTitle'>{t('admin.user')}</div>
            <div className='SideNavigation-Row-Group'>
              <SidaNavigationButton minified={minified} title={t('admin.profile')}>
                <a href={`/admin/user/${user.username}/edit`}
                  className={'SideNavigation-Row ' + (pageNames.UserProfile === pageName ? 'active' : '')}>
                  {pageName === pageNames.UserProfile ?
                    <ContactActiveIcon /> : <ContactIcon />}
                  <span className='SideNavigation-Row-Name'>{t('admin.profile')}</span>
                </a>
              </SidaNavigationButton>
            </div>
          </div> : null}
      </div>

      <div className='SideNavigationContentGroup ViewAllDashboard'>
        <SidaNavigationButton minified={minified} title={t('admin.viewAllDashboards')}>
          <a href='/' className='SideNavigation-Row Button'>
            <GridIcon />
            <span className='SideNavigation-Row-Name'>{t('admin.viewAllDashboards')}</span>
          </a>
        </SidaNavigationButton>
        <SidaNavigationButton minified={minified} title={t('admin.language')}>
          <LanguageSelector>
            <a className='SideNavigation-Row language-selector'>
              <GlobeIcon />
              <span className='SideNavigation-Row-Name'>{t("native.name")}</span>
            </a>
          </LanguageSelector>
        </SidaNavigationButton>
        <SidaNavigationButton minified={minified} title={t('admin.help')}>
          <a href='#' className='SideNavigation-Row' onClick={_ => {
            helpPageRef?.current.open()
          }}>
            <HelpIcon />
            <span className='SideNavigation-Row-Name'>{t('admin.help')}</span>
          </a>
        </SidaNavigationButton>
        <NotificationMaintenance />
      </div>
      <div className='SideNavigationFooter'>
        <User detail={true} />
      </div>

      <HelpCenter ref={helpPageRef} />
    </div>
  );
}