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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { combineReducers } from 'redux';

import mapReducer from './map'
import mapModeReducer from './mapMode'
import dashboardRequestReducer from './dashboard'
import datasetGeometriesReducer from './datasetGeometries'
import indicatorsDataReducer from "./indicatorsData";
import indicatorsMetadataReducer from "./indicatorsMetadata";
import indicatorLayerMetadataReducer from "./indicatorLayerMetadata";
import relatedTableDataReducer from "./relatedTableData";
import ReferenceLayerDataReducer from "./referenceLayerData";
import filtersDataReducer from "./filtersData";
import filteredGeometriesReducer from "./filteredGeometries";
import geometriesReducer from "./geometries";
import globalStateReducer from "./globalState";
import selectedIndicatorLayerReducer from "./selectedIndicatorLayer";
import selectedIndicatorSecondLayerReducer
  from "./selectedIndicatorSecondLayer";
import selectedAdminLevelReducer from "./selectedAdminLevel";
import selectedBookmarkReducer from "./selectedBookmark";
import selectedGlobalTimeReducer from "./selectedGlobalTime";
import selectedGlobalTimeConfigReducer from "./selectedGlobalTimeConfig";
import selectedRelatedTableLayerReducer from "./selectedRelatedTableLayer";
import selectedDynamicIndicatorLayerReducer
  from "./selectedDynamicIndicatorLayer";


export default combineReducers({
  // Just dashboard data without adding anything in there
  dashboard: dashboardRequestReducer,

  map: mapReducer,
  mapMode: mapModeReducer,
  datasetGeometries: datasetGeometriesReducer,
  indicatorsData: indicatorsDataReducer,
  indicatorsMetadata: indicatorsMetadataReducer,
  indicatorLayerMetadata: indicatorLayerMetadataReducer,
  referenceLayerData: ReferenceLayerDataReducer,
  relatedTableData: relatedTableDataReducer,
  filtersData: filtersDataReducer,
  filteredGeometries: filteredGeometriesReducer,
  geometries: geometriesReducer,
  globalState: globalStateReducer,
  selectedAdminLevel: selectedAdminLevelReducer,
  selectedIndicatorLayer: selectedIndicatorLayerReducer,
  selectedIndicatorSecondLayer: selectedIndicatorSecondLayerReducer,
  selectedBookmark: selectedBookmarkReducer,
  selectedGlobalTime: selectedGlobalTimeReducer,
  selectedGlobalTimeConfig: selectedGlobalTimeConfigReducer,
  selectedRelatedTableLayer: selectedRelatedTableLayerReducer,
  selectedDynamicIndicatorLayer: selectedDynamicIndicatorLayerReducer,
});
