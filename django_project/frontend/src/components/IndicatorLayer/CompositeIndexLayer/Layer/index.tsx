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

import React from "react";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import {
  IndicatorLayer as IndicatorLayerType
} from "../../../../types/IndicatorLayer";
import { useSelector } from "react-redux";
import IndicatorLayer from "../../../Map/SidePanelTree/IndicatorLayer";
import { CompositeIndexLayerType } from "../../../../utils/indicatorLayer";

import "./style.scss";

/** Composite index layer.*/
export default function CompositeIndexLayer() {
  // @ts-ignore
  const compositeMode = useSelector((state) => state.mapMode.compositeMode);
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
        />
      }
    />
  );
}
