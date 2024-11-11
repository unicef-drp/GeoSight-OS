import { propagateAgencyOptions, restrictDataflowOptions, updateDimensions, updateDsd } from "./dsdFunctions";

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
        setDataflowOptions(dataflows.map(({ id, name, dataflowAgency, dsdId }) => ({
        value: id, label: name, dataflowAgency, dsdId
        })));
        setError((prev) => ({ ...prev, dataflow: null }));
    } catch {
        setError((prev) => ({ ...prev, dataflow: "Error fetching dataflows." }));
    } finally {
        setLoading((prev) => ({ ...prev, dataflow: false }));
    }
};

export const fetchDimensions = async (setLoading, setError, setDimensionOptions, setDimensionSelections, selectedDataflow) => {
    setLoading((prev) => ({ ...prev, dimensions: true }));
    try {
      const result = await updateDimensions({
        id: selectedDataflow.value,
        dataflowAgency: selectedDataflow.dataflowAgency,
        dsdId: selectedDataflow.dsdId,
      });
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

export const fetchDsd = async (selectedDataflow, dimensionSelections, setDsdResult, urlChanged, setError, setLoading) => {
    setLoading((prev) => ({ ...prev, dsd: true }));
    try {
      const result = await updateDsd({
        id: selectedDataflow.value,
        dataflowAgency: selectedDataflow.dataflowAgency,
        dsdId: selectedDataflow.dsdId,
      }, dimensionSelections);

      if (result.error) throw new Error(result.error);

      setDsdResult(result);
      urlChanged(result.apiUrl.split("?")[0] + "?format=csv");
      setError((prev) => ({ ...prev, dsd: null }));
    } catch {
      setError((prev) => ({ ...prev, dsd: "Error fetching DSD." }));
    } finally {
      setLoading((prev) => ({ ...prev, dsd: false }));
    }
  };
