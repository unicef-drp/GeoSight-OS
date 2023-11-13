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

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { PermissionForm } from "../../../Permission";

import { Actions } from "../../../../../store/dashboard";
import { fetchJSON } from "../../../../../Requests";

/**
 * Permission dashboard
 */
export default function ShareForm() {
  const dispatch = useDispatch();
  const { slug, permission } = useSelector(state => state.dashboard.data);

  const setPermission = (permission) => {
    dispatch(Actions.Dashboard.updatePermission(permission));
  }

  /** Fetch data when modal is opened **/
  useEffect(() => {
    fetchJSON('/api/permission/dashboard/' + slug)
      .then(data => {
        setPermission(data)
      })
  }, [open])

  return <div className='Share'>
    <PermissionForm data={permission} setData={setPermission}/>
  </div>
}