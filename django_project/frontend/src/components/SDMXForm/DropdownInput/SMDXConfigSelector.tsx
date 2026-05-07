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

import { MainDropdownInputProps } from "./types";
import { DropdownInput } from "./BaseDropdownInput";
import { SDMXConfig } from "../../../types/SDMX";
import { SelectOption } from "../../../types/Input";

interface Props extends MainDropdownInputProps {
  onChangeConfig?: (config: SDMXConfig) => void;
}

/** Dropdown that fetches available SDMX configs from the GeoSight API. */
export const SMDXConfigSelector = ({
  selectedValue,
  onChangeValue,
  onChangeConfig,
}: Props) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [configs, setConfigs] = useState<SDMXConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    axios
      .get("/api/sdmx/list", { signal: abortRef.current.signal })
      .then(({ data }) => {
        setConfigs(data);
        setOptions(
          data.map((c: SDMXConfig) => ({
            value: String(c.id),
            label: c.name,
          })),
        );
      })
      .catch((err: any) => {
        if (axios.isCancel(err)) return;
        setError(err.message || "Failed to fetch SDMX configs");
      })
      .finally(() => setLoading(false));

    return () => abortRef.current?.abort();
  }, []);

  return (
    <DropdownInput
      title={"SDMX Config"}
      options={options}
      loading={loading}
      error={error}
      selectedValue={selectedValue}
      onChangeValue={(value: string) => {
        if (onChangeConfig) {
          const config = configs.find((c) => String(c.id) === value);
          if (config) onChangeConfig(config);
        }
      }}
    />
  );
};

export default SMDXConfigSelector;
