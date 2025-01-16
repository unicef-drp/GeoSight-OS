import axios from "axios";
import API_URLS from "./config"; // Import the configuration file

// Function to fetch agency options and return them in a list
/**
 * propagateAgencyOptions Function
 *
 * @returns {Array} A list of agencies, each specifying:
 *   @property {string} id - The ID of the agency.
 *   @property {string} name - The name of the agency in English, or the ID if no English name is available.
 */
const propagateAgencyOptions = async () => {
  const apiUrl = API_URLS.agencyScheme;
  const agencyList = [];
 
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Extract agencies from the JSON data
    const agencySchemes = data?.AgencyScheme || [];
    agencySchemes.forEach((scheme) => {
      if (scheme.items && Array.isArray(scheme.items)) {
        scheme.items.forEach((agency) => {
          const agencyID = agency.id;
          const agencyName = agency.names?.find(name => name.locale === "en")?.value || agencyID;
          agencyList.push({ id: agencyID, name: agencyName });
        });
      }
    });
  } catch (error) {
    return { error: "An error has occurred" }
  }

  return agencyList; // Return as a list of agency objects
};

// Function to fetch and restrict dataflow options based on selected agency
/**
 * restrictDataflowOptions Function
 *
 * @param {string} [agencyParam] - The ID of the agency to filter dataflows.
 *
 * @returns {Array} A list of dataflow objects, where each object contains:
 *   @property {string} name - The name of the dataflow.
 *   @property {string} id - The ID of the dataflow.
 *   @property {string} dsdId - The ID of the associated DSD (Data Structure Definition).
 *   @property {string} dataflowAgency - The ID of the agency that owns the dataflow.
 *   If agencyParam is not provided, an empty list is returned.
 */

const restrictDataflowOptions = async (agencyParam) => {
  const apiUrl = API_URLS.dataflow;
  const dataflowDetailsList = []; // List to hold the details of each dataflow

  // If no agency parameter is selected, return an empty list
  if (!agencyParam) return dataflowDetailsList;

  try {
    const response = await axios.get(apiUrl);
    const xmlString = response.data;

    // Parse the XML response using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    // Parse through all dataflows
    const dataflows = xmlDoc.getElementsByTagName("str:Dataflow");
    Array.from(dataflows).forEach((dataflowNode) => {
      const agencyId = dataflowNode.getAttribute("agencyID");
      const dataflowValue = dataflowNode.getAttribute("id");

      // Only process dataflows that match the specified agency
      if (agencyId === agencyParam) {
        // Extract dataflow name
        const nameNode = dataflowNode.getElementsByTagName("com:Name")[0];
        const dataflowLabel = nameNode ? nameNode.textContent : "Unnamed";

        // Extract structure information
        const structureNode = dataflowNode.getElementsByTagName("str:Structure")[0];
        const refNode = structureNode ? structureNode.getElementsByTagName("Ref")[0] : null;

        const dataflowDsdID = refNode ? refNode.getAttribute("id") : null;

        // Add the dataflow details to the list as an object
        dataflowDetailsList.push({
          label: dataflowLabel,
          value: dataflowValue,
          dsdId: dataflowDsdID,
          dataflowAgency: agencyId,
        });
      }
    });
  } catch (error) {
    return { error: "An error has occurred" };
  }

  return dataflowDetailsList;
};

/**
 * propagateDataflowVersions Function
 *
 * @param {Object} dataflow - An object containing information about the selected dataflow:
 *   @property {string} dataflowAgency - The ID of the agency owning the dataflow.
 *   @property {string} value - The dataflow ID.
 *
 * @returns {Array} An array of strings, where each string represents a version of the dataflow.
 */

const propagateDataflowVersions = async (dataflow) => {
  const apiUrl = API_URLS.dataflowVersions(dataflow.dataflowAgency, dataflow.value)
  const dataflowVersions = []

  try {
    // Fetch data from API using axios
    const response = await axios.get(apiUrl);
    const xmlString = response.data

    // Parse the XML response using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml")

    // Extract dataflow elements
    const dataflowNodes = xmlDoc.getElementsByTagName("str:Dataflow");

    // Iterate through Dataflow elements and extract version attributes
    Array.from(dataflowNodes).forEach((dataflowNode) => {
      const version = dataflowNode.getAttribute("version");
      if (version) {
        dataflowVersions.push(version);
      }
    });
  } catch (error) {
    return { error: "An error has occurred" };
  }

  return dataflowVersions;
}

