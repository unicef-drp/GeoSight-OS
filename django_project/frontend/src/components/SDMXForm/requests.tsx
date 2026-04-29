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
 * __date__ = '29/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import {
  propagateAgencyOptions,
  propagateDataflowVersions,
  restrictDataflowOptions,
  updateDimensions,
  updateDsd,
} from "./utilities";
import {
  DataflowOption,
  DimensionOptions,
  DimensionSelections,
  ErrorState,
  LoadingState,
  Option,
} from "./types";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export const fetchAgencies = async (
  apiUrl: string,
  setLoading: SetState<LoadingState>,
  setAgencyOptions: SetState<Option[]>,
  setError: SetState<ErrorState>,
): Promise<void> => {
  setLoading((prev) => ({ ...prev, agency: true }));
  try {
    const agencies = await propagateAgencyOptions(apiUrl);
    if ("error" in agencies) throw new Error(agencies.error);
    setAgencyOptions(
      agencies.map(({ id, name }: { id: string; name: string }) => ({
        value: id,
        label: name,
      })),
    );
    setError((prev) => ({ ...prev, agency: null }));
  } catch {
    setError((prev) => ({ ...prev, agency: "Error fetching agencies." }));
  } finally {
    setLoading((prev) => ({ ...prev, agency: false }));
  }
};

export const fetchDataflows = async (
  apiUrl: string,
  setLoading: SetState<LoadingState>,
  setDataflowOptions: SetState<DataflowOption[]>,
  setError: SetState<ErrorState>,
  selectedAgency: Option,
): Promise<void> => {
  setLoading((prev) => ({ ...prev, dataflow: true }));
  try {
    const dataflows = await restrictDataflowOptions(
      apiUrl,
      selectedAgency.value,
    );
    if ("error" in dataflows) throw new Error(dataflows.error);
    setDataflowOptions(dataflows);
    setError((prev) => ({ ...prev, dataflow: null }));
  } catch {
    setError((prev) => ({ ...prev, dataflow: "Error fetching dataflows." }));
  } finally {
    setLoading((prev) => ({ ...prev, dataflow: false }));
  }
};

export const fetchDataflowVersions = async (
  apiUrl: string,
  setLoading: SetState<LoadingState>,
  setDataflowVersionOptions: SetState<Option[]>,
  setError: SetState<ErrorState>,
  selectedDataflow: DataflowOption,
): Promise<void> => {
  setLoading((prev) => ({ ...prev, dataflowVersion: true }));
  try {
    const dataflowVersions = await propagateDataflowVersions(
      apiUrl,
      selectedDataflow,
    );
    if ("error" in dataflowVersions) throw new Error(dataflowVersions.error);
    setDataflowVersionOptions(
      dataflowVersions.map((version: string) => ({
        value: version,
        label: `Version ${version}`,
      })),
    );
    setError((prev) => ({ ...prev, dataflowVersion: null }));
  } catch {
    setError((prev) => ({
      ...prev,
      dataflowVersion: "Error fetching dataflow versions.",
    }));
  } finally {
    setLoading((prev) => ({ ...prev, dataflowVersion: false }));
  }
};

export const fetchDimensions = async (
  apiUrl: string,
  apiDataUrl: string,
  setLoading: SetState<LoadingState>,
  setError: SetState<ErrorState>,
  setDimensionOptions: SetState<DimensionOptions>,
  setDimensionSelections: SetState<DimensionSelections>,
  selectedDataflow: DataflowOption,
  selectedDataflowVersion: string,
): Promise<void> => {
  setLoading((prev) => ({ ...prev, dimensions: true }));
  try {
    const result = await updateDimensions(
      apiUrl,
      apiDataUrl,
      selectedDataflow,
      selectedDataflowVersion,
    );
    if ("error" in result) throw new Error(result.error);

    const formattedOptions: DimensionOptions = Object.fromEntries(
      Object.entries(result.updatedDimensions).map(
        ([key, values]: [string, any[]]) => [
          key,
          values
            .map(({ id, name }: { id: string; name: string }) => ({
              value: id,
              label: name || id,
            }))
            .sort((a: Option, b: Option) => a.label.localeCompare(b.label)),
        ],
      ),
    );

    setDimensionSelections(result.dimensionSelections);
    setDimensionOptions(formattedOptions);
    setError((prev) => ({ ...prev, dimensions: null }));
  } catch {
    setError((prev) => ({
      ...prev,
      dimensions: "Error fetching dimensions.",
    }));
  } finally {
    setLoading((prev) => ({ ...prev, dimensions: false }));
  }
};

export const fetchDsd = async (
  apiUrl: string,
  selectedDataflow: DataflowOption,
  selectedDataflowVersion: string,
  dimensionSelections: DimensionSelections,
  setDsdResult: SetState<any>,
  setCurrentUrl: SetState<string>,
  setError: SetState<ErrorState>,
  setLoading: SetState<LoadingState>,
): Promise<void> => {
  setLoading((prev) => ({ ...prev, dsd: true }));
  try {
    const result = await updateDsd(
      apiUrl,
      selectedDataflow,
      dimensionSelections,
      selectedDataflowVersion,
    );
    if ("error" in result) throw new Error(result.error);

    setDsdResult(result);
    setCurrentUrl(result.apiUrl.split("?")[0] + "?format=csv");
    setError((prev) => ({ ...prev, dsd: null }));
  } catch {
    setError((prev) => ({ ...prev, dsd: "Error fetching DSD." }));
  } finally {
    setLoading((prev) => ({ ...prev, dsd: false }));
  }
};
