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

import { MainDropdownInputSDMXProps } from "./types";
import { DropdownInput } from "./BaseDropdownInput";
import { fetchAgencies } from "../requests";
import { SelectOption } from "../../../types/Input";

/** Dropdown that fetches agency options from the SDMX config's agency endpoint. */
export const SMDXAgencySelector = ({
  sdmxConfig,
  selectedValue,
  onChangeValue,
}: MainDropdownInputSDMXProps) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setOptions([]);
    setLoading(true);
    setError(null);
    fetchAgencies(sdmxConfig.urls.agencies, abortRef.current.signal)
      .then((agencies) => {
        setOptions(
          agencies.map(({ id, name }) => ({
            value: id,
            label: name,
          })),
        );
      })
      .catch((error: any) => {
        if (axios.isCancel(error)) return;
        setError(error.message || "Failed to fetch agencies");
      })
      .finally(() => setLoading(false));

    return () => abortRef.current?.abort();
  }, [sdmxConfig]);

  return (
    <DropdownInput
      title={"Agency"}
      options={options}
      loading={loading}
      error={error}
      selectedValue={selectedValue}
      onChangeValue={onChangeValue}
    />
  );
};

export default SMDXAgencySelector;
