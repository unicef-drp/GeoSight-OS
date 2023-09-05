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
 * __date__ = '05/09/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";
import Cookies from "js-cookie";
import LoginIcon from '@mui/icons-material/Login';


/**
 * ArcGis authorization
 */

export default function ArcGisAuthorization({ data }) {
  const arcGisDomain = data.url.split('rest')[0]

  const { authUrl, clientId } = {
    authUrl: 'https://www.arcgis.com/sharing/rest/oauth2/authorize/',
    clientId: 'wEv82B8xVKlg9TUv'
  }

  function onReceivedMessage(event) {
    if (event.origin === document.location.origin) {
      Cookies.set(arcGisDomain, event.data)
      document.location.reload();
    }
  }

  /** Login to arcgis **/
  const login = () => {
    window.open(`${authUrl}?client_id=${clientId}&redirect_uri=${document.location.origin}/arcgis-callback&response_type=token&expiration=20160`, "popup", "popup=true");
    window.addEventListener('message', onReceivedMessage, false);
  }

  return <LoginIcon onClick={login}/>
}