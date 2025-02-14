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
 * __date__ = '13/02/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */


import { memo, useEffect } from "react";
import { useSelector } from "react-redux";
import { FetchSourceDetail } from "./types.d";

export const FetchSourceDetailIndicator = memo(
  ({ id, onChange }: FetchSourceDetail) => {

    // @ts-ignore
    const { indicators } = useSelector(state => state.dashboard.data);

    useEffect(() => {
      onChange(indicators.find((row: any) => row.id + '' == id + ''))
    }, [indicators]);

    return null
  }
)

export const FetchSourceDetailIndicatorLayer = memo(
  ({ id, onChange }: FetchSourceDetail) => {

    // @ts-ignore
    const { indicatorLayers } = useSelector(state => state.dashboard.data);

    useEffect(() => {
      onChange(
        indicatorLayers.find(
          (row: any) => row.id + '' == id.replace('layer_', '')
        )
      )
    }, [indicatorLayers]);

    return null
  }
)

export const FetchSourceDetailRelatedTable = memo(
  ({ id, onChange }: FetchSourceDetail) => {

    // @ts-ignore
    const { relatedTables } = useSelector(state => state.dashboard.data);
    useEffect(() => {
      onChange(relatedTables.find((row: any) => row.id + '' == id + ''))
    }, [relatedTables]);

    return null
  }
)