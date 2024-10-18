// dataflow_version is optional

const update_dsd = async (
  agency,
  dataflow,
  dataflow_version,
  dimensions,
  subformat_options = "v2.1 structure specific"
) => {
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

    // Fetch the data from the API
    const response = await fetch(api_url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

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

// Helper function to fetch the codelist values using fetch and DOMParser
// const fetchCodelist = async (agencyId, codelistId, codeVersion) => {
//   try {
//     // Construct the codelist API URL (this is an example, adjust as necessary)
//     const codelistApiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/codelist/${agencyId}/${codelistId}/${codeVersion}`;

//     // Fetch the codelist data
//     const response = await fetch(codelistApiUrl);
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const xmlString = await response.text();

//     // Parse the codelist XML using DOMParser
//     const parser = new DOMParser();
//     const xmlDoc = parser.parseFromString(xmlString, "application/xml");

//     // Extract the possible values from the codelist
//     const codes = xmlDoc.getElementsByTagName("str:Code");
//     const values = [];
//     for (let i = 0; i < codes.length; i++) {
//       const code = codes[i];
//       const id = code.getAttribute("id");
//       const name = code.getElementsByTagName("com:Name")[0].textContent;
//       values.push([id, name]);
//     }

//     return values;
//   } catch (error) {
//     console.error("Error fetching or parsing codelist:", error);
//     return [];
//   }
// };

const getDataflows = async () => {
  try {
    const apiUrlDataflows = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/dataflow/all/all/all?format=fusion-json&detail=full&references=none&includeMetadata=true&includeMetrics=only&includeAllAnnotations=true`;

    const response = await fetch(apiUrlDataflows);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const dataflows = (await response.json()).Dataflow;

    // Extract the possible values from the codelist
    const values = [];
    for (let i = 0; i < dataflows.length; i++) {
      values.push({ id: dataflows[i].id, agencyId: dataflows[i].agencyId });
    }

    return values;
  } catch (error) {
    console.error("Error fetching or parsing codelist:", error);
    return [];
  }
};

export default update_dsd;
export { getDataflows };
