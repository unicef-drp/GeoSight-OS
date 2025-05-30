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
 * __date__ = '26/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { AGGREGATION_TYPES } from "../../utils/analysisData";
import { Feature } from "geojson";
import maplibregl from "maplibre-gl";
import { ContextLayer } from "../../types/ContextLayer";

export const SELECTION_MODE = {
  SELECT_ADMIN: "SELECT_ADMIN",
  MANUAL: "MANUAL",
} as const;

export const DRAW_MODE = {
  POINT: "POINT",
  LINE: "LINE",
  POLYGON: "POLYGON",
} as const;

export interface ZonalAnalysisConfiguration {
  selectionMode: keyof typeof SELECTION_MODE;
  drawMode: keyof typeof DRAW_MODE;
  buffer: number;
}

export interface ZonalAnalysisLayerConfiguration {
  id: number;
  aggregation: keyof typeof AGGREGATION_TYPES;
  aggregatedField: string;
}

export interface ZonalAnalysisDashboardConfiguration {
  selectionModes: string[];
  layersConfiguration: ZonalAnalysisLayerConfiguration[];
}

export interface FetchingZonalAnalysisResultProps {
  contextLayer: ContextLayer,
  features: Array<Feature>,
  analysisLayer?: ZonalAnalysisLayerConfiguration,
}

export interface FetchingFunctionProp {
  contextLayer: ContextLayer,
  features: Array<Feature>,
  setData: (values: object[], error: string) => void,
  config?: ZonalAnalysisConfiguration,
  analysisLayer?: ZonalAnalysisLayerConfiguration,
  map?: maplibregl.Map
}