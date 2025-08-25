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
 * __author__ = 'zakki@kartoza.com'
 * __date__ = '08/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Toggle Side  Panel
   ========================================================================== */

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import {
  GraphCheckedIcon,
  GraphUncheckedIcon,
  LeftPanelCheckedIcon,
  LeftPanelUncheckedIcon,
} from "../../../../components/Icons/index";
import { LEFT, RIGHT } from "../../../../components/ToggleButton";
import { isDashboardToolEnabled } from "../../../../selectors/dashboard";
import { Variables } from "../../../../utils/Variables";

import "./style.scss";

/**
 * ToggleSidePanel.
 */
export default function ToggleSidePanel({
  initState,
  onLeft,
  onRight,
  ...props
}) {
  const leftPanelToggleEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.LEFT_PANEL_TOGGLE),
  );
  const rightPanelToggleEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.WIDGET_PANEL_TOGGLE),
  );

  const [state, setState] = useState(
    props.className === "LeftButton" ? LEFT : RIGHT,
  );
  const [active, setActive] = useState("");

  useEffect(() => {
    setState(initState);
    setActive("Active");
  }, []);

  const change = () => {
    const newState = state === RIGHT ? LEFT : RIGHT;
    setState(newState);

    if (newState === LEFT) {
      onLeft();
    } else if (newState === RIGHT) {
      onRight();
    }
    if (
      (props.className === "LeftButton" && newState === LEFT) ||
      (props.className === "RightButton" && newState === RIGHT)
    ) {
      setActive("Active");
    } else {
      setActive("");
    }
  };

  if (!leftPanelToggleEnable && props.className === "LeftButton") {
    return null;
  }
  if (!rightPanelToggleEnable && props.className === "RightButton") {
    return null;
  }

  return (
    <Plugin className={props.className}>
      <div
        className="Active Fullscreen"
        data-tool={
          props.className === "LeftButton"
            ? Variables.DASHBOARD.TOOL.LEFT_PANEL_TOGGLE
            : Variables.DASHBOARD.TOOL.WIDGET_PANEL_TOGGLE
        }
      >
        <PluginChild
          title={"Toggle Panel"}
          onClick={() => {
            change();
          }}
        >
          {props.className === "LeftButton" ? (
            active === "Active" ? (
              <LeftPanelCheckedIcon />
            ) : (
              <LeftPanelUncheckedIcon />
            )
          ) : active === "Active" ? (
            <GraphCheckedIcon />
          ) : (
            <GraphUncheckedIcon />
          )}
        </PluginChild>
      </div>
    </Plugin>
  );
}
