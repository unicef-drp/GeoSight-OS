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

import React, { useState } from "react";
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

  // Only show mobile nav on small screens
  const [activePanel, setActivePanel] = useState("map");
  const navItems = [
    { key: "context", icon: "📄", label: "Context" },
    { key: "indicator", icon: "📊", label: "Indicator" },
    { key: "filters", icon: "🔍", label: "Filters" },
    { key: "map", icon: "🗺️", label: "Map" },
    { key: "widgets", icon: "📈", label: "Widgets" },
  ];

  // Emit a custom event for panel switching (for integration)
  const handleNavClick = (key) => {
    setActivePanel(key);
    const event = new CustomEvent("mobilePanelSwitch", { detail: { panel: key } });
    window.dispatchEvent(event);
  };

  return (
    <>
      <footer className="MobileBottomNav">
        {navItems.map((item) => (
          <div
            key={item.key}
            className={
              "MobileBottomNav__item" +
              (activePanel === item.key ? " MobileBottomNav__item--active" : "")
            }
            onClick={() => handleNavClick(item.key)}
          >
            <span role="img" aria-label={item.label}>{item.icon}</span>
            <div style={{ fontSize: "0.75rem" }}>{item.label}</div>
          </div>
        ))}
      </footer>
    </>
  );
}
