// File: TestUpdateDsd.jsx

import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  propagateAgencyOptions,
  restrictDataflowOptions,
  updateDimensions,
  updateDsd,
} from "./update_dsd.jsx"; // Adjust the path as necessary
import { color } from "chart.js/helpers";
import zIndex from "@mui/material/styles/zIndex.js";
import { getFixedT } from "i18next";
import { max, min } from "moment";

const TestUpdateDsd = () => {
  // ==========================
  // State Variables
  // ==========================

  // Agency-related states
  const [agencyOptions, setAgencyOptions] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);

  // Dataflow-related states
  const [dataflowOptions, setDataflowOptions] = useState([]);
  const [selectedDataflow, setSelectedDataflow] = useState(null);

  // Dimension-related states
  const [dimensionSelections, setDimensionSelections] = useState({});
  const [dimensionOptions, setDimensionOptions] = useState({});

  const [isVisible, setIsVisible] = useState(true);

  // Handler for toggling visibility
  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  // DSD result state
  const [dsdResult, setDsdResult] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState({
    agency: false,
    dataflow: false,
    dimensions: false,
    dsd: false,
  });
  const [error, setError] = useState({
    agency: null,
    dataflow: null,
    dimensions: null,
    dsd: null,
  });

  // ==========================
  // Handlers
  // ==========================

  // Fetch agency options on component mount
  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading((prev) => ({ ...prev, agency: true }));
      try {
        const agencies = await propagateAgencyOptions();
        setAgencyOptions(
          agencies.map((agency) => ({
            value: agency.id,
            label: agency.name,
          }))
        );
        setError((prev) => ({ ...prev, agency: null }));
      } catch (err) {
        setError((prev) => ({ ...prev, agency: "Error fetching agencies." }));
      } finally {
        setLoading((prev) => ({ ...prev, agency: false }));
      }
    };

    fetchAgencies();
  }, []);

  // Fetch dataflow options when an agency is selected
  useEffect(() => {
    const fetchDataflows = async () => {
      if (!selectedAgency) return;
      setLoading((prev) => ({ ...prev, dataflow: true }));
      try {
        const dataflows = await restrictDataflowOptions(selectedAgency.value);
        setDataflowOptions(
          dataflows.map((dataflow) => ({
            value: dataflow.id,
            label: dataflow.name,
            dataflowAgency: dataflow.dataflowAgency,
            dsdId: dataflow.dsdId,
          }))
        );
        setError((prev) => ({ ...prev, dataflow: null }));
      } catch (err) {
        setError((prev) => ({ ...prev, dataflow: "Error fetching dataflows." }));
      } finally {
        setLoading((prev) => ({ ...prev, dataflow: false }));
      }
    };

    fetchDataflows();
  }, [selectedAgency]);

  // Fetch dimensions when a dataflow is selected
  useEffect(() => {
    const fetchDimensions = async () => {
      if (!selectedDataflow) return;
      setLoading((prev) => ({ ...prev, dimensions: true }));
      try {
        const result = await updateDimensions({
          id: selectedDataflow.value,
          dataflowAgency: selectedDataflow.dataflowAgency,
          dsdId: selectedDataflow.dsdId,
        });
        if (result.error) throw new Error(result.error);

        // Convert dimension options for React Select
        const formattedDimensionOptions = {};
        for (const [key, values] of Object.entries(result.updatedDimensions)) {
          formattedDimensionOptions[key] = values
            .map((item) => ({
              value: item.id,
              label: item.name || item.id,
            }))
            .sort((a, b) => a.label.localeCompare(b.label)); // Sort options alphabetically
        }

        setDimensionSelections(result.dimensionSelections);
        setDimensionOptions(formattedDimensionOptions);
        setError((prev) => ({ ...prev, dimensions: null }));
      } catch (err) {
        setError((prev) => ({
          ...prev,
          dimensions: "Error fetching dimensions.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, dimensions: false }));
      }
    };

    fetchDimensions();
  }, [selectedDataflow]);

  // Update DSD whenever dimension selections change
  useEffect(() => {
    const fetchDsd = async () => {
      if (!selectedDataflow) return;
      // Check if all dimensions have at least one selected value
      // const allDimensionsSelected =
      //   Object.keys(dimensionSelections).length > 0 &&
      //   Object.values(dimensionSelections).every(
      //     (values) => values.length > 0 && values[0]
      //   );


      // if (!allDimensionsSelected) {
      //   setDsdResult(null);
      //   console.log("HERERERER")
      //   return;
      // }


      setLoading((prev) => ({ ...prev, dsd: true }));
      try {
        const result = await updateDsd(
          {
            id: selectedDataflow.value,
            dataflowAgency: selectedDataflow.dataflowAgency,
            dsdId: selectedDataflow.dsdId,
          },
          dimensionSelections
        );
        console.log("Result:", result);
        if (result.error) throw new Error(result.error);
        setDsdResult(result);
        setError((prev) => ({ ...prev, dsd: null }));
      } catch (err) {
        setError((prev) => ({ ...prev, dsd: "Error fetching DSD." }));
      } finally {
        setLoading((prev) => ({ ...prev, dsd: false }));
      }
    };

    fetchDsd();
  }, [dimensionSelections, selectedDataflow]);

  // Handler for dimension selection changes
  const handleDimensionChange = async (dimensionId, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
    const newSelections = {
      ...dimensionSelections,
      [dimensionId]: values,
    };

    setDimensionSelections(newSelections);

    setLoading((prev) => ({ ...prev, dimensions: true }));

    try {
      const result = await updateDsd(
        {
          id: selectedDataflow.value,
          dataflowAgency: selectedDataflow.dataflowAgency,
          dsdId: selectedDataflow.dsdId,
        },
        newSelections
      );
      if (result.error) throw new Error(result.error);

      // Convert dimension options for React Select
      const formattedDimensionOptions = {};
      for (const [key, values] of Object.entries(result.updatedDimensions)) {
        formattedDimensionOptions[key] = values
          .map((item) => ({
            value: item.id,
            label: item.name || item.id,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)); // Sort options alphabetically
      }

      setDimensionOptions(formattedDimensionOptions);
      setError((prev) => ({ ...prev, dimensions: null }));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        dimensions: "Error updating dimensions.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, dimensions: false }));
    }
  };

  // ==========================
  // Render
  // ==========================
  return (
    <div>
      <div
        style={{
          ...styles.container,
          right: isVisible ? "0" : "-100%",
          transition: "right 0.3s ease-in-out",
        }}
      >

      {/* Agency Selection */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Agency</h2>
        {loading.agency ? (
          <p style={styles.loadingText}>Loading agencies...</p>
        ) : error.agency ? (
          <p style={styles.error}>{error.agency}</p>
        ) : (
          <div style={styles.selectWrapper}>
            <Select
              options={agencyOptions}
              value={selectedAgency}
              onChange={(selected) => {
                setSelectedAgency(selected);
                setSelectedDataflow(null);
                setDimensionSelections({});
                setDimensionOptions({});
                setDsdResult(null);
              }}
              placeholder="Select Agency"
              styles={customSelectStyles}
            />
          </div>
        )}
      </section>

      {/* Dataflow Selection */}
      {selectedAgency && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Select Dataflow</h2>
          {loading.dataflow ? (
            <p style={styles.loadingText}>Loading dataflows...</p>
          ) : error.dataflow ? (
            <p style={styles.error}>{error.dataflow}</p>
          ) : dataflowOptions.length > 0 ? (
            <div style={styles.selectWrapper}>
              <Select
                options={dataflowOptions}
                value={selectedDataflow}
                onChange={(selected) => {
                  setSelectedDataflow(selected);
                  setDimensionSelections({});
                  setDimensionOptions({});
                  setDsdResult(null);
                }}
                placeholder="Select Dataflow"
                styles={customSelectStyles}
              />
            </div>
          ) : (
            <p style={styles.infoText}>No dataflows available for this agency.</p>
          )}
        </section>
      )}

      {/* Dimension Selection */}
      {selectedDataflow && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Select Dimensions</h2>
          {/* {loading.dimensions ? ( */}
          {false ? (
            <p style={styles.loadingText}>Loading dimensions...</p>
          ) : error.dimensions ? (
            <p style={styles.error}>{error.dimensions}</p>
          ) : (
            <div style={styles.dimensionGrid}>
              {Object.keys(dimensionOptions).map((dimensionId) => {
                // Get selected values from other dimensions
                const otherSelectedValues = Object.keys(dimensionSelections).reduce(
                  (acc, key) => {
                    if (key !== dimensionId) {
                      acc.push(...dimensionSelections[key]);
                    }
                    return acc;
                  },
                  []
                );

                // Filter out options already selected in other dimensions
                const availableOptions = dimensionOptions[dimensionId]
                  .filter((option) => !otherSelectedValues.includes(option.value))
                  .sort((a, b) => a.label.localeCompare(b.label)); // Sort options alphabetically

                return (
                  <div key={dimensionId} style={styles.dimensionContainer}>
                  <label style={styles.dimensionLabel}>{dimensionId}</label>
                  <Select
                    isMulti
                    options={availableOptions}
                    value={
                    dimensionSelections[dimensionId]
                      ? availableOptions.filter((option) =>
                        dimensionSelections[dimensionId].includes(option.value)
                      )
                      : []
                    }
                    onChange={(selectedOptions) =>
                    handleDimensionChange(dimensionId, selectedOptions)
                    }
                    placeholder={`Select ${dimensionId}`}
                    styles={{
                    ...customSelectStyles,
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: "#fff",
                    }),
                    }}
                  />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Display DSD Result */}
      {dsdResult && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>API URL</h2>
          <div style={styles.resultContainer}>
            <pre style={styles.pre}>{dsdResult.apiUrl}</pre>
          </div>
          <h2 style={styles.sectionTitle}>SDMX Implementation</h2>
          <div style={styles.resultContainer}>
            <pre style={styles.pre}>
              {JSON.stringify(dsdResult.sdmxImplementation, null, 2)}
            </pre>
          </div>
          <button onClick={() => alert(JSON.stringify(dsdResult.apiResponse))}>Get apiResponse</button>

          <h2 style={styles.sectionTitle}>DSD Result</h2>
          {loading.dsd ? (
            <p style={styles.loadingText}>Updating DSD...</p>
          ) : error.dsd ? (
            <p style={styles.error}>{error.dsd}</p>
          ) : (
            <div style={styles.resultContainer}>
              <pre style={styles.pre}>
                {JSON.stringify(dsdResult.updatedDimensions, null, 2)}
              </pre>
            </div>
          )}
        </section>
      )}
      </div>
      <button style={styles.toggleButton} onClick={handleToggle}>
        {isVisible ? "Hide Dropdowns" : "Show Dropdowns"}
      </button>
    </div>
  );
};

// ==========================
// Custom Styles for React Select
// ==========================
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "48px",
    width: "250px",
    backgroundColor: "#5bc0de",
    borderColor: "#000",
    color: "#fff",
    boxShadow: "inset 0 4px 4px rgba(0, 0, 0, 0.2)",
    "&:hover, &:focus, &:active": {
      borderColor: "#0056b3",
      outline: "2px solid #0056b3",
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    color: "#fff",
    backgroundColor: "#343a40",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",
    backgroundColor: "#5bc0de",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#5bc0de" : "#fff",
    color: state.isSelected ? "#fff" : "#000",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#5bc0de",
  }),

};

// ==========================
// Styling
// ==========================
const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    width: "min-content",
    margin: "0 auto",
    color: "#333",
    zIndex: 10,
    position: "fixed",
    right: "0",
    top: "100px",
    height: "50vh",
    overflowY: "auto",
    backgroundColor: "#f5f5f5",
    maxWidth: "20%",
  },
  toggleButton: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    backgroundColor: "#5bc0de",
    color: "#fff",
    border: "none",
    padding: "10px",
    cursor: "pointer",
    zIndex: 10000,
  },
  sectionTitle: {
    color: "#000",
    fontSize: "1rem",
  },
  selectWrapper: {
    display: "flex",
    justifyContent: "start",
  },
  dimensionGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },
  dimensionContainer: {
    flex: "1 1 calc(33% - 20px)",
    minWidth: "250px",
  },
  dimensionLabel: {
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: "5px",
  },
  loadingText: {
    textAlign: "center",
    color: "#e67e22",
  },
  error: {
    color: "#e74c3c",
    textAlign: "center",
    fontWeight: "bold",
  },
  infoText: {
    textAlign: "center",
    color: "#7f8c8d",
  },
  pre: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "6px",
    overflowX: "auto",
    border: "1px solid #bdc3c7",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  resultContainer: {
    marginTop: "20px",
  }
};

export default TestUpdateDsd;