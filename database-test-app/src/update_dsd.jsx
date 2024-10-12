// dataflow_version is optional

const update_dsd = async (
  agencyId,
  dataflowId,
  dataflow_version,
  geographicArea,
  indicator,
  sex,
  age,
  subnationalLevel
) => {
  try {
    // Construct the API URL based on inputs
    // Inputs must be IDs
    // Each variable can be a group of variables, such as NT_ANT_HAZ_AVG+MG_RFGS_CNTRY_ASYLM_PER1000 for indicator
    const apiUrlCurrentData = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/${agencyId},${dataflowId},${dataflow_version}/${geographicArea}.${indicator}.${sex}.${age}.${subnationalLevel}?format=fusion-json&dimensionAtObservation=AllDimensions&detail=structureOnly&includeMetrics=true&includeAllAnnotations=true`;

    // Fetch the data from the API
    const response = await fetch(apiUrlCurrentData);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const jsonData = await response.json();

    const dimensions = jsonData.structure.dimensions.observation;
    const parsedDimensions = {};
    dimensions.forEach((dimension) => {
      parsedDimensions[dimension.id] = [];
    });

    for (let i = 0; i < dimensions.length; i++) {
      const dimensionId = dimensions[i].id;
      const dimensionValues = dimensions[i].values.map((value) => ({
        id: value.id,
        name: value.name,
        description: value.description,
      }));
      parsedDimensions[dimensionId] = dimensionValues;
    }

    // Add the SDMX implementation field
    parsedDimensions["sdmx_implementation"] = ["implementation 1"];

    return parsedDimensions;
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
