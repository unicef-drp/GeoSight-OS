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

import React from "react";
import Cookies from "js-cookie";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { ThemeButton } from "../Elements/Button";


/**
 * Georepo authorization
 */
export default function GeorepoAuthorization() {
  function onReceivedMessage(event) {
    if (event.origin === new URL(GEOREPO_AZURE_REDIRECT_URL).origin) {
      Cookies.set(`georepo-token`, event.data)
      window.removeEventListener('message', onReceivedMessage, false)
      window.location.reload()
    }
  }

  /** Login to georepo **/
  const login = () => {
    window.open(GEOREPO_AZURE_REDIRECT_URL, '_blank');
    window.addEventListener('message', onReceivedMessage, false);
  }

  return (
    <ThemeButton variant="secondary Basic" onClick={login}>
      <AccountCircleIcon/>
      &nbsp;&nbsp;Authorize to GeoRepo
    </ThemeButton>
  )
}
