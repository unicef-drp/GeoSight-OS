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
 * __author__ = 'michaelbontyes@gmail.com'
 * __date__ = '13/06/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

/**
 * Format a number with commas
 * @param {number} n The number to format
 * @returns {string} Formatted number with commas
 */
export const numberWithCommas = (n) => {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Smart number formatting that converts large numbers to compact form
 * (e.g., 12345678 → 12.35M)
 * @param {number} value The number to format
 * @param {number} decimals Number of decimal places to show (default: 2)
 * @returns {string} Formatted number in compact form
 */
export const formatNumberSmart = (value, decimals = 2) => {
  if (value === null || value === undefined) return '';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue < 1000) {
    return numberWithCommas(value);
  }

  const units = ['', 'K', 'M', 'B', 'T'];
  const unit = Math.floor(Math.log10(absValue) / 3);
  const formatted = parseFloat((absValue / Math.pow(1000, unit)).toFixed(decimals));
  
  return `${sign}${formatted}${units[unit]}`;
};
