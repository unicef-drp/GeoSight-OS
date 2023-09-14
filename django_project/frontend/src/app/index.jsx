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

import React, { Component } from 'react';
import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import c from 'classnames';
import NavBar from '../components/Navbar';
import { EmbedConfig } from "../utils/embed";

import './mui.scss';
import './app.scss';
import './form.scss';
import './form.small.scss';


// Sentry.init({
//     dsn: window.SENTRY_DSN,
// });


/**
 * Base App
 * @param {string} className Class name for modal
 * @param {React.Component} children React component to be rendered
 */
export default function App({ className, children, ...props }) {
  return (
    <div className={c('page', className) + (EmbedConfig().id ? ' Embed' : '')}>
      {
        !props.hideNavbar ? <NavBar/> : null
      }
      <main>
        {children}
      </main>
    </div>
  );
}

/** --------------------------------
 * RENDER APP
 * --------------------------------
 */
export function render(App, store) {
  const root = createRoot(document.getElementById('app'));
  root.render(
    <Provider store={store}>
      <App/>
    </Provider>
  )
}
