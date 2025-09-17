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
 * __date__ = '17/09/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

/* ==========================================================================
   Composite Index Layer Toggler
   ========================================================================== */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  disabledCompositeLayer,
  isEligibleForCompositeLayer,
} from "./utilities";
import { delay, dictDeepCopy } from "../../../utils/main";
import { Actions } from "../../../store/dashboard";

export interface Props {
  ActiveIcon: React.ReactElement;
  InactiveIcon: React.ReactElement;
}

export default function CompositeIndexLayerToggler({
  ActiveIcon,
  InactiveIcon,
}: Props) {
  const dispatch = useDispatch();
  const indicatorLayers = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data.indicatorLayers,
  );
  const indicatorLayersStructure = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.indicatorLayersStructure,
  );
  const currentIndicatorLayer = useSelector(
    // @ts-ignore
    (state) => state.selectedIndicatorLayer,
  );
  // @ts-ignore
  const compositeMode = useSelector((state) => state.mapMode.compositeMode);
  const enabled =
    compositeMode || isEligibleForCompositeLayer(currentIndicatorLayer);

  // ----------------------------------------------
  // UPDATE CHECK
  // ----------------------------------------------
  const data = dictDeepCopy(
    // @ts-ignore
    useSelector((state) => state.compositeIndicatorLayer.data),
  );
  const cleanData = data;
  if (!cleanData) {
    cleanData.indicatorLayers = data.indicatorLayers.map((layer: any) => {
      return { id: layer.id, weight: layer.weight, invert: layer.invert };
    });
  }
  const [lastData, setLastData] = useState("");
  useEffect(() => {
    if (!compositeMode) {
      setLastData("");
    }
  }, [compositeMode]);
  useEffect(() => {
    if (compositeMode) {
      if (!lastData) {
        setLastData(JSON.stringify(cleanData));
      }
    }
  }, [cleanData]);

  const handleActiveClick = () => {
    if (JSON.stringify(cleanData) !== lastData) {
      if (
        window.confirm(
          "You still have unsaved changes, do you want to discard them?",
        )
      ) {
      } else {
        return;
      }
    }
    if (enabled) {
      disabledCompositeLayer(
        dispatch,
        indicatorLayers,
        indicatorLayersStructure,
      );
    }
  };
  const handleInactiveClick = async () => {
    if (enabled) {
      await delay(100);
      dispatch(Actions.MapMode.toggleCompositeMode());
    }
  };

  return (
    <>
      {compositeMode ? (
        React.cloneElement(ActiveIcon, {
          onClick: handleActiveClick,
        })
      ) : (
        <span className={enabled ? "" : "Disabled"}>
          {React.cloneElement(InactiveIcon, {
            onClick: handleInactiveClick,
          })}
        </span>
      )}
    </>
  );
}
