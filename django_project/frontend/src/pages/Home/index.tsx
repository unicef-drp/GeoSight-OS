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

import React, {useState} from 'react';
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import ImageIcon from '@mui/icons-material/Image';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {store} from '../../store/admin';
import {render} from '../../app';
import {ThemeButton} from "../../components/Elements/Button";
import ProjectList from "../../components/Home";
import {GeoSightProject} from "../../components/Home";
import {VisibilityIcon} from "../../components/Icons";
import Footer from "../../components/Footer";
import BasicPage from '../Basic'

import './style.scss';
import formatters from "chart.js/dist/core/core.ticks";
import values = formatters.values;


/**
 * Home Page App
 */
export default function Home() {
  const [projects, setProjects] = useState({
    own: [],
    shared: []
  });
  const [showBanner, setShowBanner] = useState(true);

  const handleOnSetProject = (type: string, newValue: GeoSightProject[]) => {
    if (type == 'own') {
        setProjects({
            ...projects,
            own: newValue
        })
    } else {
        setProjects({
            ...projects,
            shared: newValue
        })
    }
  }


  return (
    <BasicPage className='Home'>
      {
        mainImage ?
          <banner className={showBanner ? '' : 'Hide'}>
            <div className='BannerContent'>
              <div className='Separator'/>
              {
                preferences.landing_page_banner_text ?
                  <div dangerouslySetInnerHTML={{
                    __html: preferences.landing_page_banner_text
                  }}/>
                  :
                  null
              }
              <ThemeButton
                variant="primary Basic HideBanner"
                onClick={_ => setShowBanner(false)}>
                Hide this banner <HighlightOffIcon/>
              </ThemeButton>
            </div>
            <ThemeButton
              variant="Basic ShowBanner"
              onClick={_ => setShowBanner(true)}>
              <VisibilityIcon/> Show banner
            </ThemeButton>
          </banner> : null
      }
      <div className={'HomePageContent ' + (!projects ? 'Loading' : '')}>
        {
          !projects ? (
            <div className='LoadingElement'>
              <div className='Throbber'>
                <CircularProgress size="10rem"/>
              </div>
            </div>
          ) : projects?.own?.length ?
            <ProjectList
                url={`/api/v1/dashboards?creator=${user.id}`}
                onSetProject={handleOnSetProject}
            >
            </ProjectList> : null
        }
          {/*{*/}
          {/*    !projects?.shared?.length ? null :*/}
          {/*        <ProjectList url={`/api/v1/dashboards?creator=${user.id}`}></ProjectList>*/}
          {/*}*/}
      </div>
      <div>
        <Footer/>
      </div>
    </BasicPage>
  )
}

render(Home, store)