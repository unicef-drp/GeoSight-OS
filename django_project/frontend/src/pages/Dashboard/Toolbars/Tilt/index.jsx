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
   Tilt
   ========================================================================== */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Plugin, PluginChild } from "../../MapLibre/utils/Plugin";
import { Actions } from "../../../../store/dashboard";

import "./style.scss";

/** Tilt control */
export default function Tilt() {
  const dispatch = useDispatch();
  const { position, is3dMode } = useSelector(
    // @ts-ignore
    (state) => state.map,
  );
  const pitch = position?.value?.pitch || 0;
  const [degree, setDegree] = useState(false);

  const update = (pitch) => {
    dispatch(
      Actions.Map.changePosition({
        pitch: pitch,
      }),
    );
  };
  /** Map created */
  useEffect(() => {
    if (is3dMode) {
      update(60);
    }
  }, [is3dMode]);

  /** Map created */
  useEffect(() => {
    if (pitch === undefined) return;
    setDegree(Math.floor(90 - pitch));
  }, [pitch]);

  return (
    <Plugin className={"TiltControl"}>
      <PluginChild
        title={
          "Reset tilt. Hold left Ctrl and click left mouse button on a map and move the cursor up/down to change tilt"
        }
        onClick={() => {
          const degree = pitch;
          if (degree === 60) {
            update(0);
          } else if (degree === 0) {
            update(60);
          } else if (degree <= 30) {
            update(0);
          } else {
            update(60);
          }
        }}
      >
        <div className="TiltDegree">{degree}</div>
      </PluginChild>
    </Plugin>
  );
}
