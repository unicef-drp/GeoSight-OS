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
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {store} from '../../store/admin';
import {render} from '../../app';
import {ThemeButton} from "../../components/Elements/Button";
import ProjectList from "../../components/Home";
import {VisibilityIcon} from "../../components/Icons";
import Footer from "../../components/Footer";
import BasicPage from '../Basic'

import './style.scss';


/**
 * Home Page App
 */
export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showBanner, setShowBanner] = useState(true);
  // @ts-ignore
  const userId: number = user.id;
  const mainImageTs = "{{ preferences.landing_page_banner }}";

  const ownProjectsUrl = userId ? `/api/v1/dashboards?creator=${userId}&all_fields=true&page=1&page_size=12` : null;
  const sharedProjectsUrl = userId ? `/api/v1/dashboards?creator=!${userId}&all_fields=true&page=1&page_size=12` :
    '/api/v1/dashboards?all_fields=true&page=1&page_size=12';

  return (
    <BasicPage className='Home'>
      {
        // @ts-ignore
        mainImageTs ?
          <div className={showBanner ? 'banner' : 'banner Hide'}>
            <div className='BannerContent'>
              <div className='Separator'/>
              {
                // @ts-ignore
                preferences.landing_page_banner_text ?
                  <div dangerouslySetInnerHTML={{
                    // @ts-ignore
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
          </div> : null
      }
      <div className={'HomePageContent ' + (isLoading ? 'Loading' : '')}>
        {
          isLoading ? (
            <div className='LoadingElement'>
              <div className='Throbber'>
                <CircularProgress size="10rem"/>
              </div>
            </div>
          ) : null
        }
        {
          ownProjectsUrl ?
            <ProjectList
              baseUrl={ownProjectsUrl}
              setParentLoading={setIsLoading}
            >
            </ProjectList> : null
        }
        {
          sharedProjectsUrl ?
            <ProjectList
              baseUrl={sharedProjectsUrl}
              setParentLoading={setIsLoading}
            >
            </ProjectList> : null
        }
      </div>
      <div>
        <Footer/>
      </div>
    </BasicPage>
  )
}

render(Home, store)