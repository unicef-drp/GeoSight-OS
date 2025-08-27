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

import React, { useEffect } from "react";
import App, { render } from "../../app";
import { Actions, store } from "../../store/dashboard";

import Dashboard from "../Dashboard";
import { useDispatch } from "react-redux";

export default function DashboardPage() {
  const dispatch = useDispatch();

  // Fetch some default data
  useEffect(() => {
    // Color palette fetch
    dispatch(Actions.ColorPalettes.fetch(dispatch));
  }, []);

  return (
    <App>
      <Dashboard />
    </App>
  );
}

render(DashboardPage, store);
