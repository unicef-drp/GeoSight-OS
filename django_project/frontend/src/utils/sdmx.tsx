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

export const fetchSdmx = async (url: string): Promise<any[][]> => {
  const urls = url.split("?");
  const isLocalhost = /^https?:\/\/localhost(:\d+)?/i.test(urls[0]);
  const cleanPath = isLocalhost
    ? urls[0].replace(/\/(%2E%2E|\.\.)/gi, "")
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
            const rows = (result.data as any[]).filter(
              (row) => Object.values(row).some((v) => v !== "")
            );
            if (!rows.length) {
              resolve([]);
              return;
            }
            const headers = Object.keys(rows[0]);
            const array: any[][] = [headers];
            rows.forEach((row: any, idx: number) => {
              row.id = idx;
              array.push(headers.map((header) => row[header]));
            });
            resolve(array);
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
