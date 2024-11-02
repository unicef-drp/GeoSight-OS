import axios from "axios";

const propagateAgencyOptions = async () => {
  const apiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/agencyscheme/all/all/all?format=fusion-json&detail=full&references=none&includeMetadata=true&includeAllAnnotations=true`;
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



const restrictDataflowOptions = async (agencyParam) => {
  const apiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/dataflow/`;
  const dataflowDetailsList = []; // List to hold the details of each dataflow

  // If no agency parameter is selected, return an empty list
  if (!agencyParam) {
    return dataflowDetailsList;
  }

  try {
    const response = await axios.get(apiUrl);
    const xmlString = response.data;

    // Parse the XML response using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    // Parse through all dataflows
    const dataflows = xmlDoc.getElementsByTagName("str:Dataflow");
    Array.from(dataflows).forEach((dataflowNode) => {
      const agencyID = dataflowNode.getAttribute("agencyID");
      const dataflowID = dataflowNode.getAttribute("id");

      // Only process dataflows that match the specified agency
      if (agencyID === agencyParam) {
        // Extract dataflow name
        const nameNode = dataflowNode.getElementsByTagName("com:Name")[0];
        const dataflowName = nameNode ? nameNode.textContent : "Unnamed";

        // Extract structure information
        const structureNode = dataflowNode.getElementsByTagName("str:Structure")[0];
        const refNode = structureNode ? structureNode.getElementsByTagName("Ref")[0] : null;

        const dataflowDsdID = refNode ? refNode.getAttribute("id") : null;

        // Add the dataflow details to the list as an object
        dataflowDetailsList.push({
          name: dataflowName,
          id: dataflowID,
          dsdId: dataflowDsdID,
          dataflowAgency: agencyID,
        });
      }
    });
  } catch (error) {
    console.error("Error fetching dataflows:", error);
    return { error: "Error fetching dataflows." };
  }

  console.log(dataflowDetailsList)
  return dataflowDetailsList;
};

const updateDimensions = async (dataflow, dataflowVersion = "1.0") => {
  // Initialize dimensionSelections
  const dimensionSelections = {};
  
  try {
    // Construct the API URL based on inputs
    const apiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/datastructure/${dataflow.dataflowAgency}/${dataflow.dsdId}/${dataflowVersion}`;

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
      const conceptIdentityNode = dimension.getElementsByTagName(
        "str:ConceptIdentity"
      )[0];
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

  const { updatedDimensions } = await updateDsd(dataflow, dimensionSelections, dataflowVersion);

  return { dimensionSelections, updatedDimensions };
};

const updateDsd = async (dataflow, dimensions, dataflowVersion = "1.0") => {
  try {
    // Construct the API URL based on inputs
    // Inputs must be IDs
    // Each variable can be a group of variables, such as NT_ANT_HAZ_AVG+MG_RFGS_CNTRY_ASYLM_PER1000 for indicator

    let urlSection = "";

    const keys = [];

    Object.keys(dimensions).forEach((key) => {
      keys.push(key);
    });

    // Construct the URL section based on dimensions
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const values = dimensions[key].join("+");
      urlSection += `${values}`;
      if (i < keys.length - 1) {
        urlSection += ".";
      }
    }

    const apiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/${dataflow.dataflowAgency},${dataflow.id},${dataflowVersion}/${urlSection}?format=fusion-json&dimensionAtObservation=AllDimensions&detail=structureOnly&includeMetrics=true&includeAllAnnotations=true`;


    // Fetch the data from the API
    const response = await axios.get(apiUrl);

    const apiResponse = await response.data;

    let updatedDimensions = apiResponse.structure.dimensions.observation;
    const updatedDimensionsMap = {};
    updatedDimensions.forEach((dimension) => {
      updatedDimensionsMap[dimension.id] = dimension.values;
    });
    updatedDimensions = updatedDimensionsMap;

    const sdmxImplementation = ["implementation 1"];
    console.log(updatedDimensions)

    // return {updatedDimensions, finalUrl, apiResponse, sdmxImplementation};
    return { updatedDimensions, apiUrl, apiResponse, sdmxImplementation };
  } catch (error) {
    console.error("Error fetching or parsing DSD from API:", error);
    return { error: "Error fetching data" };
  }
};

export { propagateAgencyOptions, restrictDataflowOptions, updateDimensions, updateDsd }
