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
 * __date__ = '16/06/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect } from "react";
import $ from "jquery";
import { useSelector } from "react-redux";
import maplibregl, { LayerSpecification } from "maplibre-gl";
import { changeTransparency } from "./utils";

export interface Props {
  map: maplibregl.Map;
}

export function IndicatorLayerTransparencyControl({ map }: Props) {
  const {
    indicatorLayer,
    // @ts-ignore
  } = useSelector((state) => state.map.transparency);

  const update = () => {
    map
      .getStyle()
      .layers.filter(
        (layer: LayerSpecification) =>
          layer.id.startsWith("reference-layer-") ||
          layer.id.startsWith("indicator-label"),
      )
      .map((layer: LayerSpecification) =>
        changeTransparency(map, layer.id, indicatorLayer / 100),
      );
    $(".centroid-chart").css("opacity", indicatorLayer / 100);
  };

  // When the transparency changed
  useEffect(() => {
    update();
  }, [indicatorLayer]);
  return <></>;
}

export function ContextLayerTransparencyControl({ map }: Props) {
  const {
    contextLayer,
    // @ts-ignore
  } = useSelector((state) => state.map.transparency);

  // When the transparency changed
  useEffect(() => {
    console.log("contextLayer", map.getStyle().layers);
  }, [contextLayer]);

  return <></>;
}

export function TransparencyControl({ map }: Props) {
  return (
    <>
      <IndicatorLayerTransparencyControl map={map} />
      <ContextLayerTransparencyControl map={map} />
    </>
  );
}
