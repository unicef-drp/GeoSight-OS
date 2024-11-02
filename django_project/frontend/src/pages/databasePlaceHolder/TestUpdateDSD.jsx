// File: TestUpdateDsd.jsx

import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  propagateAgencyOptions,
  restrictDataflowOptions,
  updateDimensions,
  updateDsd,
} from "../../django_project/frontend/src/pages/databasePlaceHolder/update_dsd"; // Adjust the path as necessary

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
      const allDimensionsSelected =
        Object.keys(dimensionSelections).length > 0 &&
        Object.values(dimensionSelections).every(
          (values) => values.length > 0 && values[0]
        );

      if (!allDimensionsSelected) {
        setDsdResult(null);
        return;
      }

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
        if (result.error) throw new Error(result.error);
        setDsdResult(result);
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
    <div style={styles.container}>
      <h1 style={styles.title}>SDMX Data Explorer</h1>

      {/* Agency Selection */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Select Agency</h2>
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
          {loading.dimensions ? (
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
                      styles={customSelectStyles}
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
  );
};

// ==========================
// Custom Styles for React Select
// ==========================
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "48px",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

// ==========================
// Styling
// ==========================
const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "1000px",
    margin: "0 auto",
    color: "#333",
  },
  title: {
    textAlign: "center",
    marginBottom: "40px",
    color: "#2c3e50",
  },
  section: {
    marginBottom: "40px",
    padding: "30px",
    borderRadius: "8px",
    backgroundColor: "#ecf0f1",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    marginBottom: "20px",
    color: "#2980b9",
  },
  selectWrapper: {
    display: "flex",
    justifyContent: "center",
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
  },
};

export default TestUpdateDsd;
