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
   LEFT SIDE CONTAINER
   ========================================================================== */

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useTranslation } from "react-i18next";

import { Actions } from "../../../store/dashboard";
import { LEFT, RIGHT } from "../../../components/ToggleButton";
import ContextLayersAccordion from "./ContextLayers";
import Indicators from "./Indicators";
import IndicatorLayersAccordion from "./IndicatorLayers";
import RelatedTables from "./RelatedTable";
import FiltersAccordion from "./Filters";
import StoryMap from "./StoryMap";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import {
  FilterIcon,
  LayerIcon,
  VisibilityIcon,
  VisibilityOffIcon,
} from "../../../components/Icons";
import TabPanel, { tabProps } from "../../../components/Tabs/index";
import { EmbedConfig } from "../../../utils/embed";
import {
  isContextLayerContentVisible,
  isFilterContentVisible,
  isIndicatorLayerContentVisible,
  isStoryMapEnabled,
} from "../../../selectors/dashboard";

import "./style.scss";

/**
 * Context layer visibility
 */
export function ContextLayerVisibility() {
  const dispatch = useDispatch();
  const contextLayersShow = useSelector(
    (state) => state.map?.contextLayersShow,
  );

  const handleVisibility = (e) => {
    e.stopPropagation();
    dispatch(Actions.Map.showHideContextLayer(!contextLayersShow));
  };
  const props = {
    className: "MuiTab-iconWrapper LayerVisibilityToggle",
    "data-testid": "context-layers-visibility",
    "data-visible": contextLayersShow ? "true" : "false",
    onClick: handleVisibility,
  };
  return contextLayersShow ? (
    <VisibilityIcon {...props} />
  ) : (
    <VisibilityOffIcon {...props} />
  );
}

/**
 * Indicators visibility
 */
export function IndicatorsVisibility() {
  const dispatch = useDispatch();
  const indicatorShow = useSelector((state) => state.map?.indicatorShow);

  const handleVisibility = (e) => {
    e.stopPropagation();
    dispatch(Actions.Map.showHideIndicator(!indicatorShow));
  };

  const props = {
    className: "MuiTab-iconWrapper LayerVisibilityToggle",
    "data-testid": "indicators-visibility",
    "data-visible": indicatorShow ? "true" : "false",
    onClick: handleVisibility,
  };
  return indicatorShow ? (
    <VisibilityIcon {...props} />
  ) : (
    <VisibilityOffIcon {...props} />
  );
}

/** Keys of the left panel tabs; also used for the tab ids. */
export const LEFT_PANEL_TAB = {
  LAYERS: "Layers",
  FILTERS: "Filters",
  STORY: "Story",
};

/**
 * Left panel.
 */
export default function LeftPanel({ leftExpanded, selectedTab, setSelectedTab }) {
  const indicatorLayerVisible = useSelector(isIndicatorLayerContentVisible);
  const contextLayerContentVisible = useSelector(isContextLayerContentVisible);
  const filterVisible = useSelector(isFilterContentVisible);
  const storyVisible = useSelector(isStoryMapEnabled);
  const state = leftExpanded ? LEFT : RIGHT;
  const showLayerTab =
    !!EmbedConfig().layer_tab &&
    (indicatorLayerVisible || contextLayerContentVisible);
  const showFilterTab = !!EmbedConfig().filter_tab && filterVisible;
  const [tab2Value, setTab2Value] = React.useState(
    indicatorLayerVisible ? 1 : 0,
  );
  const { t } = useTranslation();

  const tabs = [];
  if (showLayerTab) {
    tabs.push({
      key: LEFT_PANEL_TAB.LAYERS,
      className: "layers-tab",
      label: t("dashboardPage.layers"),
      icon: <LayerIcon />,
    });
  }
  if (showFilterTab) {
    tabs.push({
      key: LEFT_PANEL_TAB.FILTERS,
      className: "filters-tab",
      label: t("dashboardPage.filters"),
      icon: <FilterIcon />,
    });
  }
  if (storyVisible) {
    tabs.push({
      key: LEFT_PANEL_TAB.STORY,
      className: "story-tab",
      label: "Story",
      icon: <MenuBookIcon />,
    });
  }
  const tabKeys = tabs.map((tab) => tab.key).join(",");

  // Select the first available tab when the selected one is not available.
  React.useEffect(() => {
    if (tabs.length && !tabs.find((tab) => tab.key === selectedTab)) {
      setSelectedTab(tabs[0].key);
    }
  }, [selectedTab, tabKeys]);

  const handleChangeTab2 = (event, newValue) => {
    setTab2Value(newValue);
  };
  const className = `dashboard__panel dashboard__left_side ${state}`;
  const classNameWrapper = `dashboard__content-wrapper`;
  return (
    <section
      className={
        className +
        (!showLayerTab ? " HideLayer " : "") +
        (!showFilterTab ? " HideFilter " : "")
      }
    >
      <div className={classNameWrapper}>
        <Box sx={{ width: "100%" }}>
          {tabs.length > 1 && (
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={selectedTab}
                onChange={(event, newValue) => setSelectedTab(newValue)}
                aria-label="basic tabs example"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.key}
                    value={tab.key}
                    className={tab.className}
                    label={tab.label}
                    icon={tab.icon}
                    iconPosition="start"
                    {...tabProps(tab.key)}
                  />
                ))}
              </Tabs>
            </Box>
          )}
          <TabPanel
            value={selectedTab}
            index={LEFT_PANEL_TAB.LAYERS}
            className={"sidepanel-tab layers-tab"}
          >
            <Box sx={{ width: "100%" }}>
              {indicatorLayerVisible && contextLayerContentVisible && (
                <Box
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                  className={"layers-tab-container"}
                >
                  <Tabs
                    value={tab2Value}
                    onChange={handleChangeTab2}
                    aria-label="basic tabs example"
                  >
                    <Tab
                      label={t("dashboardPage.contextLayers")}
                      icon={<ContextLayerVisibility />}
                      iconPosition="end"
                      {...tabProps("context-layer")}
                    />
                    <Tab
                      label={t("dashboardPage.indicators")}
                      icon={<IndicatorsVisibility />}
                      iconPosition="end"
                      {...tabProps("indicator")}
                    />
                  </Tabs>
                </Box>
              )}
              {contextLayerContentVisible && (
                <TabPanel
                  id={"context-layer-tab-panel"}
                  value={tab2Value}
                  index={0}
                  className={"sidepanel-tab layers-panel"}
                >
                  <ContextLayersAccordion />
                </TabPanel>
              )}
              <TabPanel
                id={"indicator-tab-panel"}
                value={tab2Value}
                index={1}
                className={"sidepanel-tab layers-panel"}
              >
                <IndicatorLayersAccordion />
              </TabPanel>
            </Box>
            <Indicators />
            <RelatedTables />
          </TabPanel>
          <TabPanel
            id={"filter-tab-panel"}
            value={selectedTab}
            index={LEFT_PANEL_TAB.FILTERS}
            className={"sidepanel-tab filters-tab-content"}
          >
            <FiltersAccordion />
          </TabPanel>
          {storyVisible && (
            <TabPanel
              id={"story-tab-panel"}
              value={selectedTab}
              index={LEFT_PANEL_TAB.STORY}
              className={"sidepanel-tab story-tab-content"}
            >
              <StoryMap isActive={selectedTab === LEFT_PANEL_TAB.STORY} />
            </TabPanel>
          )}
        </Box>
      </div>
    </section>
  );
}
