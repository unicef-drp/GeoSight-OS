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
import { returnWhere } from "../../../utils/queryExtraction";
import { Actions } from "../../../store/dashboard";
import { allDataIsReady, filteredGeoms } from "../../../utils/indicators";
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
    const where = returnWhere(currentFilter)
    if (!levels) {
      return;
    }

    const usedData = []
    for (const [key, value] of Object.entries(indicatorsData)) {
      const id = `indicator_${key}`
      if (where?.includes(id)) {
        usedData.push(value)
      }
    }
    for (const [key, value] of Object.entries(relatedTableData)) {
      const id = `related_table_${key}`
      if (where?.includes(id)) {
        usedData.push(value)
      }
    }
    if (where && !allDataIsReady(usedData)) {
      return
    }
    // @ts-ignore
    const level = levels.find(level => level.level === selectedAdminLevel.level)
    if (!level) {
      return
    }
    const indicatorLayerConfig = {}
    indicatorLayers.map((layer: any) => {
      // @ts-ignore
      indicatorLayerConfig[layer.id] = layer.config
    })
    const reporting_level = level.level;
    // Doing the filter if it is different filter
    // PREPARE DATA LIST
    let dataList = [];

    // ---------------------------------------
    // Geometry data
    // ---------------------------------------
    const codes: any[] = []
    const data: { concept_uuid: any; ucode: any; name: any; }[] = []
    // @ts-ignore
    datasets.map(identifier => {
      const geometries = datasetGeometries[identifier]
      const levels = referenceLayerData[identifier]?.data?.dataset_levels
      if (!levels) {
        return
      }
      // @ts-ignore
      levels.map(level => {
        if (geometries) {
          const geoms = geometries[level.level]
          if (geoms) {
            for (const [key, geomData] of Object.entries(geoms)) {
              // @ts-ignore
              codes.push(geomData.code)
              // @ts-ignore
              if (where && where.includes('geometry_layer.') && geomData.members) {
                // @ts-ignore
                geomData.members.map((member: any) => {
                  data.push({
                    // @ts-ignore
                    concept_uuid: geomData.concept_uuid,
                    ucode: member.ucode,
                    name: member.name,
                  })
                })
              } else {
                data.push({
                  // @ts-ignore
                  concept_uuid: geomData.concept_uuid,
                  // @ts-ignore
                  ucode: geomData.ucode,
                  // @ts-ignore
                  name: geomData.name,
                })
              }
            }
          }
        }
      })
      levels.map((level: any) => {
        dataList.push({
          id: identifier === referenceLayer?.identifier ? `geometry_layer` : `geometry_layer.${identifier}`,
          reporting_level: level.level,
          data: data
        })
      })
    })

    // ------------------------------------------------
    // Indicator data
    // ------------------------------------------------
    for (const [key, indicatorDataRow] of Object.entries(indicatorsData)) {
      const indicator = dictDeepCopy(indicatorDataRow)
      if (!isNaN(indicator.id)) {
        indicator.id = `indicator_${indicator.id}`
      }
      indicator.reporting_level = reporting_level
      dataList.push(indicator)
      if (indicator.data && Array.isArray(indicator.data)) {
        const indicatorCodes = indicator.data.map((data: any) => data.concept_uuid)
        const missingCodes = codes.filter(code => !indicatorCodes.includes(code))
        missingCodes.map(code => {
          indicator.data.push({
            concept_uuid: code,
            indicator_id: indicator.id
          })
        })
      }
    }

    // ------------------------------------------------
    // Related table data
    // ------------------------------------------------
    relatedTables.map((relatedTable: any) => {
      const objData = relatedTableData[relatedTable.id]
      if (objData) {
        const data = dictDeepCopy(objData)
        data.id = `related_table_${relatedTable.id}`
        data.reporting_level = reporting_level
        dataList.push(data)
        const codes = geometries && geometries[reporting_level] ? Object.keys(geometries[reporting_level]) : []
        if (data.data) {
          // TODO :
          //  We need to update if the related table can receive other code
          // We assign geometry code as the related table geography code field name
          data.data.map((obj: any) => {
            obj.geometry_code = obj[relatedTable.geography_code_field_name]
          })
          const indicatorCodes = data.data.map((data: any) => data.concept_uuid)
          const missingCodes = codes.filter(code => !indicatorCodes.includes(code))
          missingCodes.map(code => {
            data.data.push({
              concept_uuid: code,
              id: relatedTable.id
            })
          })
        }
      }
    })

    // DOING FILTERING
    const filteredGeometries = filteredGeoms(
      dataList, currentFilter, selectedAdminLevel.level
    )
    if (filteredGeometries) {
      const usedFilteredGeometry = Array.from(new Set(filteredGeometries))
      usedFilteredGeometry.sort()
      // @ts-ignore
      if (prevState.usedFilteredGeometry !== usedFilteredGeometry) {
        dispatcher(
          Actions.FilteredGeometries.update(usedFilteredGeometry)
        )
        // @ts-ignore
        prevState.usedFilteredGeometry = usedFilteredGeometry
      }
    }
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