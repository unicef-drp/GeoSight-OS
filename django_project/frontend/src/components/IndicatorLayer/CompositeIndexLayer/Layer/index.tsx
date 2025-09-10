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
 * __date__ = '03/09/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

/* ==========================================================================
   Composite Layer
   ========================================================================== */

import React, { useEffect } from "react";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import {
  IndicatorLayer as IndicatorLayerType
} from "../../../../types/IndicatorLayer";
import { useDispatch, useSelector } from "react-redux";
import IndicatorLayer from "../../../Map/SidePanelTree/IndicatorLayer";
import { CompositeIndexLayerType } from "../../../../utils/indicatorLayer";
import { Actions } from "../../../../store/dashboard";
import { CogIcon } from "../../../Icons";
import { defaultCompositeIndexLayer } from "../variable";
import { getDashboardTool } from "../../../../selectors/dashboard";
import { Variables } from "../../../../utils/Variables";
import CompositeIndexLayerConfig from "../Config";

import "./style.scss";

/** Composite index layer.*/
export default function CompositeIndexLayer() {
  const dispatch = useDispatch();
  // @ts-ignore
  const compositeMode = useSelector((state) => state.mapMode.compositeMode);
  // @ts-ignore
  const data = useSelector((state) => state.compositeIndicatorLayer.data);
  const tool = useSelector(
    getDashboardTool(Variables.DASHBOARD.TOOL.COMPOSITE_INDEX_LAYER),
  );

  const layer: IndicatorLayerType = {
    id: -1000,
    name: CompositeIndexLayerType,
    description: "Composite index layer",
    type: CompositeIndexLayerType,
    indicators: [],
    visible_by_default: true,
    last_update: "",
    related_tables: [],
    error: "",
    config: {},
  };

  /** Update data when opened **/
  useEffect(() => {
    const config = tool.config ? tool.config : defaultCompositeIndexLayer();
    dispatch(Actions.CompositeIndicatorLayer.update({ ...layer, ...config }));
  }, [compositeMode]);

  if (!compositeMode) {
    return null;
  }
  return (
    <TreeItem
      className={"TreeItem SidePanelTreeItem Mui-selected"}
      key={layer.id}
      nodeId={layer.id.toString()}
      label={
        <IndicatorLayer
          layer={layer}
          nodesDataId={layer.id.toString()}
          checked={true}
          selected={[]}
          filterText={""}
          selectItem={() => {}}
          maxWord={0}
          maxSelect={1}
          otherElement={
            <>
              <CompositeIndexLayerConfig
                config={data}
                setConfig={(config) => {
                  dispatch(Actions.CompositeIndicatorLayer.update(config));
                }}
                icon={
                  <CogIcon
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                }
                showGeneral={true}
              />
              <DoDisturbOnIcon
                onClick={() => {
                  dispatch(Actions.MapMode.toggleCompositeMode());
                }}
              />
            </>
          }
        />
      }
    />
  );
}
