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
 * __date__ = '14/08/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   NAVBAR FOOTER FOR MOBILE
   ========================================================================== */

import React, { useState } from "react";
import { useSelector } from "react-redux";
import $ from "jquery";
import { useTranslation } from "react-i18next";
import {
  FilterIcon,
  GraphIcon,
  LayerIcon,
  ListIcon,
  MapActiveIcon,
} from "../Icons";
import {
  isContextLayerContentVisible,
  isFilterContentVisible,
  isIndicatorLayerContentVisible,
} from "../../selectors/dashboard";

import "./style.scss";

/** MobileBottomNav **/
export default function MobileBottomNav() {
  const { t, i18n } = useTranslation();
  const [activePanel, setActivePanel] = useState("Map");

  const indicatorLayerVisible = useSelector(isIndicatorLayerContentVisible());
  const contextLayerContentVisible = useSelector(
    isContextLayerContentVisible(),
  );
  const filterVisible = useSelector(isFilterContentVisible());

  const navItems = [{ key: t("Map"), icon: <MapActiveIcon /> }];
  if (contextLayerContentVisible) {
    navItems.push({ key: t("Context Layers"), icon: <ListIcon /> });
  }
  if (indicatorLayerVisible) {
    navItems.push({ key: t("Indicators"), icon: <LayerIcon /> });
  }
  if (filterVisible) {
    navItems.push({ key: t("Filter"), icon: <FilterIcon /> });
  }
  navItems.push({ key: t("Widget"), icon: <GraphIcon /> });
  const className = (key) => {
    return "Mobile_" + key.replace(" ", "_");
  };

  // Emit a custom event for panel switching (for integration)
  const handleNavClick = (key) => {
    setActivePanel(key);
    navItems.map((item) => {
      $("html").removeClass(className(item.key));
    });
    $("html").addClass(className(key));
  };

  return (
    <>
      <footer className="MobileBottomNav">
        {navItems.map((item) => (
          <div
            key={item.key}
            className={"Item" + (activePanel === item.key ? " Active" : "")}
            onClick={() => handleNavClick(item.key)}
            data-item={item.key}
          >
            {item.icon}
          </div>
        ))}
      </footer>
    </>
  );
}
