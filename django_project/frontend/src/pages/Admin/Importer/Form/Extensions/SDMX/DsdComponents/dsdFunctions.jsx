import axios from "axios";
import API_URLS from "./config"; // Import the configuration file

// Function to fetch agency options and return them in a list
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
    console.error("Error fetching agency options:", error);
  }

  return agencyList; // Return as a list of agency objects
};

// Function to fetch and restrict dataflow options based on selected agency
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
    console.error("Error fetching dataflows:", error);
    return { error: "Error fetching dataflows." };
  }

  return dataflowDetailsList;
};

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
    return { error: "Error fetching dataflow versions" };
  }

  return dataflowVersions;
}

// Function to update dimension selections for a dataflow
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
    return { error: "Error fetching dimensions" };
  }

  const { updatedDimensions, apiResponse } = await updateDsd(dataflow, dimensionSelections, dataflowVersion);

  return { dimensionSelections, updatedDimensions, apiResponse };
};

// Function to update DSD based on selected dimensions
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

    return { updatedDimensions, apiResponse, sdmxImplementation };
  } catch (error) {
    console.error("Error fetching or parsing DSD from API:", error);
    return { error: "Error fetching data" };
  }
};

export { propagateAgencyOptions, restrictDataflowOptions, propagateDataflowVersions, updateDimensions, updateDsd };
