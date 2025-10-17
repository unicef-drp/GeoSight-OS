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
   DataDownloader
   ========================================================================== */

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { DownloadIcon } from "../../../../components/Icons";
import CustomPopover from "../../../../components/CustomPopover";
import { Variables } from "../../../../utils/Variables";
import { isDashboardToolEnabled } from "../../../../selectors/dashboard";
import IndicatorDataDownloader from "./IndicatorData";
import ContextLayerDownloader from "./ContextLayer";

import "./style.scss";

/**
 * DataDownloader component.
 */
const TABS = {
  INDICATOR_DATA: "Indicator data",
  CONTEXT_LAYER_DATA: "Context layer data",
};
export default function DataDownloader() {
  const { t } = useTranslation();
  const dataDownloadEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.DATA_DOWNLOAD),
  );
  const [tab, setTab] = useState(TABS.INDICATOR_DATA);

  return (
    <Plugin className="DownloadControl" hidden={!dataDownloadEnable}>
      <div data-tool={Variables.DASHBOARD.TOOL.DATA_DOWNLOAD}>
        <CustomPopover
          showCloseButton={true}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          Button={
            <div className="Active">
              <PluginChild title={"Download Data"}>
                <DownloadIcon />
              </PluginChild>
            </div>
          }
        >
          <div className={"DataDownloaderComponent"} style={{ minWidth: 400 }}>
            <div className="TabPrimary">
              <div
                className={tab === TABS.INDICATOR_DATA ? "Selected" : ""}
                onClick={() => setTab(TABS.INDICATOR_DATA)}
              >
                {t(TABS.INDICATOR_DATA)}
              </div>
              <div
                className={tab === TABS.CONTEXT_LAYER_DATA ? "Selected" : ""}
                onClick={() => setTab(TABS.CONTEXT_LAYER_DATA)}
              >
                {t(TABS.CONTEXT_LAYER_DATA)}
              </div>
            </div>
            <div
              style={{
                display: tab === TABS.INDICATOR_DATA ? "block" : "none",
              }}
            >
              <IndicatorDataDownloader />
            </div>
            <div
              style={{
                display: tab === TABS.CONTEXT_LAYER_DATA ? "block" : "none",
              }}
            >
              <ContextLayerDownloader />
            </div>
          </div>
        </CustomPopover>
      </div>
    </Plugin>
  );
}
