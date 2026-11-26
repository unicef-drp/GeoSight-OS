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
 * __date__ = '26/11/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   Map toolbar button: play the Story Map in cinematic (full screen) mode.
   Shown when the project enables the cinematic mode.
   ========================================================================== */

import React from "react";
import { useTranslation } from "react-i18next";

import { Plugin, PluginChild } from "../../MapLibre/utils/Plugin";
import { StoryPlayIcon } from "../../../../components/Icons";
import { useStoryPlayback } from "../../LeftPanel/StoryMap/StoryPlayback";

export default function StoryCinematicToolbar() {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  if (!playback.cinematicEnabled || !playback.total) {
    return null;
  }
  return (
    <Plugin className="StoryCinematicControl">
      <div data-testid="story-map-cinematic-toolbar">
        <PluginChild
          title={t("dashboardPage.storyMap.cinematic")}
          disabled={false}
          active={false}
          onClick={() => playback.setCinematic(true)}
        >
          <StoryPlayIcon />
        </PluginChild>
      </div>
    </Plugin>
  );
}
