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
import Papa from "papaparse";
import { COUNT_UNIQUE } from "../components/SqlQueryGenerator/Aggregation";
import { alasqlQuery } from "./alasql";

export const fetchSdmx = async (
  url: string,
): Promise<Record<string, any>[]> => {
  const urls = url.split("?");
  const isLocalhost = /^https?:\/\/localhost(:\d+)?/i.test(urls[0]);
  const cleanPath = isLocalhost
    ? urls[0].replace(/\/(%2E%2E|\.\.)(?=\/|$)/gi, "")
    : urls[0];
  url = [cleanPath, "format=csv"].join("?");
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        Papa.parse(response.data, {
          header: true,
          worker: false,
          complete: (result) => {
            if (result.errors.length > 1) {
              reject(result.errors);
              return;
            }
            const rows = (result.data as any[]).filter((row) =>
              Object.values(row).some((v) => v !== ""),
            );
            resolve(
              rows.map((row: any, idx: number) => ({
                ...row,
                id: idx,
              })),
            );
          },
          error: (error: Error) => reject(error),
        });
      })
      .catch((error: any) => {
        if (error?.response?.status === 404) {
          resolve([]);
          return;
        }
        reject(error);
      });
  });
};

/**
 * Get sdmx data
 */
export const getSdmxData = (
  data: Record<string, any>[],
  config: any,
  geoField: string,
): Record<string, any>[] => {
  if (!data?.length) return [];
  const whereClause = "";
  data = alasqlQuery(
    `SELECT *
     FROM ? as data ${whereClause}
     ORDER BY data.[date] ASC`,
    [data],
  );
  const latestDates: Record<string, any> = {};
  alasqlQuery(
    `SELECT ucode, MAX([date]) as max_date
     FROM ? as data
     GROUP BY ucode`,
    [data],
  ).forEach((row: any) => {
    latestDates[row.ucode] = row.max_date;
  });
  data = data.filter((row) => row.date === latestDates[row.ucode]);

  if (config.aggregationType && config.valueField) {
    data = data.map((row) => ({
      ...row,
      [config.valueField]: Number(row[config.valueField]),
    }));
    if (["MAJORITY", "MINORITY"].includes(config.aggregationType)) {
      data = alasqlQuery(
        `SELECT MAX(data.ucode)                    as _ucode,
                MAX(data.concept_uuid)             as _concept_uuid,
                data.[${config.valueField}]        as _value,
                MAX(data.date)                     as _date,
                MAX(data.admin_level)              as _admin_level,
                COUNT(data.[${config.valueField}]) as _occurrence
         FROM ? as data
         GROUP BY data.ucode, data.[${config.valueField}]
         ORDER BY data.ucode DESC,
                  _occurrence
                  ${config.aggregationType === "MAJORITY" ? "DESC" : "ASC"}`,
        [data],
      );
    } else {
      const aggExpr =
        config.aggregationType === COUNT_UNIQUE
          ? `COUNT(DISTINCT data.[${config.valueField}])`
          : `${config.aggregationType}(data.[${config.valueField}])`;
      data = alasqlQuery(
        `SELECT MAX(data.ucode)        as _ucode,
                MAX(data.concept_uuid) as _concept_uuid,
                ${aggExpr}             as _value,
                MAX(data.date)         as _date,
                MAX(data.admin_level)  as _admin_level
         FROM ? as data
         GROUP BY data.ucode
         ORDER BY data.ucode DESC`,
        [data],
      );
    }
  }
  return data.map((result, idx) => {
    const geometry_code =
      geoField === "concept_uuid" ? result._concept_uuid : result._ucode;
    return {
      id: idx,
      admin_level: result._admin_level,
      geometry_code,
      concept_uuid: result._concept_uuid,
      ucode: result._ucode,
      date: result._date,
      value: result._value,
    };
  });
};

/**
 * Return cleaned data
 */
export const getCleanedSdmxData = (
  data: Record<string, any>[],
  selectedGlobalTime: any,
  adminLevels: any,
): { rows: any[] } => {
  if (!data?.length) return { rows: [] };
  const timeConditions: string[] = [];
  if (selectedGlobalTime?.min) {
    timeConditions.push(`data.[date] >= "${selectedGlobalTime.min}"`);
  }
  if (selectedGlobalTime?.max) {
    timeConditions.push(`data.[date] <= "${selectedGlobalTime.max}"`);
  }
  const whereClause = timeConditions.length
    ? `WHERE ${timeConditions.join(" AND ")}`
    : "";
  data = alasqlQuery(
    `SELECT *
     FROM ? as data ${whereClause}
     ORDER BY data.[date] ASC`,
    [data],
  );
  if (adminLevels !== null) {
    data = data.filter((row) =>
      ("" + adminLevels).split(",").includes("" + row.admin_level),
    );
  }
  return { rows: data };
};
