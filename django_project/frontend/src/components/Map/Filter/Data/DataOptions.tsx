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
import { Indicator } from "../../../../class/Indicator";
import { CountryDatasetView } from "../../../../types/DatasetView";

export const FetchFromDataOptions = memo(
  ({ id, data, keyField, operator, onChange }: FetchOptionsData) => {
    const key = JSON.stringify({ id, keyField, operator });
    const prev = useRef("");

    /** Create loading **/
    useEffect(() => {
      if (!data) {
        if (key !== prev.current) {
          onChange(["Loading"]);
          prev.current = key;
        }
      }
    }, [keyField, operator]);

    /** Fetch the data **/
    useEffect(() => {
      if (data) {
        try {
          onChange(Array.from(new Set(data.map((row: any) => row[keyField]))));
        } catch (err) {}
      }
    }, [data]);

    return null;
  },
);

/** This is for value */
export const FetchIndicatorOptions = memo(
  ({ id, onChange }: FetchOptionsData) => {
    const referenceLayer = useSelector(
      // @ts-ignore
      (state) => state.dashboard.data?.referenceLayer,
    );
    const referenceLayerData = useSelector(
      // @ts-ignore
      (state) => state.referenceLayerData[referenceLayer?.identifier],
    );
    const geoField = useSelector(
      // @ts-ignore
      (state) => state.dashboard.data?.geoField,
    );
    const isUsingConceptUUID = geoField === "concept_uuid";

    // @ts-ignore
    const indicator = new Indicator({ id: id });
    const prev = useRef();
    const {
      minDate,
      maxDate,
      // @ts-ignore
    } = useSelector((state) => state.selectedGlobalTimeConfig);
    const {
      referenceLayers,
      // @ts-ignore
    } = useSelector((state) => state.map);
    // @ts-ignore
    const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);

    // Geometry parameters
    const adminLevel = selectedAdminLevel?.level;
    let datasets = [];
    if (referenceLayers) {
      datasets = referenceLayers.map((_: any) => _.identifier);
    }

    // Return if no data
    const parameters = {
      admin_level: adminLevel,
    };

    // --------------------------------
    // Features:
    //  Switch parameter by concept_uuid
    if (!isUsingConceptUUID) {
      // @ts-ignore
      parameters["country_geom_id__in"] =
        referenceLayerData?.data?.countries?.map(
          (country: CountryDatasetView) => country.ucode,
        );
    } else {
      // @ts-ignore
      parameters["country_concept_uuid__in"] =
        referenceLayerData?.data?.countries?.map(
          (country: CountryDatasetView) => country.concept_uuid,
        );
    }
    // --------------------------------

    if (maxDate) {
      // @ts-ignore
      parameters["date__lte"] = maxDate.split("T")[0];
    }
    if (minDate) {
      // @ts-ignore
      parameters["date__gte"] = minDate.split("T")[0];
    }

    const key = JSON.stringify(parameters);

    /** Create loading **/
    useEffect(() => {
      if (
        !maxDate ||
        [null, undefined].includes(adminLevel) ||
        !datasets.length ||
        // @ts-ignore
        (!parameters["country_geom_id__in"] &&
          // @ts-ignore
          !parameters["country_concept_uuid__in"])
      ) {
        return;
      }
      const currentKey = key;
      if (currentKey !== prev.current) {
        // @ts-ignore
        prev.current = currentKey;
        onChange(["Loading"]);
        (async () => {
          const output = await indicator.statistic(parameters);
          if (prev.current === currentKey) {
            onChange([output["min"], output["max"]]);
          }
        })();
      }
    }, [parameters]);

    return null;
  },
);

/** This is for value */
export const FetchRelatedTableOptions = memo(
  ({ id, source, keyField, onChange }: FetchOptionsData) => {
    const prev = useRef();
    const {
      referenceLayers,
      // @ts-ignore
    } = useSelector((state) => state.map);
    // @ts-ignore
    const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);

    // Geometry parameters
    const adminLevel = selectedAdminLevel?.level;
    let datasets = [];
    if (referenceLayers) {
      datasets = referenceLayers.map((_: any) => _.identifier);
    }

    const parameters = {
      admin_level: adminLevel,
      reference_layer_uuid__in: datasets.join(","),
      field: keyField,
      geography_code_field_name: source?.geography_code_field_name,
      geography_code_type: source?.geography_code_type,
    };

    const key = JSON.stringify(parameters);

    /** Create loading **/
    useEffect(() => {
      if (!source) {
        return;
      }
      if ([null, undefined].includes(adminLevel) || !datasets.length) {
        return;
      }
      const currentKey = key;
      if (currentKey !== prev.current) {
        // @ts-ignore
        prev.current = currentKey;
        onChange(["Loading"]);
        fetchingData(
          `/api/v1/related-tables/${id}/geo-data/data_field/`,
          parameters,
          {},
          (output: any, error: any) => {
            if (prev.current === currentKey) {
              onChange(output);
            }
          },
        );
      }
    }, [parameters]);

    return null;
  },
);
