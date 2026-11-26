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
import LeftPanel, { LEFT_PANEL_TAB } from "./LeftPanel";
import MapLibre from "./MapLibre";
import RightPanel from "./MiddlePanel/RightPanel";
import MiddlePanel from "./MiddlePanel";
import { EmbedConfig } from "../../utils/embed";
import { LEFT, RIGHT } from "../../components/ToggleButton";
import { useTranslation } from "react-i18next";
import {
  isContextLayerContentVisible,
  isDashboardToolEnabled,
  isFilterContentVisible,
  isIndicatorLayerContentVisible,
  isStoryMapEnabled,
} from "../../selectors/dashboard";
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
  const indicatorLayerVisible = useSelector(isIndicatorLayerContentVisible);
  const contextLayerContentVisible = useSelector(isContextLayerContentVisible);
  const filterVisible = useSelector(isFilterContentVisible);
  const storyMapEnabled = useSelector(isStoryMapEnabled);

  const showLayerTab =
    !!EmbedConfig().layer_tab &&
    (indicatorLayerVisible || contextLayerContentVisible);
  const showFilterTab = !!EmbedConfig().filter_tab && filterVisible;
  const showWidget = EmbedConfig().widget_tab;
  const showLeftPanel = showLayerTab || showFilterTab || storyMapEnabled;
  const [leftExpanded, setLeftExpanded] = useState(
    !!EmbedConfig().layer_tab || !!EmbedConfig().filter_tab,
  );
  const [leftPanelTab, setLeftPanelTab] = useState(LEFT_PANEL_TAB.LAYERS);
  const storyMapActive = leftExpanded && leftPanelTab === LEFT_PANEL_TAB.STORY;

  /** Story Map toolbar button: open the Story tab, or leave it. */
  const toggleStoryPanel = () => {
    if (storyMapActive) {
      if (showLayerTab) {
        setLeftPanelTab(LEFT_PANEL_TAB.LAYERS);
      } else if (showFilterTab) {
        setLeftPanelTab(LEFT_PANEL_TAB.FILTERS);
      } else {
        setLeftExpanded(false);
      }
    } else {
      setLeftExpanded(true);
      setLeftPanelTab(LEFT_PANEL_TAB.STORY);
    }
  };
  const [rightExpanded, setRightExpanded] = useState(showWidget);
  const { t } = useTranslation();

  const leftPanelProps =
    showLeftPanel || !!EmbedConfig().layer_tab || !!EmbedConfig().filter_tab
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
        <>
          {/* LEFT SIDE PANEL */}
          <LeftPanel
            leftExpanded={leftExpanded}
            selectedTab={leftPanelTab}
            setSelectedTab={setLeftPanelTab}
          />

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
              storyMapEnabled={storyMapEnabled}
              storyMapActive={storyMapActive}
              onToggleStoryPanel={toggleStoryPanel}
            />
            <MiddlePanel
              leftExpanded={leftExpanded}
              setLeftExpanded={setLeftExpanded}
              rightExpanded={rightExpanded}
              setRightExpanded={setRightExpanded}
              rightContent={<RightPanel rightExpanded={rightExpanded} />}
            />
          </section>
        </>
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
