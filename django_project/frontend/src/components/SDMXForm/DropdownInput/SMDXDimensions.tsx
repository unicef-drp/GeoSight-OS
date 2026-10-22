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

const MIN_YEAR = 1900;

/** Check if year is empty or 4 digits and minimum 1900. */
const isValidYear = (value: string) =>
  !value || (/^\d{4}$/.test(value) && parseInt(value) >= MIN_YEAR);

interface YearInputProps {
  value: string;
  onChange: (value: string) => void;
}

/** Year input, only call onChange when the year is valid. */
const YearInput = ({ value, onChange }: YearInputProps) => {
  const [input, setInput] = useState<string>(value ?? "");

  useEffect(() => {
    setInput(value ?? "");
  }, [value]);

  return (
    <input
      type="number"
      className="form-control"
      min={MIN_YEAR}
      max={9999}
      step={1}
      placeholder="YYYY"
      value={input}
      onChange={(evt) => {
        const newInput = evt.target.value.replace(/\D/g, "").slice(0, 4);
        setInput(newInput);
        if (isValidYear(newInput) && newInput !== (value ?? "")) {
          onChange(newInput);
        }
      }}
    />
  );
};

/** Dropdown that fetches agency options from the SDMX config's agency endpoint. */
export const SMDXDimensions = ({
  sdmxConfig,
  sdmxDataForm,
  onChange,
  disabled,
}: Props) => {
  const [dimensions, setDimensions] = useState<DimensionOptions>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (disabled) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { dimensionSelections, dimensionKeys, dimensionTimeKeys } =
          await fetchDimensions(
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
        sdmxDataForm.dimensionTimeKeys = dimensionTimeKeys;
        onChange();
      } catch (error: any) {
        if (error.toString().includes("404")) {
          setError("No dimensions found");
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
    disabled,
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
      {!loading && (
        <div className="DimensionGrid">
          {error && <span className="error">{error}</span>}
          {Object.keys(dimensions).map((dimensionId, index) => {
            if (sdmxDataForm.dimensionKeys.includes(dimensionId)) {
              return (
                <DimensionDropdown
                  key={dimensionId}
                  dimensionId={dimensionId}
                  options={dimensions[dimensionId]}
                  menuPlacement={"bottom"}
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
              );
            } else if (sdmxDataForm.dimensionTimeKeys.includes(dimensionId)) {
              const timeValues =
                (sdmxDataForm.dimensions &&
                  sdmxDataForm.dimensions[dimensionId]) ??
                [];
              const yearInput = (index: number) => (
                <YearInput
                  value={timeValues[index]}
                  onChange={(value) => {
                    const newValues = [
                      timeValues[0] ?? "",
                      timeValues[1] ?? "",
                    ];
                    newValues[index] = value;
                    // Start period should not be after end period
                    if (
                      newValues[0] &&
                      newValues[1] &&
                      parseInt(newValues[0]) > parseInt(newValues[1])
                    ) {
                      return;
                    }
                    if (!sdmxDataForm.dimensions) {
                      sdmxDataForm.dimensions = {};
                    }
                    sdmxDataForm.dimensions[dimensionId] = newValues;
                    onChange();
                  }}
                />
              );
              return (
                <div key={dimensionId} className="DimensionContainer">
                  <label className="form-label" id={dimensionId}>
                    {dimensionId}
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "3rem",
                      alignItems: "center",
                    }}
                  >
                    {yearInput(0)}
                    <span>-</span>
                    {yearInput(1)}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </section>
  );
};

export default SMDXDimensions;
