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
import { ProjectOverview } from "./Toolbars";
import { useTranslation } from "react-i18next";
import {
  isContextLayerContentVisible,
  isDashboardToolEnabled,
  isFilterContentVisible,
  isIndicatorLayerContentVisible,
} from "../../selectors/dashboard";
import { Variables } from "../../utils/Variables";

import "./style.scss";

function isToolbarVisible(value) {
  return value !== false && value !== "false";
}

export default function Dashboard({ children, dashboardUrlAPI = null }) {
  const dispatch = useDispatch();
  const widgets = useSelector((state) => state.dashboard.data?.widgets);
  const indicatorLayerVisible = useSelector(isIndicatorLayerContentVisible());
  const contextLayerContentVisible = useSelector(
    isContextLayerContentVisible(),
  );
  const filterVisible = useSelector(isFilterContentVisible());
  const storyMapEnabled = useSelector(
    (state) => state.dashboard.data?.story_map_enabled,
  );
  const user_permission = useSelector(
    (state) => state.dashboard.data?.user_permission,
  );
  const show_map_toolbar = useSelector((state) =>
    isToolbarVisible(state.dashboard.data.show_map_toolbar),
  );
  const entitySearchEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.ENTITY_SEARCH_BOX),
  );

  const showLayerTab =
    !!EmbedConfig().layer_tab &&
    (indicatorLayerVisible || contextLayerContentVisible);
  const showFilterTab = !!EmbedConfig().filter_tab && filterVisible;
  const showWidget = EmbedConfig().widget_tab;
  const showLeftPanel = showLayerTab || showFilterTab || storyMapEnabled;
  const [leftExpanded, setLeftExpanded] = useState(
    showLeftPanel,
  );
  const [leftPanelTab, setLeftPanelTab] = useState(
    showLayerTab ? "layers" : showFilterTab ? "filters" : "story",
  );
  const [rightExpanded, setRightExpanded] = useState(showWidget);
  const { t } = useTranslation();

  const leftPanelProps =
    showLeftPanel
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
    dispatch(
      Actions.Dashboard.fetch(dispatch, dashboardUrlAPI || urls.dashboardData),
    );
  }, [dispatch, dashboardUrlAPI]);

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
        <Fragment>
          <MapLibre
            leftPanelProps={leftPanelProps}
            rightPanelProps={rightPanelProps}
            storyMapEnabled={storyMapEnabled}
            storyMapActive={leftExpanded && leftPanelTab === "story"}
            onToggleStoryPanel={() => {
              if (leftExpanded && leftPanelTab === "story") {
                if (showLayerTab) {
                  setLeftPanelTab("layers");
                  setLeftExpanded(true);
                } else if (showFilterTab) {
                  setLeftPanelTab("filters");
                  setLeftExpanded(true);
                } else {
                  setLeftExpanded(false);
                }
              } else {
                setLeftExpanded(true);
                setLeftPanelTab("story");
              }
            }}
          />
          <LeftPanel
            leftExpanded={leftExpanded}
            selectedTab={leftPanelTab}
            setSelectedTab={setLeftPanelTab}
          />
          <MiddlePanel
            leftExpanded={leftExpanded}
            setLeftExpanded={setLeftExpanded}
            rightExpanded={rightExpanded}
            setRightExpanded={setRightExpanded}
            leftContent={
              <div className="ButtonSection">
                <ProjectOverview />
              </div>
            }
            rightContent={<RightPanel rightExpanded={rightExpanded} />}
          ></MiddlePanel>
        </Fragment>
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
