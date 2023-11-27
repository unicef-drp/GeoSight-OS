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
 * __author__ = 'danang@kartoza.com'
 * __date__ = '26/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { Notification, NotificationStatus } from "../Notification";

import './style.scss';

/**
 * Georepo authorization.
 */
export default function GeorepoAuthorizationModal() {
  const {
    referenceLayer
  } = useSelector(state => state.dashboard.data);
  const referenceLayerData = useSelector(state => state.referenceLayerData[referenceLayer?.identifier]);

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  /** Check reference layer data */
  useEffect(() => {
    if (referenceLayerData?.error?.response?.status === 404) {
      notify('View does not found in GeoRepo.', NotificationStatus.ERROR)
    }
  }, [referenceLayerData]);

  const returnError = () => {
    if (referenceLayerData?.error?.response?.status === 401) {
      if (preferences.georepo_api.api_key_is_public) {
        return <Fragment>
          You need to authorize to GeoRepo to access this page.
          <br/>
          <br/>
          <div>Please add your API Key in <a
            href={'/admin/user/' + user.username + '/edit'}>here</a>.
          </div>
        </Fragment>
      } else {
        return <Fragment>
          It seems your API Key is expired, not correct or inactive.
          <br/>
          <br/>
          <div>
            Please update your API Key in <a
            href={'/admin/user/' + user.username + '/edit'}>
            here
          </a>.
          </div>
        </Fragment>
      }
    } else {
      if (preferences.georepo_api.api_key_is_public) {
        return <Fragment>
          You need to authorize to GeoRepo to access this page.
          <br/>
          <br/>
          <div>Please add your API Key in <a
            href={'/admin/user/' + user.username + '/edit'}>here</a>.
          </div>
        </Fragment>
      } else {
        return <Fragment>
          You don't have rights to access this GeoRepo view.
          <br/>
          <br/>
          Please ask GeoRepo admin for the access by
          clicking&nbsp;
          <a
            target="_blank"
            href={new URL(preferences.georepo_url).origin + '/profile?tab=2'}>
            here.
          </a>
        </Fragment>
      }
    }
  }
  return <Fragment>
    <Notification ref={notificationRef}/>
    {
      [401, 403].includes(referenceLayerData?.error?.response?.status) ?
        <div className='GeorepoAuthorization'>
          <div className='wrapper'>
            {returnError()}
          </div>
        </div> : null
    }
  </Fragment>
}
