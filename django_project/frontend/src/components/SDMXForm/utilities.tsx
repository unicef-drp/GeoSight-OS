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
import { DataflowOption, DimensionSelections } from "./types";

interface Agency {
  id: string;
  name: string;
}

interface DsdResult {
  updatedDimensions: Record<string, any[]>;
  apiUrl: string;
  apiResponse: any;
  sdmxImplementation: string[];
}

interface DimensionsResult {
  dimensionSelections: DimensionSelections;
  updatedDimensions: Record<string, any[]>;
  apiResponse: any;
}

interface ErrorResult {
  error: string;
}

const propagateAgencyOptions = async (
  apiUrl: string,
): Promise<Agency[] | ErrorResult> => {
  const agencyList: Agency[] = [];
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    const agencySchemes = data?.AgencyScheme || [];
    agencySchemes.forEach((scheme: any) => {
      if (scheme.items && Array.isArray(scheme.items)) {
        scheme.items.forEach((agency: any) => {
          const agencyID = agency.id;
          const agencyName =
            agency.names?.find((name: any) => name.locale === "en")?.value ||
            agencyID;
          agencyList.push({ id: agencyID, name: agencyName });
        });
      }
    });
  } catch {
    return { error: "An error has occurred" };
  }
  return agencyList;
};

const restrictDataflowOptions = async (
  apiUrl: string,
  agencyParam?: string,
): Promise<DataflowOption[] | ErrorResult> => {
  const dataflowDetailsList: DataflowOption[] = [];
  if (!agencyParam) return dataflowDetailsList;
  try {
    const response = await axios.get(apiUrl);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "application/xml");
    const dataflows = xmlDoc.getElementsByTagName("str:Dataflow");
    Array.from(dataflows).forEach((dataflowNode) => {
      const agencyId = dataflowNode.getAttribute("agencyID");
      const dataflowValue = dataflowNode.getAttribute("id");
      if (agencyId === agencyParam) {
        const nameNode = dataflowNode.getElementsByTagName("com:Name")[0];
        const dataflowLabel = nameNode
          ? (nameNode.textContent ?? "Unnamed")
          : "Unnamed";
        const structureNode =
          dataflowNode.getElementsByTagName("str:Structure")[0];
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
      }
    });
  } catch {
    return { error: "An error has occurred" };
  }
  return dataflowDetailsList;
};

const propagateDataflowVersions = async (
  apiUrl: string,
  dataflow: DataflowOption,
): Promise<string[] | ErrorResult> => {
  apiUrl = apiUrl
    .replaceAll("<agency>", dataflow.dataflowAgency)
    .replaceAll("<dataflow>", dataflow.value);
  const dataflowVersions: string[] = [];
  try {
    const response = await axios.get(apiUrl);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "application/xml");
    const dataflowNodes = xmlDoc.getElementsByTagName("str:Dataflow");
    Array.from(dataflowNodes).forEach((dataflowNode) => {
      const version = dataflowNode.getAttribute("version");
      if (version) dataflowVersions.push(version);
    });
  } catch {
    return { error: "An error has occurred" };
  }
  return dataflowVersions;
};

const updateDimensions = async (
  apiUrl: string,
  apiDataUrl: string,
  dataflow: DataflowOption,
  dataflowVersion: string,
): Promise<DimensionsResult | ErrorResult> => {
  apiUrl = apiUrl
    .replaceAll("<agency>", dataflow.dataflowAgency)
    .replaceAll("<dataflow>", dataflow.dsdId ?? "")
    .replaceAll("<dataflow_version>", dataflowVersion);
  const dimensionSelections: DimensionSelections = {};
  try {
    const response = await axios.get(apiUrl);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "application/xml");
    const dimensionNodes = xmlDoc.getElementsByTagName("str:Dimension");
    Array.from(dimensionNodes).forEach((dimension) => {
      const conceptIdentityNode = dimension.getElementsByTagName(
        "str:ConceptIdentity",
      )[0];
      if (conceptIdentityNode) {
        const refNode = conceptIdentityNode.getElementsByTagName("Ref")[0];
        if (refNode) {
          const id = refNode.getAttribute("id");
          if (id) dimensionSelections[id] = [];
        }
      }
    });
  } catch {
    return { error: "An error has occurred" };
  }
  const result = await updateDsd(
    apiDataUrl,
    dataflow,
    dimensionSelections,
    dataflowVersion,
  );
  if ("error" in result) return result;
  return {
    dimensionSelections,
    updatedDimensions: result.updatedDimensions,
    apiResponse: result.apiResponse,
  };
};

const updateDsd = async (
  apiUrl: string,
  dataflow: DataflowOption,
  dimensions: DimensionSelections,
  dataflowVersion: string,
): Promise<DsdResult | ErrorResult> => {
  try {
    const urlSection = Object.entries(dimensions)
      .map(([, values]) => values.join("+"))
      .join(".");
    apiUrl = apiUrl
      .replaceAll("<agency>", dataflow.dataflowAgency)
      .replaceAll("<dataflow>", dataflow.value)
      .replaceAll("<dataflow_version>", dataflowVersion)
      .replaceAll("<dimensions>", urlSection);
    const response = await axios.get(apiUrl);
    const apiResponse = response.data;
    const updatedDimensions: Record<string, any[]> =
      apiResponse.structure.dimensions.observation.reduce(
        (map: Record<string, any[]>, dimension: any) => {
          map[dimension.id] = dimension.values;
          return map;
        },
        {},
      );
    return {
      updatedDimensions,
      apiUrl,
      apiResponse,
      sdmxImplementation: ["implementation 1"],
    };
  } catch {
    return { error: "An error has occurred" };
  }
};

export {
  propagateAgencyOptions,
  restrictDataflowOptions,
  propagateDataflowVersions,
  updateDimensions,
  updateDsd,
};
