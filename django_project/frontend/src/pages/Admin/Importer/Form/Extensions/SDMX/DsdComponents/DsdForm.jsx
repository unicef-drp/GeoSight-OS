import React, { useState, useEffect } from "react";
import {
  updateDsd,
} from "./dsdFunctions.jsx";
import '../style.scss';
import { ThemeButton } from "../../../../../../../components/Elements/Button";


import { fetchAgencies, fetchDataflows, fetchDataflowVersions, fetchDimensions, fetchDsd } from './fetchFunctions.jsx';
import DropdownSection from "./DropdownSection.jsx";
import DimensionDropdown from "./DimensionDropdown.jsx";

/**
 * DsdForm Component
 *
 * @param {Object} props - The properties object.
 * @param {function} props.setRequest - State variable setter function that mutates `request`, the request/response payload state variable.
 * @param {function} props.urlChanged - Function to read the API URL created based on user inputs.
 *
 * @returns {JSX.Element} A frontend component containing all the selection/input fields.
 */
const DsdForm = ({ urlChanged, setRequest }) => {
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

  const [currentUrl, setCurrentUrl] = useState(null);

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
    setAgencyOptions([])
    setLoading({loading, agency: true})
    fetchAgencies(sdmxUrls.agencies, setLoading, setAgencyOptions, setError);
  }, [sdmx]);

  // Fetch dataflows on agency selection
  useEffect(() => {
    if (!sdmxUrls) return;
    if (!selectedAgency) return;
    setRequest([]);
    fetchDataflows(sdmxUrls.dataflow, setLoading, setDataflowOptions, setError, selectedAgency);
  }, [selectedAgency]);

  // Fetch dataflow versions on dataflow selection
  useEffect(() => {
    if (!sdmxUrls) return;
    if (!selectedDataflow) return;
    setRequest([]);
    fetchDataflowVersions(sdmxUrls.dataflow_versions, setLoading, setDataflowVersionOptions, setError, selectedDataflow);
  }, [selectedDataflow]);

  // Handle updates when a dataflowVersion is selected
  useEffect(() => {
    if (!sdmxUrls) return;
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
        selectedDataflowVersion.value
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
      setLoading);

  }, [dimensionSelections, selectedDataflow, selectedDataflowVersion]);

  const handleSubmit = async () => {
    try {
      urlChanged(currentUrl);
      setLoadError("");
    }
    catch (e) {
      setLoadError(e);
    }
  }

  // Handle dimension selection change
  const handleDimensionChange = async (dimensionId, selectedOptions) => {
    if (!sdmxUrls) return;
    const values = selectedOptions?.map(({ value }) => value) || [];
    const updatedSelections = { ...dimensionSelections, [dimensionId]: values };

    setDimensionSelections(updatedSelections);
    setLoading((prev) => ({ ...prev, dimensions: true }));

    try {
      const result = await updateDsd(sdmxUrls.data, selectedDataflow, updatedSelections, selectedDataflowVersion.value);

      if (result.error) throw new Error(result.error);

      const formattedDimensions = Object.entries(result.updatedDimensions).reduce(
        (acc, [key, options]) => ({
          ...acc,
          [key]: options
            .map(({ id, name }) => ({ value: id, label: name || id }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        }),
        {}
      );

      setDimensionOptions(formattedDimensions);
      setError((prev) => ({ ...prev, dimensions: null }));
    } catch (error) {
      setError((prev) => ({ ...prev, dimensions: "Error updating dimensions." }));
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

      {selectedDataflowVersion && Object.keys(dimensionOptions) && (
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
      )}
      <span>
        <ThemeButton
          variant="primary Basic"
          className="LoadDataButton"
          disabled={!selectedAgency || !selectedDataflow || !selectedDataflowVersion}
          onClick={handleSubmit}>
          Load Data
        </ThemeButton>
        <h2 className="LoadDataError">
          {loadError}
        </h2>
      </span>
    </div>
  );
};

export default DsdForm;
