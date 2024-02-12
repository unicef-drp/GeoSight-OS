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

import React, {Component} from 'react';
import {createRoot} from "react-dom/client";
import {Provider} from 'react-redux';
import c from 'classnames';
import NavBar from '../components/Navbar';
import {EmbedConfig} from "../utils/embed";
import {urlParams} from "../utils/main";

import './mui.scss';
import './app.scss';
import './form.scss';
import './form.small.scss';
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "../dev";


/**
 * Base App
 * @param {string} className Class name for modal
 * @param {React.Component} children React component to be rendered
 */
export default function App({className, children, ...props}) {
  // Check if child window, don't show navbar
  const parentWindow = window.opener?.parent;
  if (parentWindow) {
    // This message is for form
    const {success} = urlParams();
    if (objectId && success) {
      parentWindow.postMessage(objectId);
      window.close();
    }
  }

  return (
    <div
      className={c('page', className) + (EmbedConfig().id ? ' Embed' : '') + (parentWindow ? ' PopupMode' : '')}>
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
      <DevSupport ComponentPreviews={ComponentPreviews}
                  useInitialHook={useInitial}
      >
        <App/>
      </DevSupport>
    </Provider>
  )
}
