/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '29/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import axios from "axios";
import { constructSDMXUrl } from "./utilities";
import { DataflowOption, DimensionOptions } from "./types";
import { Agency } from "../../types/SDMX";
import { SelectOption } from "../../types/Input";

export const fetchAgencies = async (
  apiUrl: string,
  signal?: AbortSignal,
): Promise<Agency[]> => {
  const response = await axios.get(apiUrl, { signal });
  const agencySchemes = response.data?.AgencyScheme || [];
  const agencies: Agency[] = [];
  agencySchemes.forEach((scheme: any) => {
    if (scheme.items && Array.isArray(scheme.items)) {
      scheme.items.forEach((agency: any) => {
        const agencyID = agency.id;
        const agencyName =
          agency.names?.find((name: any) => name.locale === "en")?.value ||
          agencyID;
        agencies.push({ id: agencyID, name: agencyName });
      });
    }
  });
  return agencies;
};

export const fetchDataflows = async (
  apiUrl: string,
  signal?: AbortSignal,
): Promise<DataflowOption[]> => {
  const response = await axios.get(apiUrl, { signal });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "application/xml");
  const dataflows = xmlDoc.getElementsByTagName("str:Dataflow");
  const dataflowDetailsList: DataflowOption[] = [];

  Array.from(dataflows).forEach((dataflowNode) => {
    const agencyId = dataflowNode.getAttribute("agencyID");
    const dataflowValue = dataflowNode.getAttribute("id");
    const nameNode = dataflowNode.getElementsByTagName("com:Name")[0];
    const dataflowLabel = nameNode
      ? (nameNode.textContent ?? "Unnamed")
      : "Unnamed";
    const structureNode = dataflowNode.getElementsByTagName("str:Structure")[0];
    const refNode = structureNode
      ? structureNode.getElementsByTagName("Ref")[0]
      : null;
    const dataflowDsdID = refNode ? refNode.getAttribute("id") : null;
    dataflowDetailsList.push({
      label: dataflowLabel,
      value: dataflowValue ?? "",
      dsdId: dataflowDsdID,
      dataflowAgency: agencyId,
    });
  });
  return dataflowDetailsList;
};

export const fetchDataflowVersions = async (
  apiUrl: string,
  agencyId: string,
  dataFlowId: string,
  signal?: AbortSignal,
): Promise<SelectOption[]> => {
  apiUrl = apiUrl
    .replaceAll("<agency>", agencyId)
    .replaceAll("<dataflow>", dataFlowId);
  const response = await axios.get(apiUrl, { signal });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "application/xml");
  const dataflowNodes = xmlDoc.getElementsByTagName("str:Dataflow");
  const versions: string[] = [];
  Array.from(dataflowNodes).forEach((dataflowNode) => {
    const version = dataflowNode.getAttribute("version");
    if (version) versions.push(version);
  });
  return versions.map((version) => ({
    value: version,
    label: `Version ${version}`,
  }));
};

export const fetchDimensions = async (
  apiUrl: string,
  agencyId: string,
  dataFlowId: string,
  dataFlowVersionId: string,
  signal?: AbortSignal,
): Promise<{
  dimensionSelections: DimensionOptions;
  dimensionKeys: string[];
}> => {
  apiUrl = apiUrl
    .replaceAll("<agency>", agencyId)
    .replaceAll("<dataflow>", dataFlowId)
    .replaceAll("<dataflow_version>", dataFlowVersionId);
  const response = await axios.get(apiUrl, { signal });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "application/xml");
  const dimensionNodes = xmlDoc.getElementsByTagName("str:Dimension");
  const dimensionSelections: DimensionOptions = {};
  const dimensionKeys: string[] = [];
  Array.from(dimensionNodes).forEach((dimension) => {
    const conceptIdentityNode = dimension.getElementsByTagName(
      "str:ConceptIdentity",
    )[0];
    if (conceptIdentityNode) {
      const refNode = conceptIdentityNode.getElementsByTagName("Ref")[0];
      if (refNode) {
        const id = refNode.getAttribute("id");
        if (id) {
          dimensionSelections[id] = [];
          dimensionKeys.push(id);
        }
      }
    }
  });
  return { dimensionSelections, dimensionKeys };
};

export const fetchStructure = async (
  apiUrl: string,
  agencyId: string,
  dataFlowId: string,
  dataFlowVersionId: string,
  dimensions: DimensionOptions,
  signal?: AbortSignal,
): Promise<DimensionOptions> => {
  const url = constructSDMXUrl(apiUrl, agencyId, dataFlowId, dataFlowVersionId);
  const response = await axios.get(url, { signal });
  const apiResponse = response.data;
  apiResponse.structure.dimensions.observation.reduce(
    (map: Record<string, any[]>, dimension: any) => {
      dimensions[dimension.id] = dimension.values.map((value: any) => ({
        value: value.id,
        label: value.name,
      }));
      return map;
    },
    {},
  );
  return dimensions;
};
