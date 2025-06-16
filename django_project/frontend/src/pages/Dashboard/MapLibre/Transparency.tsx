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

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import $ from "jquery";
import { useSelector } from "react-redux";
import maplibregl, { LayerSpecification } from "maplibre-gl";
import { changeTransparency } from "./utils";

export interface Props {
  map: maplibregl.Map;
}

export const IndicatorLayerTransparencyControl = forwardRef(
  ({ map }: Props, ref) => {
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

    // Update
    useImperativeHandle(ref, () => ({
      update() {
        update();
      },
    }));

    // When the transparency changed
    useEffect(() => {
      update();
    }, [indicatorLayer]);
    return <></>;
  },
);

export const ContextLayerTransparencyControl = forwardRef(
  ({ map }: Props, ref) => {
    const {
      contextLayer,
      // @ts-ignore
    } = useSelector((state) => state.map.transparency);

    const update = () => {
      map
        .getStyle()
        .layers.filter((layer: LayerSpecification) =>
          layer.id.startsWith("context-layer-"),
        )
        .map((layer: LayerSpecification) =>
          changeTransparency(map, layer.id, contextLayer / 100),
        );
    };

    // Update
    useImperativeHandle(ref, () => ({
      update() {
        update();
      },
    }));

    // When the transparency changed
    useEffect(() => {
      update();
    }, [contextLayer]);
    return <></>;
  },
);

export const TransparencyControl = forwardRef(({ map }: Props, ref) => {
  const indicatorRef = useRef(null);
  const contextRef = useRef(null);

  // Update
  useImperativeHandle(ref, () => ({
    update() {
      indicatorRef.current.update();
      contextRef.current.update();
    },
  }));
  return (
    <>
      <IndicatorLayerTransparencyControl map={map} ref={indicatorRef} />
      <ContextLayerTransparencyControl map={map} ref={contextRef} />
    </>
  );
});
