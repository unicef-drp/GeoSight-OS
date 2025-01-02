import { propagateAgencyOptions, restrictDataflowOptions, propagateDataflowVersions, updateDimensions, updateDsd } from "./dsdFunctions";

export const fetchAgencies = async (setLoading, setAgencyOptions, setError) => {
  setLoading((prev) => ({ ...prev, agency: true }));
  try {
    const agencies = await propagateAgencyOptions();
    setAgencyOptions(agencies.map(({ id, name }) => ({ value: id, label: name })));
    setError((prev) => ({ ...prev, agency: null }));
  } catch {
    setError((prev) => ({ ...prev, agency: "Error fetching agencies." }));
  } finally {
    setLoading((prev) => ({ ...prev, agency: false }));
  }
};

export const fetchDataflows = async (setLoading, setDataflowOptions, setError, selectedAgency) => {
  setLoading((prev) => ({ ...prev, dataflow: true }));
  try {
    const dataflows = await restrictDataflowOptions(selectedAgency.value);
    setDataflowOptions(dataflows);
    setError((prev) => ({ ...prev, dataflow: null }));
  } catch {
    setError((prev) => ({ ...prev, dataflow: "Error fetching dataflows." }));
  } finally {
    setLoading((prev) => ({ ...prev, dataflow: false }));
  }
};

export const fetchDataflowVersions = async (setLoading, setDataflowVersionOptions, setError, selectedDataflow) => {
  setLoading((prev) => ({ ...prev, dataflowVersion: true }));
  try {
    const dataflowVersions = await propagateDataflowVersions(selectedDataflow);
    setDataflowVersionOptions(dataflowVersions.map((version) => ({
      value: version,
      label: `Version ${version}`,
    })));
    setError((prev) => ({ ...prev, dataflowVersion: null }));
  } catch {
    setError((prev => ({ ...prev, dataflowVersion: "Error fetching dataflow versions." })));
  } finally {
    setLoading((prev) => ({ ...prev, dataflowVersion: false }));
  }
}

export const fetchDimensions = async (setLoading, setError, setDimensionOptions, setDimensionSelections, selectedDataflow, selectedDataflowVersion) => {
  setLoading((prev) => ({ ...prev, dimensions: true }));
  try {
    const result = await updateDimensions(selectedDataflow, selectedDataflowVersion);
    if (result.error) throw new Error(result.error);

    const formattedOptions = Object.fromEntries(
      Object.entries(result.updatedDimensions).map(([key, values]) => [
        key,
        values.map(({ id, name }) => ({ value: id, label: name || id }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      ])
    );

    setDimensionSelections(result.dimensionSelections);
    setDimensionOptions(formattedOptions);
    setError((prev) => ({ ...prev, dimensions: null }));
  } catch {
    setError((prev) => ({ ...prev, dimensions: "Error fetching dimensions." }));
  } finally {
    setLoading((prev) => ({ ...prev, dimensions: false }));
  }
};

export const fetchDsd = async (selectedDataflow, selectedDataflowVersion, dimensionSelections, setDsdResult, setCurrentUrl, setError, setLoading) => {
  setLoading((prev) => ({ ...prev, dsd: true }));
  try {
    const result = await updateDsd(selectedDataflow, dimensionSelections, selectedDataflowVersion);

    if (result.error) throw new Error(result.error);

    setDsdResult(result);
    setCurrentUrl(result.apiUrl.split("?")[0] + "?format=csv");
    setError((prev) => ({ ...prev, dsd: null }));
  } catch {
    setError((prev) => ({ ...prev, dsd: "Error fetching DSD." }));
  } finally {
    setLoading((prev) => ({ ...prev, dsd: false }));
  }
};
