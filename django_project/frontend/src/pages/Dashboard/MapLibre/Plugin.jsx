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
   MAP PLUGIN
   ========================================================================== */

import React from "react";

export function PluginChild({ title, disabled, active, children, ...props }) {
  return (
    <div
      className={
        "ToolbarChild " +
        (disabled ? "Disabled " : "") +
        (active ? "Active " : "")
      }
    >
      <a title={title} {...props}>
        {children}
      </a>
    </div>
  );
}

export function Plugin({ className, hidden = false, children }) {
  return (
    <div
      className={"ToolbarControl " + (className ? className : "")}
      style={{ display: hidden ? "none" : "inherit" }}
    >
      {children}
    </div>
  );
}
