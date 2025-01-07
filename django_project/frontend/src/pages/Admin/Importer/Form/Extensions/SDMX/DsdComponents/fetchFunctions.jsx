import { propagateAgencyOptions, restrictDataflowOptions, propagateDataflowVersions, updateDimensions, updateDsd } from "./dsdFunctions";

/**
 * fetchAgencies Function
 *
 * @param {function} setLoading - A function to update the loading state for agency fetching. Accepts a callback.
 * @param {function} setAgencyOptions - A function to update the list of agency options. Expects an array of objects with the following keys:
 *   @property {string} value - The agency ID.
 *   @property {string} label - The agency name.
 * @param {function} setError - A function to set error messages related to agency fetching. Accepts a callback.
 */

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

/**
 * fetchDataflows Function
 *
 * @param {function} setLoading - A function to update the loading state for dataflow fetching. Accepts a callback.
 * @param {function} setDataflowOptions - A function to update the list of dataflow options. Expects an array of objects with the following keys:
 *   @property {string} value - The dataflow ID.
 *   @property {string} label - The dataflow name.
 *   @property {string} dataflowAgency - The ID of the agency owning the dataflow.
 *   @property {string} dsdId - The ID of the associated DSD.
 * @param {function} setError - A function to set error messages related to dataflow fetching. Accepts a callback.
 * @param {Object} selectedAgency - The selected agency object with the following keys:
 *   @property {string} value - The agency ID.
 *   @property {string} label - The agency name.
 */ 

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

/**
 * fetchDataflowVersions Function
 *
 * @param {function} setLoading - A function to update the loading state for fetching dataflow versions. Accepts a callback.
 * @param {function} setDataflowVersionOptions - A function to update the list of dataflow version options. Expects an array of objects with the following keys:
 *   @property {string} value - The version number of the dataflow.
 *   @property {string} label - A descriptive label for the version (e.g., Version 1.0).
 * @param {function} setError - A function to set error messages related to fetching dataflow versions. Accepts a callback.
 * @param {Object} selectedDataflow - An object containing information about the selected dataflow:
 *   @property {string} value - The dataflow ID.
 *   @property {string} dataflowAgency - The ID of the agency owning the dataflow.
 */

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

/**
 * fetchDimensions Function
 *
 * @param {function} setLoading - A function to update the loading state for dimension fetching. Accepts a callback.
 * @param {function} setError - A function to set error messages related to dimension fetching. Accepts a callback.
 * @param {function} setDimensionOptions - A function to update the available dimension options. Expects an object where each key is a dimension ID, and the value is an array of objects with:
 *   @property {string} value - The dimension value ID.
 *   @property {string} label - The dimension value name.
 * @param {function} setDimensionSelections - A function to update the selected dimension values. Expects an object where each key is a dimension ID, and the value is an empty array.
 * @param {Object} selectedDataflow - The selected dataflow object with the following keys:
 *   @property {string} value - The dataflow ID.
 *   @property {string} dataflowAgency - The ID of the agency owning the dataflow.
 *   @property {string} dsdId - The ID of the associated DSD.
 */
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

/**
 * fetchDsd Function
 *
 * @param {Object} selectedDataflow - The selected dataflow object with the following keys:
 *   @property {string} value - The dataflow ID.
 *   @property {string} dataflowAgency - The ID of the agency owning the dataflow.
 *   @property {string} dsdId - The ID of the associated DSD.
 * @param {Object} dimensionSelections - A mapping of dimension IDs to arrays of their selected values.
 * @param {function} setDsdResult - A function to update the DSD result. Expects an object with:
 *   @property {Object} updatedDimensions - A mapping of dimension IDs to their available values.
 *   @property {string} apiUrl - The constructed API URL.
 *   @property {Object} apiResponse - The API response.
 *   @property {Array} sdmxImplementation - Placeholder for implementation details.
 * @param {function} urlChanged - A function to update the URL. Expects a string (formatted URL).
 * @param {function} setError - A function to set error messages related to DSD fetching. Accepts a callback.
 * @param {function} setLoading - A function to update the loading state for DSD fetching. Accepts a callback.
 */

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
