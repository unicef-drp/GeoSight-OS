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
 * __date__ = '30/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import ListForm from "../ListForm";
import { Variables } from "../../../../../utils/Variables";
import { ZonalAnalysisConfiguration } from "./ZonalAnalysis";
import { ThemeButton } from "../../../../../components/Elements/Button";
import {
  VisibilityIcon,
  VisibilityOffIcon,
} from "../../../../../components/Icons";

import "./style.scss";

export const columns = [
  {
    field: "id",
    headerName: "id",
    hide: true,
    width: 30,
  },
  { field: "name", headerName: "columns", flex: 1 },
];

/**
 * Tools dashboard
 */
export default function ToolsForm() {
  const dispatch = useDispatch();
  const { tools } = useSelector((state) => state.dashboard.data);
  const sortedTools = tools.sort((a, b) => a.name.localeCompare(b.name));

  const allVisible = tools.every((tool) => tool.visible_by_default);
  const onToggle = (tool) => {
    dispatch(Actions.DashboardTool.updateBatchVisibility(!allVisible));
  };
  return (
    <>
      <div
        className="TableForm Tools"
        style={{
          paddingBottom: "1rem",
          display: "flex",
          alignItems: "end",
          flexDirection: "column",
        }}
      >
        <ThemeButton
          variant="primary"
          className="AllToggleVisibility"
          onClick={onToggle}
          style={{
            minWidth: "unset",
            padding: 0,
            borderRadius: "4px!important",
          }}
        >
          {allVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </ThemeButton>
      </div>
      <ListForm
        pageName={"Tools"}
        data={sortedTools}
        dataStructure={{
          group: "",
          children: sortedTools.map((row) => row.id),
        }}
        setDataStructure={(structure) => {}}
        addLayerAction={(data) => {}}
        removeLayerAction={(data) => {}}
        changeLayerAction={(data) => {
          dispatch(Actions.DashboardTool.update(data));
        }}
        initColumns={columns}
        hasGroup={false}
        otherActionsFunction={(data) => {
          if (data.name === Variables.DASHBOARD.TOOL.ZONAL_ANALYSIS) {
            return (
              <ZonalAnalysisConfiguration
                config={data.config}
                setConfig={(config) => {
                  dispatch(
                    Actions.DashboardTool.update({ ...data, config: config }),
                  );
                }}
              />
            );
          }
          return null;
        }}
      />
    </>
  );
}
