// File: TestUpdateDsd.jsx

import React, { useState } from "react";
import { update_agency_dataflow, update_dimensions, update_dsd } from "./update_dsd"; // Adjust the path as necessary

const TestUpdateDsd = () => {
  // ==========================
  // State Variables
  // ==========================

  // State for update_agency_dataflow
  const [agencyParam, setAgencyParam] = useState('');
  const [dataflowParam, setDataflowParam] = useState('');
  const [agencyDataflowResult, setAgencyDataflowResult] = useState(null);
  const [agencyDataflowError, setAgencyDataflowError] = useState(null);
  const [agencyDataflowLoading, setAgencyDataflowLoading] = useState(false);

  // State for update_dimensions
  const [dimensionsDataflow, setDimensionsDataflow] = useState('');
  const [dimensionsVersion, setDimensionsVersion] = useState('1.0');
  const [dimensionsResult, setDimensionsResult] = useState(null);
  const [dimensionsError, setDimensionsError] = useState(null);
  const [dimensionsLoading, setDimensionsLoading] = useState(false);
  const [agencyFromDimensions, setAgencyFromDimensions] = useState(''); // Capture agency from dimensions
  const [dimensionSelections, setDimensionSelections] = useState({}); // Store dimensionSelections
  const [dimensionOptions, setDimensionOptions] = useState({}); // Store dimensionOptions

  // State for update_dsd
  const [dsdDataflow, setDsdDataflow] = useState('');
  const [dsdVersion, setDsdVersion] = useState('1.0');
  const [dsdResult, setDsdResult] = useState(null);
  const [dsdError, setDsdError] = useState(null);
  const [dsdLoading, setDsdLoading] = useState(false);

  // ==========================
  // Handlers for testing update_agency_dataflow
  // ==========================
  const handleTestAgencyDataflow = async () => {
    setAgencyDataflowLoading(true);
    setAgencyDataflowError(null);
    setAgencyDataflowResult(null);
    try {
      const result = await update_agency_dataflow(agencyParam, dataflowParam);
      setAgencyDataflowResult(result);
    } catch (error) {
      setAgencyDataflowError(error.message || "Error occurred while fetching agency and dataflow.");
    } finally {
      setAgencyDataflowLoading(false);
    }
  };

  // ==========================
  // Handlers for testing update_dimensions
  // ==========================
  const handleTestDimensions = async () => {
    setDimensionsLoading(true);
    setDimensionsError(null);
    setDimensionsResult(null);
    setAgencyFromDimensions(''); // Reset agency from dimensions
    setDimensionSelections({}); // Reset dimensionSelections
    setDimensionOptions({}); // Reset dimensionOptions
    try {
      const dataflow = dimensionsDataflow.trim();
      const dataflowVersion = dimensionsVersion.trim() || '1.0';

      if (!dataflow || !dataflowVersion) {
        throw new Error('Please provide all required parameters for dimensions.');
      }

      const result = await update_dimensions(dataflow, dataflowVersion);
      if (result.error) {
        throw new Error(result.error);
      }

      setDimensionsResult(result);
      setAgencyFromDimensions(result.agency || ''); // Capture agency from dimensions
      setDimensionSelections(result.dimensionSelections || {}); // Set dimensionSelections
      setDimensionOptions(result.dimensionOptions || {}); // Set dimensionOptions
    } catch (error) {
      setDimensionsError(error.message || "Error occurred while fetching dimensions.");
    } finally {
      setDimensionsLoading(false);
    }
  };

  // ==========================
  // Handlers for testing update_dsd
  // ==========================
  const handleTestDsd = async () => {
    setDsdLoading(true);
    setDsdError(null);
    setDsdResult(null);
    try {
      const dataflow = dsdDataflow.trim();
      const dataflowVersion = dsdVersion.trim() || '1.0';

      if (!dataflow || !dataflowVersion) {
        throw new Error('Please provide both Dataflow and Dataflow Version.');
      }

      if (!dimensionSelections || Object.keys(dimensionSelections).length === 0) {
        throw new Error('Please run `update_dimensions` first to obtain dimension selections.');
      }

      const result = await update_dsd(dataflow, dataflowVersion, dimensionSelections);
      if (result.error) {
        throw new Error(result.error);
      }
      setDsdResult(result);
    } catch (error) {
      setDsdError(error.message || "Error occurred while fetching DSD.");
    } finally {
      setDsdLoading(false);
    }
  };

  // ==========================
  // Render
  // ==========================
  return (
    <div style={styles.container}>
      <h1>Test Component</h1>

      {/* Section to Test update_agency_dataflow */}
      <section style={styles.section}>
        <h2>Test `update_agency_dataflow`</h2>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Agency Parameter:
            <input
              type="text"
              value={agencyParam}
              onChange={(e) => setAgencyParam(e.target.value)}
              placeholder="Enter Agency"
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Dataflow Parameter:
            <input
              type="text"
              value={dataflowParam}
              onChange={(e) => setDataflowParam(e.target.value)}
              placeholder="Enter Dataflow"
              style={styles.input}
            />
          </label>
        </div>
        <button
          onClick={handleTestAgencyDataflow}
          style={styles.button}
          disabled={agencyDataflowLoading || (!agencyParam && !dataflowParam)}
        >
          {agencyDataflowLoading ? 'Loading...' : 'Test `update_agency_dataflow`'}
        </button>
        {agencyDataflowError && <p style={styles.error}>Error: {agencyDataflowError}</p>}
        {agencyDataflowResult && (
          <div style={styles.resultContainer}>
            <h3>Agency and Dataflow Options:</h3>
            <p><strong>Agency Options:</strong></p>
            <pre style={styles.pre}>{JSON.stringify(agencyDataflowResult.agencyOptions, null, 2)}</pre>
            <p><strong>Dataflow Options:</strong></p>
            <pre style={styles.pre}>{JSON.stringify(agencyDataflowResult.dataflowOptions, null, 2)}</pre>
            <p><strong>Implicit Agency:</strong> {agencyDataflowResult.implicitAgency}</p>
          </div>
        )}
      </section>

      {/* Section to Test update_dimensions */}
      <section style={styles.section}>
        <h2>Test `update_dimensions`</h2>
        <div style={styles.inputGroup}>
          {/* Removed Agency input as update_dimensions no longer requires it */}
          <label style={styles.label}>
            Dataflow:
            <input
              type="text"
              value={dimensionsDataflow}
              onChange={(e) => setDimensionsDataflow(e.target.value)}
              placeholder="Enter Dataflow"
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Dataflow Version:
            <input
              type="text"
              value={dimensionsVersion}
              onChange={(e) => setDimensionsVersion(e.target.value)}
              placeholder="Enter Dataflow Version (e.g., 1.0)"
              style={styles.input}
            />
          </label>
        </div>
        <button
          onClick={handleTestDimensions}
          style={styles.button}
          disabled={dimensionsLoading || !dimensionsDataflow || !dimensionsVersion}
        >
          {dimensionsLoading ? 'Loading...' : 'Test `update_dimensions`'}
        </button>
        {dimensionsError && <p style={styles.error}>Error: {dimensionsError}</p>}
        {dimensionsResult && (
          <div style={styles.resultContainer}>
            <h3>Dimension Selections:</h3>
            <pre style={styles.pre}>{JSON.stringify(dimensionsResult.dimensionSelections, null, 2)}</pre>
            <h3>Dimension Options:</h3>
            <pre style={styles.pre}>{JSON.stringify(dimensionsResult.updated_dimensions, null, 2)}</pre>
            <p><strong>Agency from Dimensions:</strong> {dimensionsResult.agency}</p>
          </div>
        )}
      </section>

      {/* Section to Test update_dsd */}
      <section style={styles.section}>
        <h2>Test `update_dsd`</h2>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Dataflow:
            <input
              type="text"
              value={dsdDataflow}
              onChange={(e) => setDsdDataflow(e.target.value)}
              placeholder="Enter Dataflow"
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Dataflow Version:
            <input
              type="text"
              value={dsdVersion}
              onChange={(e) => setDsdVersion(e.target.value)}
              placeholder="Enter Dataflow Version (e.g., 1.0)"
              style={styles.input}
            />
          </label>
        </div>

        <button
          onClick={handleTestDsd}
          style={styles.button}
          disabled={
            dsdLoading ||
            !dsdDataflow ||
            !dsdVersion ||
            Object.keys(dimensionSelections).length === 0
          }
        >
          {dsdLoading ? 'Loading...' : 'Test `update_dsd`'}
        </button>
        {dsdError && <p style={styles.error}>Error: {dsdError}</p>}
        {dsdResult && (
          <div style={styles.resultContainer}>
            <h3>DSD Result:</h3>
            <p><strong>Updated Dimensions:</strong></p>
            <pre style={styles.pre}>{JSON.stringify(dsdResult.updated_dimensions, null, 2)}</pre>
            <p><strong>Final URL:</strong> {dsdResult.api_url}</p>
            <p><strong>API Response:</strong></p>
            <pre style={styles.pre}>{JSON.stringify(dsdResult.api_response, null, 2)}</pre>
            <p><strong>SDMX Implementation:</strong> {JSON.stringify(dsdResult.sdmxImplementation)}</p>
          </div>
        )}

        {/* Display the current dimensionSelections being used */}
        {dimensionSelections && Object.keys(dimensionSelections).length > 0 && (
          <div style={styles.dimensionsDisplay}>
            <h3>Current Dimension Selections:</h3>
            <pre style={styles.pre}>{JSON.stringify(dimensionSelections, null, 2)}</pre>
          </div>
        )}
      </section>
    </div>
  );
};

