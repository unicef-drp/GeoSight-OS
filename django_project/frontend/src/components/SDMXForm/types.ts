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

export interface Option {
  label: string;
  value: string;
}

export interface DataflowOption extends Option {
  dataflowAgency: string;
  dsdId: string | null;
}

export interface LoadingState {
  agency: boolean;
  dataflow: boolean;
  dataflowVersion: boolean;
  dimensions: boolean;
  dsd: boolean;
}

export interface ErrorState {
  agency: string | null;
  dataflow: string | null;
  dataflowVersion: string | null;
  dimensions: string | null;
  dsd: string | null;
}

export type DimensionOptions = Record<string, Option[]>;
export type DimensionSelections = Record<string, string[]>;