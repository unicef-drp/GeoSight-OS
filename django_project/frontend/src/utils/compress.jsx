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
 * __date__ = '07/11/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import lzString from "lz-string";

/**
 * Compress data
 * @param {object} data - Data to compress
 * @returns {string} compressed data as a string
 */
export const compressLZW = (data) => {
  if (typeof data === "object") {
    return lzString.compressToEncodedURIComponent(JSON.stringify(data));
  }

  return lzString.compressToEncodedURIComponent(data);
};

/**
 * Decompress strin
 * @param {string} compressed - Compressed string to decompress
 * @returns {string} decompressed string
 */
export const decompressLZW = (compressed, isJson = false) => {
  const decompressed = lzString.decompressFromEncodedURIComponent(compressed)
  try {
    return JSON.parse(decompressed);
  } catch (err) {
    if (isJson) {
      return null
    }
    return decompressed
  }
}