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

/* ==========================================================================
   NAVBAR
   ========================================================================== */

import React from "react";
import $ from "jquery";
import { useTranslation } from "react-i18next";

import "./style.scss";

/** Footer **/
export default function Footer() {
  const { icon } = preferences;
  const { t, i18n } = useTranslation();

  const homepageUrl = "/" + i18n.language.toLowerCase();
  // Set width of logo
  // Not working using css on firefox
  $(".page__header-logo").width($(".page__header-link").width());
  return (
    <footer>
      <div className="Footer">
        <a
          href={homepageUrl}
          title={i18n.t("Homepage")}
          className="nav-header-link"
        >
          <img src={icon} alt="Logo" />
        </a>
        <div className="FooterTitle">
          Version <span className="FooterVersion">{version}</span>
        </div>
      </div>
    </footer>
  );
}
