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
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";

import { MainDropdownInputSDMXProps } from "./types";
import { fetchDimensions, fetchStructure } from "../requests";
import DimensionDropdown from "../DimensionDropdown";
import { DimensionOptions } from "../types";

/** Props for dropdowns that require an SDMX config to resolve their URL. */
interface Props extends MainDropdownInputSDMXProps {
  onChange: () => void;
}

const DATE_FORMAT = "YYYY-MM-DD";
const MIN_DATE = dayjs("1900-01-01");

interface DateInputProps {
  value: string;
  minDate?: string;
  maxDate?: string;
  onChange: (value: string) => void;
}

/** Date input, only call onChange when the date is valid. */
const DateInput = ({ value, minDate, maxDate, onChange }: DateInputProps) => {
  const [input, setInput] = useState<Dayjs | null>(
    value ? dayjs(value) : null,
  );

  useEffect(() => {
    setInput(value ? dayjs(value) : null);
  }, [value]);

  const min =
    minDate && dayjs(minDate).isAfter(MIN_DATE) ? dayjs(minDate) : MIN_DATE;
  const max = maxDate ? dayjs(maxDate) : undefined;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDatePicker
        inputFormat={DATE_FORMAT}
        minDate={min}
        maxDate={max}
        value={input}
        onChange={(newInput: Dayjs | null) => {
          setInput(newInput);
          if (!newInput) {
            if (value) onChange("");
            return;
          }
          if (!newInput.isValid()) return;
          if (newInput.isBefore(min, "day")) return;
          if (max && newInput.isAfter(max, "day")) return;
          const newValue = newInput.format(DATE_FORMAT);
          if (newValue !== value) onChange(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
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
              const dateInput = (index: number) => (
                <DateInput
                  value={timeValues[index]}
                  minDate={index === 1 ? timeValues[0] : undefined}
                  maxDate={index === 0 ? timeValues[1] : undefined}
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
                      newValues[0] > newValues[1]
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
                      gap: "2rem",
                      alignItems: "center",
                    }}
                  >
                    {dateInput(0)}
                    <span>-</span>
                    {dateInput(1)}
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
