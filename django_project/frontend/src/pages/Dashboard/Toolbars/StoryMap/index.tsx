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
 * __author__ = 'ishaan.jain@emory.edu'
 * __date__ = '15/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

import React from "react";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

import { Plugin, PluginChild } from "../../MapLibre/Plugin";

interface Props {
  enabled: boolean;
  active: boolean;
  onToggle: () => void;
}

export default function StoryMapToolbar({ enabled, active, onToggle }: Props) {
  if (!enabled) {
    return null;
  }

  return (
    <Plugin className="StoryMapControl">
      <div className={active ? "Active" : ""} data-tool="Story map">
        <PluginChild
          title={"Story map"}
          disabled={false}
          active={active}
          onClick={onToggle}
        >
          <AutoStoriesIcon />
        </PluginChild>
      </div>
    </Plugin>
  );
}
