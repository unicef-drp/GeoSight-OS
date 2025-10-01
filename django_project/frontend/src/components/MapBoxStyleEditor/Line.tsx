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
 * __date__ = '01/10/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Mapbox style editor
   ========================================================================== */

import React from "react";
import { EditorProps } from "./type";
import { ColorSelectorStyle, NumberInput } from "./Input";

export function Line({ layer, setLayer }: EditorProps) {
  const layerAttr = "paint";
  if (!layer[layerAttr]) {
    return (
      <div>
        No paint attributes on this layer. Please delete and recreate this.
      </div>
    );
  }
  return (
    <>
      <ColorSelectorStyle
        layer={layer}
        setLayer={setLayer}
        layerAttr={layerAttr}
        styleKey="line-color"
      />
      <NumberInput
        layer={layer}
        setLayer={setLayer}
        layerAttr={layerAttr}
        styleKey="line-width"
        min={0}
        max={100}
        step={1}
      />
      <NumberInput
        layer={layer}
        setLayer={setLayer}
        layerAttr={layerAttr}
        styleKey="line-opacity"
        min={0}
        max={1}
        step={0.1}
      />
    </>
  );
}
