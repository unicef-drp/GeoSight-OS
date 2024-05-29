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
   RELATED TABLE
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../store/dashboard";
import { fetchingData } from "../../../../Requests";
import { queryData } from "../../../../utils/queryExtraction";
import { ExecuteWebWorker } from "../../../../utils/WebWorker";
import worker from "./Worker";


/**
 * RelatedTable data.
 * @param {dict} indicatorLayer Reference layer Data.
 * @param {dict} relatedTable Related Table Data.
 * @param {str} referenceLayerUUID Reference layer uuid.
 */
export function RelatedTable(
  { indicatorLayer, relatedTable, referenceLayerUUID }
) {
  const prevState = useRef();
  const dispatch = useDispatch();
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const selectedGlobalTimeStr = JSON.stringify(selectedGlobalTime);
  const [responseAndTime, setResponseAndTime] = useState(null);

  // TODO:
  //  Fix this to use id of layer
  const { id, url, query } = relatedTable
  useEffect(() => {
    dispatch(Actions.RelatedTableData.request(id))
  }, []);

  /**
   * Fetch related table data by the current global selected time
   */
  useEffect(() => {
    const params = {
      'time__lte': selectedGlobalTime.max,
    }
    if (selectedGlobalTime.min) {
      params['time__gte'] = selectedGlobalTime.min
    }
    if (referenceLayerUUID) {
      params['reference_layer_uuid'] = referenceLayerUUID
    }
    if (indicatorLayer?.config?.date_field) {
      params['date_field'] = indicatorLayer?.config?.date_field
    }
    if (indicatorLayer?.config?.date_format) {
      params['date_format'] = indicatorLayer?.config?.date_format
    }
    if (relatedTable.geography_code_field_name) {
      params['geography_code_field_name'] = relatedTable.geography_code_field_name
    }
    if (relatedTable.geography_code_type) {
      params['geography_code_type'] = relatedTable.geography_code_type
    }
    params.version = relatedTable.version
    if (
      selectedGlobalTime.max &&
      JSON.stringify(params) !== JSON.stringify(prevState.params)
    ) {
      prevState.params = params
      setResponseAndTime(null)
      fetchingData(
        url, params, {}, function (response, error) {
          if (error?.toString().includes('have permission')) {
            error = "You don't have permission to access this resource"
          }

          if (!error?.toString()) {
            // Update data by executed worker
            ExecuteWebWorker(
              worker, {
                response
              }, (response) => {
                setResponseAndTime({
                  'timeStr': selectedGlobalTimeStr,
                  'params': params,
                  'response': response,
                  'error': error
                })
              }
            )
          }
        }
      )
      dispatch(Actions.RelatedTableData.request(id))
    }
  }, [selectedGlobalTime, referenceLayerUUID, indicatorLayer]);

  /**
   * Update style
   */
  useEffect(() => {
    if (responseAndTime) {
      const { timeStr, response, error } = responseAndTime
      const { id } = relatedTable
      if (timeStr === selectedGlobalTimeStr || prevState.query !== query) {
        prevState.query = query
        const data = !error ? queryData(response, query) : response
        dispatch(
          Actions.RelatedTableData.receive(data, error, id)
        )
        dispatch(
          Actions.RelatedTableData.receive(response, error, id + '-og')
        )
      }
    }
  }, [responseAndTime, query]);
  return ""
}

/**
 * RelatedTables data.
 */
export default function RelatedTables() {
  const {
    indicatorLayers,
    relatedTables,
    referenceLayer
  } = useSelector(state => state.dashboard.data);

  return <Fragment>
    {
      indicatorLayers.map(indicatorLayer => {
        const relatedTable = relatedTables.find(rt => rt.id === indicatorLayer.related_tables[0]?.id)
        if (!relatedTable) {
          return null
        }
        return <RelatedTable
          key={indicatorLayer.id}
          relatedTable={relatedTable}
          indicatorLayer={indicatorLayer}
          referenceLayerUUID={referenceLayer?.identifier}
        />
      })
    }
  </Fragment>
}