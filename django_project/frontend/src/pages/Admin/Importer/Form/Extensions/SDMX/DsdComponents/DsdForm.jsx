// File: TestUpdateDsd.jsx

import React, { useState, useEffect } from "react";
import {
  updateDsd,
} from "./dsdFunctions.jsx";
import '../style.scss';
import '../custom-select-styles.scss';


import { fetchAgencies, fetchDataflows, fetchDimensions, fetchDsd } from './fetchFunctions.jsx';
import DropdownSection from "./DropdownSection.jsx";
import DimensionDropdown from "./DimensionDropdown.jsx";

const DsdForm = ({ urlChanged, setRequest }) => {
  // State Variables
  const [agencyOptions, setAgencyOptions] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);

  const [dataflowOptions, setDataflowOptions] = useState([]);
  const [selectedDataflow, setSelectedDataflow] = useState(null);

  const [dimensionSelections, setDimensionSelections] = useState({});
  const [dimensionOptions, setDimensionOptions] = useState({});

  const [dsdResult, setDsdResult] = useState(null);

  const [loading, setLoading] = useState({
    agency: false,
    dataflow: false,
    dimensions: false,
    dsd: false,
  });
  const [error, setError] = useState({});

  // Fetch agency options on mount
  useEffect(() => {
    fetchAgencies(setLoading, setAgencyOptions, setError);
  }, []);

  // Fetch dataflows on agency selection
  useEffect(() => {
    if (!selectedAgency) return;
    setRequest([]);
    fetchDataflows(setLoading, setDataflowOptions, setError, selectedAgency);
  }, [selectedAgency]);

  // Fetch dimensions on dataflow selection
  useEffect(() => {
    if (!selectedDataflow) return;
    fetchDimensions(setLoading, setError, setDimensionOptions, setDimensionSelections, selectedDataflow);
  }, [selectedDataflow]);

  // Fetch DSD on dimension change
  useEffect(() => {
    if (!selectedDataflow) return;
    fetchDsd(selectedDataflow, dimensionSelections, setDsdResult, urlChanged, setError, setLoading);

  }, [dimensionSelections, selectedDataflow]);

  // Handle dimension selection change
  const handleDimensionChange = async (dimensionId, selectedOptions) => {
    const values = selectedOptions?.map(({ value }) => value) || [];
    const updatedSelections = { ...dimensionSelections, [dimensionId]: values };

    setDimensionSelections(updatedSelections);
    setLoading((prev) => ({ ...prev, dimensions: true }));

    try {
      const { value, dataflowAgency, dsdId } = selectedDataflow;
      const result = await updateDsd({ id: value, dataflowAgency, dsdId }, updatedSelections);

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
    <div className="DsdForm">
      <DropdownSection
        title="Agency"
        options={agencyOptions}
        selectedOption={selectedAgency && selectedAgency.value}
        onChange={(selected) => {
          setSelectedAgency(selected);
          setSelectedDataflow(null);
          setDimensionSelections({});
          setDimensionOptions({});
        }}
        loading={loading.agency}
        error={error.agency}
      />

      {selectedAgency && (
        <DropdownSection
          title="Dataflow"
          options={dataflowOptions}
          selectedOption={selectedDataflow && selectedDataflow.value}
          onChange={(selected) => {
            if (selected != selectedDataflow) {
              setSelectedDataflow(selected);
              setDimensionSelections({});
              setDimensionOptions({});
            }
          }}
          loading={loading.dataflow}
          error={error.dataflow}
        />
      )}

      {selectedDataflow && (
        <section className="Section">
          <h2 className="SectionTitle">Dimensions</h2>
          <div className="DimensionGrid">
            {Object.keys(dimensionOptions).map((dimensionId) => (
              <DimensionDropdown
                key={dimensionId}
                dimensionId={dimensionId}
                options={dimensionOptions[dimensionId]}
                selectedValues={dimensionSelections[dimensionId] || []}
                onChange={handleDimensionChange}
                classNamePrefix="custom-select-dimensions"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DsdForm;
