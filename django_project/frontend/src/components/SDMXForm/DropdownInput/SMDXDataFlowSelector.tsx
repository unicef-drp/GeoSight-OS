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
import { fetchDataflows } from "../requests";
import { DataflowOption } from "../types";
import { SelectOption } from "../../../types/Input";

/** Props for dropdowns that require an SDMX config to resolve their URL. */
interface Props extends MainDropdownInputSDMXProps {
  onChangeDataFlow: (value: string, dsdId: string) => void;
}

/** Dropdown that fetches agency options from the SDMX config's agency endpoint. */
export const SMDXDataFlowSelector = ({
  sdmxConfig,
  sdmxDataForm,
  selectedValue,
  onChangeValue,
  onChangeDataFlow,
}: Props) => {
  const [dataFlows, setDataFlows] = useState<DataflowOption[]>([]);
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
    fetchDataflows(sdmxConfig.urls.dataflow, abortRef.current.signal)
      .then((dataflows) => {
        setDataFlows(dataflows);
      })
      .catch((error: any) => {
        if (axios.isCancel(error)) return;
        setError(error.message || "Failed to fetch dataflow");
      })
      .finally(() => setLoading(false));

    return () => abortRef.current?.abort();
  }, [sdmxConfig]);

  // Fetch dataflows options on agency selection
  useEffect(() => {
    setOptions(
      dataFlows.filter((df) => df.dataflowAgency === sdmxDataForm.agencyId),
    );
  }, [dataFlows, sdmxDataForm.agencyId]);

  return (
    <DropdownInput
      title={"Dataflow"}
      options={options}
      loading={loading}
      error={error}
      selectedValue={selectedValue}
      onChangeValue={(value: string) => {
        onChangeDataFlow(
          value,
          dataFlows.find((df) => df.value === value)?.dsdId ?? "",
        );
      }}
    />
  );
};

export default SMDXDataFlowSelector;
