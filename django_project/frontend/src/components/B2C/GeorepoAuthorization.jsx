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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { ThemeButton } from "../Elements/Button";


/**
 * Georepo authorization
 */
export default function GeorepoAuthorization() {

  /** Login to georepo **/
  const login = () => {
    // GeoRepo Authorization URI
    let _login_uri = urls.geoRepoLoginUrl;
    let _next = window.location.pathname;
    if (_next) {
      _login_uri = _login_uri + `?next=${_next}`
    }
    window.location.replace(_login_uri);
  }

  return (
    <ThemeButton variant="primary Basic" onClick={login}>
      <AccountCircleIcon/>
      &nbsp;&nbsp;Authorize to GeoRepo
    </ThemeButton>
  )
}
