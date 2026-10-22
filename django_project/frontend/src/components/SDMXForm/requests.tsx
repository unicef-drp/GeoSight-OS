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
  dimensionTimeKeys: string[];
}> => {
  apiUrl = apiUrl
    .replaceAll("<agency>", agencyId)
    .replaceAll("<dataflow>", dataFlowId)
    .replaceAll("<dataflow_version>", dataFlowVersionId);
  const response = await axios.get(apiUrl, { signal });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "application/xml");
  const dimensionSelections: DimensionOptions = {};

  // Use the dimension id, fallback to the concept identity id
  const getDimensionIds = (tagName: string): string[] =>
    Array.from(xmlDoc.getElementsByTagName(tagName))
      .map((dimension) => {
        let id = dimension.getAttribute("id");
        if (!id) {
          const conceptIdentityNode = dimension.getElementsByTagName(
            "str:ConceptIdentity",
          )[0];
          const refNode = conceptIdentityNode?.getElementsByTagName("Ref")[0];
          id = refNode?.getAttribute("id");
        }
        return id;
      })
      .filter((id) => !!id);

  const dimensionKeys = getDimensionIds("str:Dimension");
  const dimensionTimeKeys = getDimensionIds("str:TimeDimension");
  [...dimensionKeys, ...dimensionTimeKeys].forEach((id) => {
    dimensionSelections[id] = [];
  });
  return { dimensionSelections, dimensionKeys, dimensionTimeKeys };
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