// ==========================
// Styling
// ==========================
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '40px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '15px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 'bold',
  },
  input: {
    marginTop: '5px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
    disabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
    },
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
  pre: {
    backgroundColor: '#f4f4f4',
    padding: '10px',
    borderRadius: '4px',
    overflowX: 'auto',
    marginTop: '10px',
  },
  dimensionsDisplay: {
    marginTop: '20px',
  },
  resultContainer: {
    marginTop: '20px',
  },
};

export default TestUpdateDsd;





// // Delete once update_dsd is complete!
// const TestComponent = () => {
//   const [update_dsd_options, set_update_dsd_options] = useState(null);
//   const [codes, set_codes] = useState({});
//   const [higher_level_dimensions, set_higher_level_dimensions] = useState({
//     geographicArea: [],
//     indicator: [],
//     sex: [],
//     age: [],
//     subnationalLevel: [],
//   });
//   const [agency, set_agency] = useState("UNICEF.AFGHANISTAN_CO");
//   const [dataflow, set_dataflow] = useState("AFG_CO");
//   const [agency_options, set_agency_options] = useState(null);
//   const [dataflow_options, set_dataflow_options] = useState(null);

//   // TODO: Default testing, Tomas, you can delete this useEffect
//   useEffect(() => {
//     set_agency_options([
//       "UNICEF.AFGHANISTAN_CO",
//       "UNICEF.AFGHANISTAN_CO",
//       "UNICEF.AFGHANISTAN_CO",
//     ]);
//     set_dataflow_options(["AFG_CO", "AFG_CO", "AFG_CO"]);

