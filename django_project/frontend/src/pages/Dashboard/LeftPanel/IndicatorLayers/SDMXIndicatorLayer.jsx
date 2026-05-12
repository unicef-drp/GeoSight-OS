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
 * __date__ = '04/05/2026'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   RELATED TABLE LAYER
   ========================================================================== */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../store/dashboard";
import {
  referenceLayerIndicatorLayer
} from "../../../../utils/indicatorLayer";
import { fetchSdmx, getSdmxData } from "../../../../utils/sdmx";
import { toISODateTimeString } from "../../../../utils/Dates";
import { Error } from "@mui/icons-material";
import { parseInt } from "lodash";

/**
 * SDMX Indicator handler
 */
export default function SDMXIndicatorLayer({ indicatorLayer }) {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [dates, setDates] = useState([]);
  const { url, dateTimeField, dateTimeFormat, geomCodeField } =
    indicatorLayer?.config || {};
  const referenceLayerDashboard = useSelector(
    (state) => state.dashboard.data?.referenceLayer,
  );
  const geoField = useSelector((state) => state.dashboard.data?.geoField);

  // Reference layer data
  const referenceLayer = referenceLayerIndicatorLayer(
    referenceLayerDashboard,
    indicatorLayer,
  );
  const referenceLayerData = useSelector(
    (state) => state.referenceLayerData[referenceLayer?.identifier],
  );
  const geometries = useSelector(
    (state) => state.datasetGeometries[referenceLayer.identifier + "_by-ucode"],
  );
  /**
   * Update related table dates
   */
  useEffect(() => {
    (async () => {
      const id = indicatorLayer?.id;
      try {
        if (!url || !dateTimeField || !dateTimeFormat || !geomCodeField) {
          throw new Error("SDMX configuration is not configured yet.");
        }
        dispatch(Actions.IndicatorLayersData.request(id));
        const data = await fetchSdmx(url);
        data.map((_row) => {
          if (_row[dateTimeField]) {
            _row["date"] = toISODateTimeString(
              _row[dateTimeField],
              dateTimeFormat,
            );
          }
          return _row;
        });
        const _dates = [...new Set(data.map((d) => d["date"]))].sort();
        setDates(_dates);
        setData(data);
        dispatch(
          Actions.IndicatorLayerMetadata.update(id, {
            dates: _dates,
            count: 0,
          }),
        );
      } catch (error) {
        dispatch(
          Actions.IndicatorLayerMetadata.update(id, {
            dates: error.toString(),
            count: 0,
          }),
        );
      }
    })();
  }, [url]);

  /**
   * Update related table dates
   */
  useEffect(() => {
    (async () => {
      const id = indicatorLayer?.id;
      if (!geometries) return;
      // Skip if no data
      // To get the countries
      if (!indicatorLayer || !referenceLayerData?.data?.identifier) {
        return;
      }
      if (!url || !dateTimeField || !dateTimeFormat || !geomCodeField) {
        throw new Error("SDMX configuration is not configured yet.");
      }
      dispatch(Actions.IndicatorLayersData.request(id));
      data.map((_row) => {
        for (const [level, _geometries] of Object.entries(geometries)) {
          const found_geometry = _geometries[_row[geomCodeField]];
          if (found_geometry) {
            _row.concept_uuid = found_geometry.concept_uuid;
            _row.ucode = found_geometry.ucode;
            _row.admin_level = parseInt(level);
            break;
          }
        }
        return _row;
      });
      const cleanedData = getSdmxData(data, indicatorLayer.config, geoField);
      dispatch(Actions.IndicatorLayersData.receive([...cleanedData], "", id));
    })();
  }, [data, geometries, referenceLayerData, indicatorLayer]);
  return null;
}
