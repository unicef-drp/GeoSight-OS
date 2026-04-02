/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
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
