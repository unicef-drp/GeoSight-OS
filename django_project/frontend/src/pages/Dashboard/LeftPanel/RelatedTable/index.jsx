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

import React, { Fragment, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../store/dashboard";
import { queryData } from "../../../../utils/queryExtraction";
import { ExecuteWebWorker } from "../../../../utils/WebWorker";
import worker from "./Worker";
import { getCountryGeomIds } from "../../../../utils/Dataset";
import {
  RelatedTable as RelatedTableRequest
} from "../../../../class/RelatedTable";

/**
 * RelatedTable data.
 * @param {dict} indicatorLayer Reference layer Data.
 * @param {dict} relatedTable Related Table Data.
 * @param {str} referenceLayerUUID Reference layer uuid.
 */
export function RelatedTable({
  indicatorLayer,
  relatedTable,
  referenceLayerUUID,
}) {
  const prevState = useRef();
  const dispatch = useDispatch();
  const selectedGlobalTime = useSelector((state) => state.selectedGlobalTime);
  const selectedGlobalTimeStr = JSON.stringify(selectedGlobalTime);
  const [responseAndTime, setResponseAndTime] = useState(null);
  const currentIndicatorLayer = useSelector(
    (state) => state.selectedIndicatorLayer,
  );
  const currentIndicatorSecondLayer = useSelector(
    (state) => state.selectedIndicatorSecondLayer,
  );
  const relatedTableIds = useSelector(
    (state) => state.selectionState.filter.relatedTableIds,
  );

  // Reference layer data
  const referenceLayerData = useSelector(
    (state) => state.referenceLayerData[referenceLayerUUID],
  );
  const activatedLayers = [
    currentIndicatorLayer?.id,
    currentIndicatorSecondLayer?.id,
    ...(currentIndicatorLayer?.indicatorLayers?.map((layer) => parseInt(layer.id)) ?? []),
  ];
  const activated =
    activatedLayers.includes(indicatorLayer.id) ||
    relatedTableIds.includes(relatedTable.id);
  const { id, query } = relatedTable;

  /**
   * Fetch related table data by the current global selected time
   */
  useEffect(() => {
    // Don't request if layer is not activated
    if (!activated) {
      return;
    }

    if (!indicatorLayer?.config?.date_field) return;
    if (!relatedTable.geography_code_field_name) return;
    if (!relatedTable.geography_code_type) return;
    // Skip if no data
    // To get the countries
    if (!referenceLayerData?.data?.identifier) return;
    const countryGeomIds = getCountryGeomIds(referenceLayerData.data);

    const params = {
      time__lte: selectedGlobalTime.max,
      country_geom_ids: countryGeomIds,
      date_field: indicatorLayer?.config?.date_field,
      date_format: indicatorLayer?.config?.date_format,
      geography_code_field_name: relatedTable.geography_code_field_name,
      geography_code_type: relatedTable.geography_code_type,
    };
    if (selectedGlobalTime.min) {
      params["time__gte"] = selectedGlobalTime.min;
    }
    if (indicatorLayer?.config?.date_format) {
      params["date_format"] = indicatorLayer?.config?.date_format;
    }
    params.version = relatedTable.version;
    if (
      selectedGlobalTime.max &&
      JSON.stringify(params) !== JSON.stringify(prevState.params)
    ) {
      prevState.params = params;
      setResponseAndTime(null);
      (async () => {
        try {
          const relatedTableObj = new RelatedTableRequest(relatedTable);
          const response = await relatedTableObj.values({
            ...params,
            page: 1,
            page_size: 100000,
          });
          // Update data by executed worker
          ExecuteWebWorker(
            worker,
            {
              response,
            },
            (response) => {
              setResponseAndTime({
                timeStr: selectedGlobalTimeStr,
                params: params,
                response: response,
                error: null,
              });
            },
          );
        } catch (error) {
          if (error?.toString().includes("have permission")) {
            error = "You don't have permission to access this resource";
          }
          setResponseAndTime({
            timeStr: selectedGlobalTimeStr,
            params: params,
            response: [],
            error: error,
          });
          dispatch(
            Actions.IndicatorLayers.updateJson(indicatorLayer.id, {
              error: error,
            }),
          );
        }
      })();
      dispatch(Actions.RelatedTableData.request(id));
    }
  }, [selectedGlobalTime, referenceLayerData, indicatorLayer, activated]);

  /**
   * Update style
   */
  useEffect(() => {
    if (responseAndTime) {
      const { timeStr, response, error } = responseAndTime;
      const { id } = relatedTable;
      if (timeStr === selectedGlobalTimeStr || prevState.query !== query) {
        prevState.query = query;
        const data = !error ? queryData(response, query) : response;
        dispatch(Actions.RelatedTableData.receive(data, error, id));
        dispatch(Actions.RelatedTableData.receive(response, error, id + "-og"));
      }
    }
  }, [responseAndTime, query]);
  return "";
}

/**
 * RelatedTables data.
 */
export default function RelatedTables() {
  const { indicatorLayers, relatedTables, referenceLayer } = useSelector(
    (state) => state.dashboard.data,
  );

  return (
    <Fragment>
      {indicatorLayers.map((indicatorLayer) => {
        const relatedTable = relatedTables.find(
          (rt) => rt.id === indicatorLayer.related_tables[0]?.id,
        );
        if (!relatedTable) {
          return null;
        }
        return (
          <RelatedTable
            key={indicatorLayer.id}
            relatedTable={relatedTable}
            indicatorLayer={indicatorLayer}
            referenceLayerUUID={referenceLayer?.identifier}
          />
        );
      })}
    </Fragment>
  );
}
