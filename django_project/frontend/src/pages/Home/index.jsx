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
import { store } from '../../store/admin';
import { render } from '../../app';
import BasicPage from '../Basic'
import MDEditor from "@uiw/react-md-editor";

import './style.scss';

/**
 * Home Page App
 */
export default function Home() {
  const dashboardsData = dashboards;
  return (
    <BasicPage className='Home'>
      <div className='HomePageContent'>
        <div className='PageContent-Title'>
          <div className='PageContent-TitleText'>Select Project</div>
        </div>
        {
          dashboardsData.length > 0 ? (
            <div className='PageContent-Content'>
              {dashboardsData.map((dashboard, idx) => {
                return (
                  <div key={idx} className='DashboardCard'>
                    <div className='DashboardCard-Wrapper'>
                      <a href={dashboard.url}>
                        <img src={dashboard.icon}/>
                        <div className='DashboardCard-Name'>
                          <div className='DashboardCard-NameText'>
                            {dashboard.name}
                          </div>
                        </div>
                        <div className='DashboardCard-Description'>
                          <MDEditor.Markdown
                            source={dashboard.description}
                            linkTarget="_blank"
                          />
                        </div>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <div>No Project Found</div>
        }
      </div>
    </BasicPage>
  )
}

render(Home, store)