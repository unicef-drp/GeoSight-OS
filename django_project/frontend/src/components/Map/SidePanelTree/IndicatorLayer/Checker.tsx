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
 * __date__ = '09/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect } from "react";
import { IndicatorLayer } from "../../../../types/IndicatorLayer";
import { useSelector } from "react-redux";
import { DynamicIndicatorType } from "../../../../utils/indicatorLayer";
import { getIndicatorDataId } from "../../../../utils/indicatorData";

export interface Props {
  layer?: IndicatorLayer;

  setIsLoading: (value: boolean) => void;
  setError: (value: string) => void;
}

export function Checker({ layer, setIsLoading, setError }: Props) {
  const layerReferenceLayer = layer?.level_config?.referenceLayer?.identifier;
  // @ts-ignore
  const { referenceLayer } = useSelector((state) => state.dashboard.data);
  // @ts-ignore
  const indicatorsData = useSelector((state) => state.indicatorsData);
  const currentIndicatorLayer = useSelector(
    // @ts-ignore
    (state) => state.selectedIndicatorLayer,
  );
  const currentIndicatorSecondLayer = useSelector(
    // @ts-ignore
    (state) => state.selectedIndicatorSecondLayer,
  );
  const activate = [
    currentIndicatorLayer?.id,
    currentIndicatorSecondLayer?.id,
  ].includes(layer.id);

  /** When not activated, don't show loading */
  useEffect(() => {
    if (!activate) {
      setIsLoading(false);
    }
  }, [activate]);

  /** Check data readiness */
  useEffect(() => {
    if (!layer) {
      return;
    }
    let loading = false;
    let error = "";
    layer.indicators.map((indicator) => {
      const id = getIndicatorDataId(
        indicator.id,
        referenceLayer.identifier,
        layerReferenceLayer,
      );
      const data = indicatorsData[id];
      if (data?.fetching) {
        loading = true;
      } else if (data?.error) {
        error = data?.error;
      }
    });

    // This is for dynamic checker
    if (layer.type === DynamicIndicatorType) {
      const data = indicatorsData["layer_" + layer.id];
      if (data?.fetching) {
        loading = true;
      } else if (data?.error) {
        error = data?.error;
      }
    }
    if (activate) {
      setIsLoading(loading);
    } else {
      setIsLoading(false);
    }
    setError(error);
  }, [indicatorsData, activate]);
  return <></>;
}

export function RelatedTableChecker({ layer, setIsLoading, setError }: Props) {
  const layerReferenceLayer = layer?.level_config?.referenceLayer?.identifier;
  // @ts-ignore
  const { referenceLayer } = useSelector((state) => state.dashboard.data);
  // @ts-ignore
  const relatedTableData = useSelector((state) => state.relatedTableData);

  /** Remove context layers when not in selected data */
  useEffect(() => {
    if (!layer) {
      return;
    }
    let loading = false;
    let error = "";
    layer.related_tables.map((indicator) => {
      const id =
        layerReferenceLayer && layerReferenceLayer != referenceLayer.identifier
          ? indicator.id + "-" + layerReferenceLayer
          : indicator.id;
      const data = relatedTableData[id];
      if (data?.fetching) {
        loading = true;
      } else if (data?.error) {
        error = data?.error;
      }
    });
    setIsLoading(loading);
    setError(error);
  }, [relatedTableData]);
  return <></>;
}