// Function to update dimension selections for a dataflow
/**
 * updateDimensions Function
 *
 * @param {Object} dataflow - The dataflow object containing:
 *   @property {string} dataflowAgency - The ID of the agency owning the dataflow.
 *   @property {string} dsdId - The ID of the associated DSD.
 *   @property {string} [dataflowVersion="1.0"] - The version of the dataflow (default is "1.0").
 *
 * @returns {Object} An object containing:
 *   @property {Object} dimensionSelections - A mapping of dimension IDs to an empty array, initialized for each dimension.
 *   @property {Object} updatedDimensions - A mapping of dimension IDs to their available values, updated from the API response.
 *   If an error occurs, an object with an error property is returned.
 */
const updateDimensions = async (dataflow, dataflowVersion) => {
  const apiUrl = API_URLS.datastructure(dataflow.dataflowAgency, dataflow.dsdId, dataflowVersion);
  const dimensionSelections = {};

  try {
    // Fetch the data from the API using axios
    const response = await axios.get(apiUrl);
    const xmlString = response.data;

    // Parse the XML response using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    // Extract the dimensions and their possible values
    const dimensionNodes = xmlDoc.getElementsByTagName("str:Dimension");

    // Iterate through Dimension elements and extract ConceptIdentity
    Array.from(dimensionNodes).forEach((dimension) => {
      const conceptIdentityNode = dimension.getElementsByTagName("str:ConceptIdentity")[0];
      if (conceptIdentityNode) {
        const refNode = conceptIdentityNode.getElementsByTagName("Ref")[0];
        if (refNode) {
          const id = refNode.getAttribute("id");
          dimensionSelections[id] = []; // Initialize with an empty list for each dimension
        }
      }
    });
  } catch (error) {
    return { error: "An error has occurred" };
  }

  const { updatedDimensions, apiResponse } = await updateDsd(dataflow, dimensionSelections, dataflowVersion);

  return { dimensionSelections, updatedDimensions, apiResponse };
};

// Function to update DSD based on selected dimensions
/**
 * updateDsd Function
 *
 * @param {Object} dataflow - The dataflow object containing:
 *   @property {string} dataflowAgency - The ID of the agency owning the dataflow.
 *   @property {string} id - The ID of the dataflow.
 *   @property {Object} dimensions - A mapping of dimension IDs to an array of their selected values.
 *   @property {string} [dataflowVersion="1.0"] - The version of the dataflow (default is "1.0").
 *
 * @returns {Object} An object containing:
 *   @property {Object} updatedDimensions - A mapping of dimension IDs to their available values.
 *   @property {string} apiUrl - The constructed API URL used for the request.
 *   @property {Object} apiResponse - The full API response from the server.
 *   @property {Array} sdmxImplementation - A placeholder array for additional implementation details.
 *   If an error occurs, an object with an error property is returned.
 */
const updateDsd = async (dataflow, dimensions, dataflowVersion) => {
  try {
    // Construct the URL section based on dimensions
    const urlSection = Object.entries(dimensions)
      .map(([key, values]) => values.join("+"))
      .join(".");

    const apiUrl = API_URLS.data(dataflow.dataflowAgency, dataflow.value, dataflowVersion, urlSection);

    // Fetch the data from the API
    const response = await axios.get(apiUrl);
    const apiResponse = response.data;

    // Map updated dimensions to their values
    const updatedDimensions = apiResponse.structure.dimensions.observation.reduce((map, dimension) => {
      map[dimension.id] = dimension.values;
      return map;
    }, {});

    const sdmxImplementation = ["implementation 1"];

    return { updatedDimensions, apiUrl, apiResponse, sdmxImplementation };
  } catch (error) {
    return { error: "An error has occurred" };
  }
};

export { propagateAgencyOptions, restrictDataflowOptions, propagateDataflowVersions, updateDimensions, updateDsd };
