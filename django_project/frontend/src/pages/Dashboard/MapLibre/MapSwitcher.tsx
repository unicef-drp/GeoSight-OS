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
 * __date__ = '09/06/2026'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { IndicatorLayer } from "../../../types/IndicatorLayer";
import { useDispatch, useSelector } from "react-redux";
import { selectIndicatorLayerIds } from "../../../selectors/indicatorLayers";
import { Actions } from "../../../store/dashboard";
import React from "react";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

/** Switch map between indicator layers */
export function MapLegendSwitcher({
  firstLayer,
  secondLayer,
}: {
  firstLayer: IndicatorLayer;
  secondLayer: IndicatorLayer;
}) {
  const dispatch = useDispatch();
  const indicatorLayerIds = useSelector(selectIndicatorLayerIds);
  const activeIds = indicatorLayerIds.map(String);
  const layerIdx = activeIds.indexOf(firstLayer.id.toString());
  const targetIdx = activeIds.indexOf(secondLayer.id.toString());
  return (
    <SwapVertIcon
      className="MapLegendSwapIcon Top"
      onClick={() => {
        dispatch(Actions.Map.switchIndicatorLayers(layerIdx, targetIdx));
      }}
    />
  );
}

const HORIZONTAL_POSITIONS = new Set([
  "Left",
  "Right",
  "LeftSideTop",
  "LeftSideBottom",
  "RightSideTop",
  "RightSideBottom",
]);
const CORNER_POSITIONS = new Set([
  "TopLeft",
  "TopRight",
  "BottomLeft",
  "BottomRight",
]);

const CORNER_ROTATION: Record<string, string> = {
  TopLeft: "rotate(-45deg)",
  BottomRight: "rotate(-45deg)",
  TopRight: "rotate(45deg)",
  BottomLeft: "rotate(45deg)",
};

function SwapIcon({
  posClass,
  style,
  ...props
}: {
  posClass: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  if (CORNER_POSITIONS.has(posClass)) {
    return (
      <SwapVertIcon
        {...props}
        style={{ ...style, transform: CORNER_ROTATION[posClass] }}
      />
    );
  }
  if (HORIZONTAL_POSITIONS.has(posClass))
    return <SwapHorizIcon style={style} {...props} />;
  return <SwapVertIcon style={style} {...props} />;
}

const POSITION_MAP: Record<number, Record<number, Record<number, string>>> = {
  2: {
    0: { 1: "Right" },
    1: { 0: "Left" },
  },
  3: {
    0: { 1: "Right" },
    1: { 0: "Left", 2: "Right" },
    2: { 1: "Left" },
  },
  4: {
    0: { 1: "Right", 3: "Bottom", 2: "BottomRight" },
    1: { 0: "Left", 2: "Bottom", 3: "BottomLeft" },
    2: { 1: "Top", 3: "Left", 0: "TopLeft" },
    3: { 0: "Top", 2: "Right", 1: "TopRight" },
  },
};

/** Switch map between indicator layers */
export function MapSwitcher({ idx }: { idx: number }) {
  const dispatch = useDispatch();
  const indicatorLayerIds = useSelector(selectIndicatorLayerIds);
  const count = indicatorLayerIds.length;
  const otherIndexes = indicatorLayerIds
    .map((_, i) => i)
    .filter((i) => i !== idx);
  return (
    <>
      {otherIndexes.map((targetIdx) => {
        const posClass = POSITION_MAP[count]?.[idx]?.[targetIdx] ?? "";
        if (!posClass) {
          return null;
        }
        return (
          <SwapIcon
            key={targetIdx}
            posClass={posClass}
            className={`MapLegendSwapIcon ${posClass}`}
            onClick={() => {
              dispatch(Actions.Map.switchIndicatorLayers(idx, targetIdx));
            }}
          />
        );
      })}
    </>
  );
}
