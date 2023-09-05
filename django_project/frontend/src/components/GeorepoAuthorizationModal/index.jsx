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
    referenceLayer,
    permission
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
      notify('Reference layer dataset does not found in GeoRepo.', NotificationStatus.ERROR)
    } else if (referenceLayerData?.error?.response?.status === 403) {
      notify(
        `You don't have right to access this GeoRepo view. Please ask GeoRepo admin for the access by clicking <a target="_blank" href='${new URL(preferences.georepo_url).origin + '/profile?tab=2'}'>here.</a>`,
        NotificationStatus.ERROR
      )
    }
  }, [referenceLayerData]);

  return <Fragment>
    <Notification ref={notificationRef}/>
    {
      (permission?.public_permission !== 'Read' && preferences.georepo_api.api_key_is_public) || referenceLayerData?.error?.response?.status === 401 ?
        <div className='GeorepoAuthorization'>
          <div className='wrapper'>
            {
              preferences.georepo_using_user_api_key ?
                <Fragment>
                  A GeoRepo API KEY is required for authorizing GeoSight to access GeoRepo data.
                  <br/>
                  <br/>
                  <div>To generate a GeoRepo API KEY,
                    <a href='https://staging-georepo.unitst.org/profile' target="_blank">
                      go to the GeoRepo website
                    </a>.
                  </div>
                  <br/>
                  <div>If you need more information on how to Generate a GeoRepo API KEY, you can check
                    <a
                      href='https://unicef-drp.github.io/GeoRepo-OS/user/api/guide/#generating-an-api-key'
                      target="_blank">
                      this page
                    </a>.
                  </div>
                  <br/>
                  <div>Then, add the GeoRepo API KEY
                    <a href={'/admin/user/' + user.username + '/edit'}>here</a>.
                  </div>
                </Fragment> : <Fragment>
                  GeoSight does not have access to this reference dataset.
                </Fragment>
            }
          </div>
        </div> : null
    }
  </Fragment>
}
