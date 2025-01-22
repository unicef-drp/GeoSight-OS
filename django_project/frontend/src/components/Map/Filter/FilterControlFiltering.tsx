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
 * __date__ = '16/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../store/dashboard";
import { dictDeepCopy } from "../../../utils/main";

import './style.scss';


/** TODO:
 *  We will remove this after filter can be handle by input
 *
 * @constructor
 */
// @ts-ignore
const FilterControlFiltering = () => {
  const {
    filters,
    indicatorLayers,
    referenceLayer,
    relatedTables
    // @ts-ignore
  } = useSelector(state => state.dashboard.data);
  // @ts-ignore
  const { referenceLayers } = useSelector(state => state.map)
  // @ts-ignore
  const referenceLayerData = useSelector(state => state.referenceLayerData)
  // @ts-ignore
  const indicatorsData = useSelector(state => state.indicatorsData)
  // @ts-ignore
  const relatedTableData = useSelector(state => state.relatedTableData)
  // @ts-ignore
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  // @ts-ignore
  const datasetGeometries = useSelector(state => state.datasetGeometries);
  // @ts-ignore
  const geometries = useSelector(state => state.datasetGeometries[referenceLayer.identifier]);
  // @ts-ignore
  const datasets = useSelector(state => state.globalState['datasets'])

  // @ts-ignore
  const dispatcher = useDispatch();
  const levels = referenceLayerData[referenceLayer.identifier]?.data?.dataset_levels

  // Set older filters
  const prevState = useRef();

  const filter = async (currentFilter: any) => {
    // @ts-ignore
    if (JSON.stringify(prevState.currentFilter) !== JSON.stringify(currentFilter)) {
      dispatcher(Actions.FiltersData.update(currentFilter));
      // @ts-ignore
      prevState.currentFilter = dictDeepCopy(currentFilter)
    }
  }

  // Apply the filters query
  useEffect(() => {
    if (referenceLayerData[referenceLayer.identifier]?.data &&
      referenceLayerData[referenceLayer.identifier].data.dataset_levels) {
      // @ts-ignore
      filter(filters)
    }
  }, [
    datasets, referenceLayers,
    filters, indicatorsData, relatedTableData, geometries, selectedAdminLevel
  ]);

  return null
};
export default FilterControlFiltering;