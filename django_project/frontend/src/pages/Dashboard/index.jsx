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

import React, { Fragment, useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch, useSelector } from "react-redux";

import { Actions } from "../../store/dashboard";
import LeftPanel from "./LeftPanel";
import MapLibre from "./MapLibre";
import RightPanel from "./MiddlePanel/RightPanel";
import MiddlePanel from "./MiddlePanel";
import { EmbedConfig } from "../../utils/embed";
import { LEFT, RIGHT } from "../../components/ToggleButton";
import { useTranslation } from "react-i18next";
import {
  isDashboardToolEnabled,
  isStoryMapEnabled,
} from "../../selectors/dashboard";
import {
  StoryPlaybackProvider,
} from "./LeftPanel/StoryMap/StoryPlayback";
import StoryPresentation from "./LeftPanel/StoryMap/Presentation";
import { Variables } from "../../utils/Variables";

import "./style.scss";

export default function Dashboard({ children }) {
  const dispatch = useDispatch();
  const widgets = useSelector((state) => state.dashboard.data?.widgets);
  const user_permission = useSelector(
    (state) => state.dashboard.data?.user_permission,
  );
  const show_map_toolbar = useSelector(
    (state) => state.dashboard.data.show_map_toolbar,
  );
  const entitySearchEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.ENTITY_SEARCH_BOX),
  );
  const storyMapEnabled = useSelector(isStoryMapEnabled);

  const showLayerTab = !!EmbedConfig().layer_tab;
  const showFilterTab = !!EmbedConfig().filter_tab;
  const showWidget = EmbedConfig().widget_tab;
  const [leftExpanded, setLeftExpanded] = useState(
    showLayerTab || showFilterTab,
  );
  const [rightExpanded, setRightExpanded] = useState(showWidget);
  const { t } = useTranslation();

  const leftPanelProps =
    showLayerTab || showFilterTab || storyMapEnabled
      ? {
          className: "LeftButton",
          initState: leftExpanded ? LEFT : RIGHT,
          active: leftExpanded,
          onLeft: () => {
            setLeftExpanded(true);
          },
          onRight: () => {
            setLeftExpanded(false);
          },
        }
      : null;

  const rightPanelProps =
    showWidget && widgets?.filter((widget) => widget.visible_by_default).length
      ? {
          className: "RightButton",
          initState: rightExpanded ? RIGHT : LEFT,
          active: rightExpanded,
          onLeft: () => {
            setRightExpanded(false);
          },
          onRight: () => {
            setRightExpanded(true);
          },
        }
      : null;

  // Fetch data of dashboard
  useEffect(() => {
    dispatch(Actions.Dashboard.fetch(dispatch));
  }, []);

  return (
    <div
      className={
        "dashboard " +
        (leftExpanded ? "LeftExpanded" : "") +
        (entitySearchEnable ? " EntitySearchEnable" : " EntitySearchDisable") +
        (show_map_toolbar ? "" : " HideToolbar")
      }
    >
      {user_permission ? (
        <StoryPlaybackProvider>
          {/* LEFT SIDE PANEL */}
          <LeftPanel leftExpanded={leftExpanded} />

          {/* CONTENT PANEL */}
          <section
            className={
              "DashboardMiddlePanel " +
              (rightExpanded ? "RightExpanded " : "") +
              (!EmbedConfig().map ? "HiddenMap " : "")
            }
          >
            <MapLibre
              leftPanelProps={leftPanelProps}
              rightPanelProps={rightPanelProps}
            />
            <MiddlePanel
              leftExpanded={leftExpanded}
              setLeftExpanded={setLeftExpanded}
              rightExpanded={rightExpanded}
              setRightExpanded={setRightExpanded}
              rightContent={<RightPanel rightExpanded={rightExpanded} />}
            />
          </section>

          {/* STORY MAP PRESENTATION MODE (full screen) */}
          <StoryPresentation />
        </StoryPlaybackProvider>
      ) : (
        <div className="LoadingElement">
          <div className="Throbber">
            <CircularProgress thickness={2} />
            {t("dashboardPage.loadingDashboardData")}
          </div>
        </div>
      )}
      {children ? children : ""}
    </div>
  );
}
