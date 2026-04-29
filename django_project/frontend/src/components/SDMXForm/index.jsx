import React, { useEffect, useState } from "react";

import {
  fetchAgencies,
  fetchDataflows,
  fetchDataflowVersions,
  fetchDimensions,
  fetchDsd,
} from "./requests";
import DimensionDropdown from "./DimensionDropdown";
import DropdownSection from "./DropdownSection";
import { updateDsd } from "./utilities";

import "./style.scss";

/** SMDX Component */
const SDMXForm = ({ setCurrentUrl }) => {
  const [sdmx, setSdmx] = useState(null);
  const sdmxUrls = sdmx?.urls;

  // State Variables
  const [agencyOptions, setAgencyOptions] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);

  const [dataflowOptions, setDataflowOptions] = useState([]);
  const [selectedDataflow, setSelectedDataflow] = useState(null);

  const [dataflowVersionOptions, setDataflowVersionOptions] = useState([]);
  const [selectedDataflowVersion, setSelectedDataflowVersion] = useState(null);

  const [dimensionSelections, setDimensionSelections] = useState({});
  const [dimensionOptions, setDimensionOptions] = useState({});

  const [dsdResult, setDsdResult] = useState(null);

  const [loading, setLoading] = useState({
    agency: false,
    dataflow: false,
    dataflowVersion: false,
    dimensions: false,
    dsd: false,
  });
  const [error, setError] = useState({});

  const [loadError, setLoadError] = useState("");

  // Fetch agency options on mount
  useEffect(() => {
    if (!sdmxUrls) return;
    setAgencyOptions([]);
    setLoading({ loading, agency: true });
    fetchAgencies(sdmxUrls.agencies, setLoading, setAgencyOptions, setError);
  }, [sdmx]);

  // Fetch dataflows on agency selection
  useEffect(() => {
    if (!sdmxUrls) return;
    if (!selectedAgency) return;
    setCurrentUrl("");
    fetchDataflows(
      sdmxUrls.dataflow,
      setLoading,
      setDataflowOptions,
      setError,
      selectedAgency,
    );
  }, [selectedAgency]);

  // Fetch dataflow versions on dataflow selection
  useEffect(() => {
    if (!sdmxUrls) return;
    if (!selectedDataflow) return;
    setCurrentUrl("");
    fetchDataflowVersions(
      sdmxUrls.dataflow_versions,
      setLoading,
      setDataflowVersionOptions,
      setError,
      selectedDataflow,
    );
  }, [selectedDataflow]);

  // Handle updates when a dataflowVersion is selected
  useEffect(() => {
    if (!sdmxUrls) return;
    setCurrentUrl("");
    if (selectedDataflowVersion && selectedDataflow) {
      // Fetch dimensions for the updated dataflow
      fetchDimensions(
        sdmxUrls.data_structure,
        sdmxUrls.data,
        setLoading,
        setError,
        setDimensionOptions,
        setDimensionSelections,
        selectedDataflow,
        selectedDataflowVersion.value,
      );
    }
  }, [selectedDataflowVersion, selectedDataflow]);

  // Fetch DSD on dimension change
  useEffect(() => {
    if (!selectedDataflow || !selectedDataflowVersion) return;

    fetchDsd(
      sdmxUrls.data,
      selectedDataflow,
      selectedDataflowVersion.value,
      dimensionSelections,
      setDsdResult,
      setCurrentUrl,
      setError,
      setLoading,
    );
  }, [dimensionSelections, selectedDataflow, selectedDataflowVersion]);

  // Handle dimension selection change
  const handleDimensionChange = async (dimensionId, selectedOptions) => {
    if (!sdmxUrls) return;
    const values = selectedOptions?.map(({ value }) => value) || [];
    const updatedSelections = {
      ...dimensionSelections,
      [dimensionId]: values,
    };

    setDimensionSelections(updatedSelections);
    setLoading((prev) => ({ ...prev, dimensions: true }));

    try {
      const result = await updateDsd(
        sdmxUrls.data,
        selectedDataflow,
        updatedSelections,
        selectedDataflowVersion.value,
      );

      if (result.error) throw new Error(result.error);

      const formattedDimensions = Object.entries(
        result.updatedDimensions,
      ).reduce(
        (acc, [key, options]) => ({
          ...acc,
          [key]: options
            .map(({ id, name }) => ({ value: id, label: name || id }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        }),
        {},
      );

      setDimensionOptions(formattedDimensions);
      setError((prev) => ({ ...prev, dimensions: null }));
    } catch (error) {
      setError((prev) => ({
        ...prev,
        dimensions: "Error updating dimensions.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, dimensions: false }));
    }
  };

  // Render
  return (
    <div className="FormAttribute">
      <DropdownSection
        title="SDMX Config"
        options={sdmxData.map((_) => {
          return { value: _.name, label: _.name };
        })}
        selectedOption={sdmx ? { value: sdmx.name, label: sdmx.name } : null}
        onChange={(selected) => {
          setSdmx(sdmxData.find((_) => _.name === selected.value));
          setSelectedAgency(null);
          setSelectedDataflow(null);
          setDimensionSelections({});
          setDimensionOptions({});
          setDataflowVersionOptions([]);
          setSelectedDataflowVersion(null);
        }}
        loading={false}
      />

      {sdmx && (
        <DropdownSection
          title="Agency"
          options={agencyOptions}
          selectedOption={selectedAgency}
          onChange={(selected) => {
            setSelectedAgency(selected);
            setSelectedDataflow(null);
            setDimensionSelections({});
            setDimensionOptions({});
            setDataflowVersionOptions([]);
            setSelectedDataflowVersion(null);
          }}
          loading={loading.agency}
          error={error.agency ? "An error has occurred" : null}
        />
      )}

      {selectedAgency && (
        <DropdownSection
          title="Dataflow"
          options={dataflowOptions}
          selectedOption={selectedDataflow}
          onChange={(selected) => {
            if (selected != selectedDataflow) {
              setSelectedDataflow(selected);
              setDataflowVersionOptions([]);
              setSelectedDataflowVersion(null);
              setDimensionSelections({});
              setDimensionOptions({});
            }
          }}
          loading={loading.dataflow}
          error={error.dataflow ? "An error has occurred" : null}
        />
      )}

      {selectedDataflow && (
        <DropdownSection
          title="Dataflow Version"
          options={dataflowVersionOptions}
          selectedOption={selectedDataflowVersion}
          onChange={(selected) => {
            if (selected != selectedDataflowVersion) {
              setSelectedDataflowVersion(selected);
              setDimensionSelections({});
              setDimensionOptions({});
            }
          }}
          loading={loading.dataflowVersion}
          error={error.dataflowVersion ? "An error has occurred" : null}
        />
      )}

      {selectedDataflowVersion && Object.keys(dimensionOptions).length ? (
        <section className="BasicFormSection">
          <div className="DimensionGrid">
            {Object.keys(dimensionOptions).map((dimensionId) => (
              <DimensionDropdown
                key={dimensionId}
                dimensionId={dimensionId}
                options={dimensionOptions[dimensionId]}
                selectedValues={dimensionSelections[dimensionId] || []}
                onChange={handleDimensionChange}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default SDMXForm;