//     set_higher_level_dimensions({
//       geographicArea: [],
//       indicator: [],
//       sex: [],
//       age: [],
//       subnationalLevel: [],
//     });
//   }, []);

//   // upon first render based on new higher level dimensions, fetch the codes
//   useEffect(() => {
//     const fetchCodes = async () => {
//       const response = await update_dsd(
//         agency,
//         dataflow,
//         1.0,
//         higher_level_dimensions
//       );

//       set_update_dsd_options(response);
//     };
//     fetchCodes();
//   }, [agency, dataflow, higher_level_dimensions]);

//   // upon change of code selections, fetch the new codes
//   useEffect(() => {
//     const fetchCodes = async () => {
//       const response = await update_dsd(agency, dataflow, 1.0, codes);

//       set_update_dsd_options(response);
//     };
//     fetchCodes();
//   }, [agency, dataflow, codes]);

//   // when agency or dataflow changes, fetch the new agencies and dataflows
//   useEffect(() => {}, [agency, dataflow]);

//   return (
//     <main>
//       <div>Rendered Component</div>
//       <div>Form Component</div>
//       <select value={agency} onChange={(e) => set_agency(e.target.value)}>
//         <option value="" disabled>
//           Select agency
//         </option>
//         {agency_options &&
//           agency_options.map((option, index) => (
//             <option key={index} value={option}>
//               {option}
//             </option>
//           ))}
//       </select>
//       <select value={dataflow} onChange={(e) => set_dataflow(e.target.value)}>
//         <option value="" disabled>
//           Select dataflow
//         </option>
//         {dataflow_options &&
//           dataflow_options.map((option, index) => (
//             <option key={index} value={option}>
//               {option}
//             </option>
//           ))}
//       </select>

//       {update_dsd_options &&
//         Object.keys(update_dsd_options.updated_dimensions).map((key) => (
//           <div key={key}>
//             <select>
//               {update_dsd_options.updated_dimensions[key].map(
//                 (option, index) => (
//                   <option key={index} value={option.id}>
//                     {option.name}
//                   </option>
//                 )
//               )}
//             </select>
//           </div>
//         ))}
//       <div>
//         {update_dsd_options && (
//           <pre>
//             {JSON.stringify(
//               Object.keys(update_dsd_options).reduce((acc, key) => {
//                 acc[key] = update_dsd_options[key];
//                 return acc;
//               }, {}),
//               null,
//               2
//             )}
//           </pre>
//         )}
//       </div>
//     </main>
//   );
// };

// export default TestComponent;
