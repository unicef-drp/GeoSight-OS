// dataflow_version is optional

const update_dsd = async (agency, dataflow, dataflow_version) => {
    try {
      // Construct the API URL based on inputs
      const apiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/datastructure/${agency}/${dataflow}/${dataflow_version}`;
  
      // Fetch the data from the API
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const xmlString = await response.text();
  
      // Parse the XML response using DOMParser (built into browsers)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  
      // Extract the dimensions and their possible values
      const dimensions = {};
      const dimensionNodes = xmlDoc.getElementsByTagName('str:Dimension');
  
      // Iterate through the dimensions and extract information
      for (let i = 0; i < dimensionNodes.length; i++) {
        const dimension = dimensionNodes[i];
        const dimensionId = dimension.getAttribute('id');
  
        // Extract the associated codelist reference
        let codelistRef = null;
        let agencyId = null;
        let codeVersion = null;
        
        const enumerationNode = dimension.getElementsByTagName('str:Enumeration')[0];
        if (enumerationNode) {
          const refNode = enumerationNode.getElementsByTagName('Ref')[0];  // Get the Ref node
          agencyId = refNode?.getAttribute('agencyID');  // Safely get the agencyID
          codelistRef = refNode?.getAttribute('id');  // Safely get the codelist reference ID
          codeVersion = refNode?.getAttribute('version'); // Safely get version
        }
        
        // Fetch the codelist if available
        if (codelistRef && agencyId && codeVersion) {
          dimensions[dimensionId] = await fetchCodelist(agencyId, codelistRef, codeVersion);
        }
      }
  
      // Add the SDMX implementation field
      dimensions['sdmx_implementation'] = ['implementation 1'];
  
      return dimensions;
    } catch (error) {
      console.error('Error fetching or parsing DSD from API:', error);
      return { error: 'Error fetching data' };
    }
  };
  
  // Helper function to fetch the codelist values using fetch and DOMParser
  const fetchCodelist = async (agencyId, codelistId, codeVersion) => {
    try {
      // Construct the codelist API URL (this is an example, adjust as necessary)
      const codelistApiUrl = `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/codelist/${agencyId}/${codelistId}/${codeVersion}`;
  
      // Fetch the codelist data
      const response = await fetch(codelistApiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const xmlString = await response.text();
  
      // Parse the codelist XML using DOMParser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  
      // Extract the possible values from the codelist
      const codes = xmlDoc.getElementsByTagName('str:Code');
      const values = [];
      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        const id = code.getAttribute('id');
        const name = code.getElementsByTagName('com:Name')[0].textContent;
        values.push([id, name]);
      }
  
      return values;
    } catch (error) {
      console.error('Error fetching or parsing codelist:', error);
      return [];
    }
  };
  
  export default update_dsd;
  