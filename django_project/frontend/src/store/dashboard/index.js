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

import { compose, legacy_createStore as createStore } from 'redux';
import rootReducer from './reducers';

// Reducers and Actions
import Basemaps from './reducers/basemap/actions'
import ContextLayers from './reducers/contextLayers/actions'
import Dashboard from './reducers/dashboard/actions'
import DatasetGeometries from './reducers/datasetGeometries/actions'
import Extent from './reducers/extent/actions'
import Filters from './reducers/filters/actions'
import FiltersData from './reducers/filtersData/actions'
import FilteredGeometries from './reducers/filteredGeometries/actions'
import GlobalState from './reducers/globalState/actions'
import IndicatorLayers from './reducers/indicatorLayers/actions'
import Indicators from './reducers/indicators/actions'
import IndicatorsData from './reducers/indicatorsData/actions'
import IndicatorsMetadata from './reducers/indicatorsMetadata/actions'
import IndicatorLayerMetadata from './reducers/indicatorLayerMetadata/actions'
import Map from './reducers/map/actions'
import MapMode from './reducers/mapMode/actions'
import ReferenceLayer from './reducers/referenceLayer/actions'
import ReferenceLayerData from './reducers/referenceLayerData/actions'
import RelatedTable from './reducers/relatedTable/actions'
import RelatedTableData from './reducers/relatedTableData/actions'
import SelectedAdminLevel from './reducers/selectedAdminLevel/actions'
import SelectedIndicatorLayer from './reducers/selectedIndicatorLayer/actions'
import SelectedIndicatorSecondLayer
  from './reducers/selectedIndicatorSecondLayer/actions'
import SelectedBookmark from './reducers/selectedBookmark/actions'
import SelectedGlobalTime from './reducers/selectedGlobalTime/actions'
import SelectedGlobalTimeConfig
  from './reducers/selectedGlobalTimeConfig/actions'
import SelectedRelatedTableLayer
  from './reducers/selectedRelatedTableLayer/actions'
import SelectedDynamicIndicatorLayer
  from './reducers/selectedDynamicIndicatorLayer/actions'
import Widgets from './reducers/widgets/actions'

const Actions = {
  Basemaps,
  ContextLayers,
  Dashboard,
  DatasetGeometries,
  Extent,
  Filters,
  FilteredGeometries,
  FiltersData,
  GlobalState,
  IndicatorLayers,
  Indicators,
  IndicatorsData,
  IndicatorsMetadata,
  IndicatorLayerMetadata,
  Map,
  MapMode,
  RelatedTable,
  RelatedTableData,
  ReferenceLayer,
  ReferenceLayerData,
  SelectedAdminLevel,
  SelectedIndicatorLayer,
  SelectedIndicatorSecondLayer,
  SelectedBookmark,
  SelectedGlobalTime,
  SelectedGlobalTimeConfig,
  SelectedDynamicIndicatorLayer,
  SelectedRelatedTableLayer,
  Widgets
}

export { Actions }

const initialState = {};
const enhancers = [];

// Dev Tools
if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(
  ...enhancers
);

export const store = createStore(rootReducer, initialState, composedEnhancers);