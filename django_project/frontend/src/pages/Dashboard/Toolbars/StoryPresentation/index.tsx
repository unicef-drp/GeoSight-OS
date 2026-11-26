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
   Map toolbar button: play the Story Map in presentation (full screen) mode.
   Shown when the project enables the presentation mode; part of the share and
   story group of the main tools (MapLibre/index.jsx).
   ========================================================================== */

import React from "react";
import { useTranslation } from "react-i18next";

import { Plugin, PluginChild } from "../../MapLibre/utils/Plugin";
import { StoryPlayIcon } from "../../../../components/Icons";
import { useStoryPlayback } from "../../LeftPanel/StoryMap/StoryPlayback";

export default function StoryPresentationToolbar() {
  const { t } = useTranslation();
  const playback = useStoryPlayback();
  if (!playback.presentationEnabled || !playback.total) {
    return null;
  }
  return (
    <Plugin className="StoryPresentationControl">
      <div data-testid="story-map-presentation-toolbar">
        <PluginChild
          title={t("dashboardPage.storyMap.presentation")}
          disabled={false}
          active={false}
          onClick={() => playback.setPresentation(true)}
        >
          <StoryPlayIcon />
        </PluginChild>
      </div>
    </Plugin>
  );
}
