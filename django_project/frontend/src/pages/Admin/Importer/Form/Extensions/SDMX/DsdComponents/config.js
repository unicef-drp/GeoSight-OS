// config.js
const API_URLS = {
  agencyScheme: "https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/agencyscheme/all/all/all?format=fusion-json&detail=full&references=none&includeMetadata=true&includeAllAnnotations=true",
  dataflow: "https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/dataflow/",
  dataflowVersions: (agency, dsdId) => `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/dataflow/${agency}/${dsdId}/all/?format=sdmx-2.1&detail=full&references=none`,
  datastructure: (agency, dsdId, version = "1.0") => `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/datastructure/${agency}/${dsdId}/${version}`,
  data: (agency, id, version, urlSection) => `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/${agency},${id},${version}/${urlSection}?format=fusion-json&dimensionAtObservation=AllDimensions&detail=structureOnly&includeMetrics=true&includeAllAnnotations=true`,
};

export default API_URLS;
