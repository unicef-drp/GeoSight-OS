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


import { memo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FetchGeometryData, FetchSourceDetail } from "./types.d";

export const FetchSourceData = memo(
  ({ id, sourceKey, onChange }: FetchSourceDetail) => {
    const prevFetchedRef = useRef<string>('');
    const stateData = useSelector((state) => {
      // @ts-ignore
      if (state[sourceKey] && state[sourceKey][id]) {
        // @ts-ignore
        return state[sourceKey][id];
      }
      return null;
    });

    /** Fetch the data **/
    useEffect(() => {
      const fetched = id + sourceKey + !!stateData?.fetched;
      if (prevFetchedRef.current !== fetched) {
        onChange(stateData?.data)
      }
      prevFetchedRef.current = fetched;
    }, [id, sourceKey, stateData]);

    return null
  }
)

export const FetchSourceGeometryData = memo(
  ({ field, onChange }: FetchGeometryData) => {
    // @ts-ignore
    const identifier = useSelector(state => state.dashboard?.data.referenceLayer?.identifier);
    let usedIdentifier = identifier
    const [keyData, level, fieldIdentifier] = field.split('.')[0].split('_')
    if (fieldIdentifier) {
      usedIdentifier = fieldIdentifier
    }

    // @ts-ignore
    const referenceLayerData = useSelector((state) => state.datasetGeometries?.[usedIdentifier])

    /** Fetch the data **/
    useEffect(() => {
      let data = referenceLayerData ? referenceLayerData[level] : null
      if (data) {
        const _data = []
        // @ts-ignore
        for (const [_, value] of Object.entries(data)) {
          _data.push(value)
        }
        data = _data
        _data.map((row: any) => {
          row.members.map((member: any) => {
            data.push({
              concept_uuid: member.code,
              ucode: row.ucode,
              name: row.name,
            })
          })
        })
      }
      onChange(data)
    }, [referenceLayerData]);

    return null
  }
)
