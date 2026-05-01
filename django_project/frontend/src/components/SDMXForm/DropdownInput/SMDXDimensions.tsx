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
 * __date__ = '30/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

import { MainDropdownInputSDMXProps } from "./types";
import { fetchDimensions, fetchStructure } from "../requests";
import DimensionDropdown from "../DimensionDropdown";
import { DimensionOptions } from "../types";

/** Props for dropdowns that require an SDMX config to resolve their URL. */
interface Props extends MainDropdownInputSDMXProps {
  onChange: () => void;
}

/** Dropdown that fetches agency options from the SDMX config's agency endpoint. */
export const SMDXDimensions = ({
  sdmxConfig,
  sdmxDataForm,
  onChange,
}: Props) => {
  const [dimensions, setDimensions] = useState<DimensionOptions>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { dimensionSelections, dimensionKeys } = await fetchDimensions(
          sdmxConfig.urls.data_structure,
          sdmxDataForm.agencyId,
          sdmxDataForm.dataflowDsdId,
          sdmxDataForm.dataflowVersionId,
          controller.signal,
        );
        const data = await fetchStructure(
          sdmxConfig.urls.data,
          sdmxDataForm.agencyId,
          sdmxDataForm.dataflowId,
          sdmxDataForm.dataflowVersionId,
          dimensionSelections,
          controller.signal,
        );
        setDimensions(data);
        sdmxDataForm.dimensionKeys = dimensionKeys;
        onChange();
      } catch (error: any) {
        if (error.toString().includes("404")) {
          setError("No data found");
          return;
        }
        if (axios.isCancel(error)) return;
        setError(error.message || "Failed to fetch dimensions");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [
    sdmxConfig,
    sdmxDataForm.agencyId,
    sdmxDataForm.dataflowDsdId,
    sdmxDataForm.dataflowVersionId,
  ]);

  return (
    <section className="BasicFormSection DimensionSection">
      <div style={{ display: "flex", alignItems: "center" }}>
        <label className="form-label" style={{ marginRight: "1rem" }}>
          Dimensions
        </label>
        {loading && (
          <div className="Throbber">
            <CircularProgress size="2rem" />
          </div>
        )}
      </div>
      {error && <span className="form-helptext error">error</span>}
      {!loading && (
        <div className="DimensionGrid">
          {Object.keys(dimensions).map((dimensionId) => (
            <DimensionDropdown
              key={dimensionId}
              dimensionId={dimensionId}
              options={dimensions[dimensionId]}
              selectedValues={
                (sdmxDataForm.dimensions &&
                  sdmxDataForm.dimensions[dimensionId]) ??
                []
              }
              onChange={(values) => {
                if (!sdmxDataForm.dimensions) {
                  sdmxDataForm.dimensions = {};
                }
                sdmxDataForm.dimensions[dimensionId] = values;
                onChange();
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SMDXDimensions;
