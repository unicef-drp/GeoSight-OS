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
import { FetchOptionsData } from "./types.d";
import { useSelector } from "react-redux";
import { fetchingData } from "../../../../Requests";

export const FetchFromDataOptions = memo(
  ({ id, data, keyField, operator, onChange }: FetchOptionsData) => {
    const key = JSON.stringify(
      { id, keyField, operator }
    )
    const prev = useRef('');

    /** Create loading **/
    useEffect(() => {
      if (!data) {
        if (key !== prev.current) {
          onChange(['Loading'])
          prev.current = key
        }
      }
    }, [keyField, operator]);

    /** Fetch the data **/
    useEffect(() => {
      if (data) {
        try {
          onChange(
            Array.from(new Set(data.map((row: any) => row[keyField])))
          )
        } catch (err) {

        }
      }
    }, [data]);

    return null
  }
)

/** This is for value */
export const FetchIndicatorOptions = memo(
  ({ id, onChange }: FetchOptionsData) => {
    const prev = useRef();
    const {
      minDate,
      maxDate
      // @ts-ignore
    } = useSelector(state => state.selectedGlobalTimeConfig);
    const {
      referenceLayers
      // @ts-ignore
    } = useSelector(state => state.map);
    // @ts-ignore
    const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);

    // Geometry parameters
    const adminLevel = selectedAdminLevel?.level
    let datasets = []
    if (referenceLayers) {
      datasets = referenceLayers.map((_: any) => _.identifier)
    }

    const parameters = {
      indicator_id: id,
      admin_level: adminLevel,
      reference_layer_id__in: datasets.join(',')
    }
    if (maxDate) {
      // @ts-ignore
      parameters['date__lte'] = maxDate.split('T')[0]
    }
    if (minDate) {
      // @ts-ignore
      parameters['date__gte'] = minDate.split('T')[0]
    }

    const key = JSON.stringify(parameters)

    /** Create loading **/
    useEffect(() => {
      if (!maxDate || [null, undefined].includes(adminLevel) || !datasets.length) {
        return
      }
      const currentKey = key
      if (currentKey !== prev.current) {
        // @ts-ignore
        prev.current = currentKey
        onChange(['Loading'])
        console.log(parameters)
        fetchingData(
          '/api/v1/data-browser/statistic/',
          parameters, {}, (output: any, error: any) => {
            if (prev.current === currentKey) {
              onChange([output['min'], output['max']])
            }
          }
        )
      }
    }, [parameters]);

    return null
  }
)