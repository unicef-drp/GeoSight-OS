import axios from 'axios';

const update_agency_dataflow = async (agencyParam = "", dataflowParam) => {
  // Intitialize as sets to ensure unique values
  let agencyOptions = new Set()
  let dataflowOptions = new Set();
  // Return an imiplicit agency parameter that can be used to construct URL
  let implicitAgency = agencyParam;
  let apiUrl = ``;

  // If both selected, ensure that they can both exist simultaneously
  if (agencyParam !== "" && dataflowParam !== "") {
    apiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/${agencyParam},${dataflowParam}`;
    try {
      // Ensure that both agency and dataflow exist by making a request to the API
      await axios.get(apiUrl);
    } catch (error) {
      console.error("Error fetching datastructure:", error);
      return { agencyOptions, dataflowOptions }; // Return empty options on error
    }
  }
  // If the request was successful or both were not selected, restrict the other fields dynamically 

  // Set the API URL to get the dataflows
  apiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/dataflow/`;
  try {
    const response = await axios.get(apiUrl);
    const xmlString = response.data;

    // Parse the XML response using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    // Parse through all dataflows
    const dataflows = xmlDoc.getElementsByTagName('str:Dataflow');
    Array.from(dataflows).forEach(dataflow => {
      const agencyID = dataflow.getAttribute('agencyID');
      const id = dataflow.getAttribute('id');
      // If the agencyID exists, add it to all possible agencyID options
      if (agencyID) agencyOptions.add(agencyID);
      // If the agencyParam is selected, restrict dataFlow options. Otherwise, add them all.
      if (agencyID === agencyParam || agencyParam === "") dataflowOptions.add(id);
      if (implicitAgency === "" && id === dataflowParam) implicitAgency = agencyID;
    });

  } catch (error) {
    console.error('Error fetching dataflows for agency:', error);
  }

  // 

  // Convert to arrays before returning
  agencyOptions = Array.from(agencyOptions);
  dataflowOptions = Array.from(dataflowOptions);

  // Return both agency and dataflow options, as well as agencyParam2 to be used implicitly for 
  return { agencyOptions, dataflowOptions, implicitAgency };
};

const interpret_dataflow = async (dataflow) =>  {
  let agency = "";
  let dataflowDsd = "";
  try {
    const apiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/dataflow`;

    // fetch data from API using axios
    const response = await axios.get(apiUrl);
    const xmlString = response.data;

    // Parse the XML response using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    // Extract the Dataflow nodes
    const dataflowNodes = xmlDoc.getElementsByTagName('str:Dataflow');

    // Iterate through Dataflows to find the matching dataflow by ID
    for (let i = 0; i < dataflowNodes.length; i++) {
      const dataflowNode = dataflowNodes[i];
      const id = dataflowNode.getAttribute('id');

      // Check if the ID matches the input
      if (id === dataflow) {
        // Extract agencyID and id from the Structure node
        const structureNode = dataflowNode.getElementsByTagName('str:Structure')[0];
        const refNode = structureNode.getElementsByTagName('Ref')[0];

        agency = refNode.getAttribute('agencyID');
        dataflowDsd = refNode.getAttribute('id');
        break;
      }
    }

  }
  catch(error) {
    return { error: "Error getting dataflowDSD "}
  }

  return { agency, dataflowDsd }
}

const update_dimensions = async (dataflow, dataflowVersion = "1.0") => {
  // Initialize dimensionSelections
  const dimensionSelections = {};
  // first, convert the dataflow to a dataflowDSD format
  const { agency, dataflowDsd } = await interpret_dataflow(dataflow)  

  try {
    // Construct the API URL based on inputs
    const apiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/datastructure/${agency}/${dataflowDsd}/${dataflowVersion}`;

    // Fetch the data from the API using axios
    const response = await axios.get(apiUrl);
    const xmlString = response.data;

    // Parse the XML response using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    // Extract the dimensions and their possible values
    // TODO: Determine if order here works. otherwise, maybe implement as a list of objects
    const dimensionNodes = xmlDoc.getElementsByTagName('str:Dimension');

    // Iterate through Dimension elements and extract ConceptIdentity
    Array.from(dimensionNodes).forEach((dimension) => {
      const conceptIdentityNode = dimension.getElementsByTagName('str:ConceptIdentity')[0];
      if (conceptIdentityNode) {
        const refNode = conceptIdentityNode.getElementsByTagName('Ref')[0];
        if (refNode) {
          const id = refNode.getAttribute('id');
          dimensionSelections[id] = []; // Initialize with an empty list for each dimension
        }
      }
    });
  }
    catch(error) {
      return { error: "Error fetching dimensions" };
    }

  const { updated_dimensions } = await update_dsd(dataflow, dataflowVersion, dimensionSelections)

  return { dimensionSelections, updated_dimensions }
};


const update_dsd = async (
  dataflow,
  dataflow_version,
  dimensions,
  subformat_options = "v2.1 structure specific"
) => {
  const { agency } = await interpret_dataflow(dataflow)

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

    const api_url = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/${agency},${dataflow},${dataflow_version}/${urlSection}?format=fusion-json&dimensionAtObservation=AllDimensions&detail=structureOnly&includeMetrics=true&includeAllAnnotations=true`;
    console.log(api_url);

    // Fetch the data from the API
    const response = await fetch(api_url);
    // if (!response.ok) {
    //   throw new Error("Network response was not ok");
    // }

    const api_response = await response.json();

    let updated_dimensions = api_response.structure.dimensions.observation;
    const updated_dimensions_map = {};
    updated_dimensions.forEach((dimension) => {
      updated_dimensions_map[dimension.id] = dimension.values;
    });
    updated_dimensions = updated_dimensions_map;

    const sdmxImplementation = ["implementation 1"];

    // return {updated_dimensions, final_url, api_response, sdmx_implementation};
    return { updated_dimensions, api_url, api_response, sdmxImplementation };
  } catch (error) {
    console.error("Error fetching or parsing DSD from API:", error);
    return { error: "Error fetching data" };
  }
};

export { update_agency_dataflow, update_dimensions, update_dsd };
