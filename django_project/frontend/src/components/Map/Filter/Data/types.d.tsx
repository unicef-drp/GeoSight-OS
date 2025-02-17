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
 * __date__ = '13/02/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { WHERE_OPERATOR } from "../types.d";

export interface FetchSourceDetail {
  id: string;
  sourceKey?: string;
  onChange: (data: any) => void;
}

export interface FetchGeometryData {
  field: string;
  onChange: (data: any) => void;
}

export interface FetchOptionsData {
  // TODO:
  //  We don't need data after all options already using API
  id: string;
  source?: any;
  data?: any[];
  keyField?: string;
  operator?: typeof WHERE_OPERATOR[keyof typeof WHERE_OPERATOR];
  onChange: (data: any) => void;
}

export const SourceDataKey = {
  INDICATORS_DATA: 'indicatorsData',
  RELATED_TABLE_DATA: 'relatedTableData',
  GEOMETRY: 'Geometry',
}
export const SourceDataType = {
  INDICATOR: 'Indicator',
  INDICATOR_LAYER: 'Indicator Layer',
  RELATED_TABLE: 'Related Table',
  GEOMETRY: 'Geometry',
}