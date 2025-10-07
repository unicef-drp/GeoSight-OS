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
import { EditorProps } from "../type";
import { ImageInput, NumberInput } from "../Input";

export function Symbol({ layer, setLayer }: EditorProps) {
  const layerAttr = "layout";
  if (!layer[layerAttr]) {
    return (
      <div>
        No layout attributes on this layer. Please delete and recreate this.
      </div>
    );
  }
  return (
    <>
      <ImageInput
        layer={layer}
        setLayer={setLayer}
        layerAttr={layerAttr}
        styleKey="icon-image"
      />
      <NumberInput
        layer={layer}
        setLayer={setLayer}
        layerAttr={layerAttr}
        styleKey="icon-size"
        min={0}
        max={100}
        step={0.1}
        help={"(percentage)"}
      />
    </>
  );
}
