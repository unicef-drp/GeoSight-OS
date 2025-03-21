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
 * __date__ = '28/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   RELATED TABLE LAYER
   ========================================================================== */

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toUcode } from "../../../../utils/georepo";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { Actions } from "../../../../store/dashboard";
import {
  referenceLayerIndicatorLayer
} from "../../../../utils/indicatorLayer";
import { getCountryGeomIds } from "../../../../utils/Dataset";
import { RelatedTable } from "../../../../class/RelatedTable";

/**
 * Related table layer handler
 */
export default function RelatedTableLayer({ relatedTableLayer }) {
  const prevState = useRef();
  const dispatch = useDispatch();
  const {
    relatedTables,
    referenceLayer: referenceLayerDashboard,
    indicatorLayers
  } = useSelector(state => state.dashboard.data)
  const relatedTableDataState = useSelector(state => state.relatedTableData)

  // Reference layer data
  const referenceLayer = referenceLayerIndicatorLayer(referenceLayerDashboard, relatedTableLayer)
  const referenceLayerData = useSelector(state => state.referenceLayerData[referenceLayer?.identifier]);

  const geometries = useSelector(state => state.datasetGeometries[referenceLayer.identifier]);

  // Related table attributes
  const relatedTable = relatedTableLayer.related_tables[0]
  const relatedTableData = relatedTableDataState[relatedTableLayer.related_tables[0].id]?.data
  const relatedTableConfig = relatedTables.find(rt => rt.id === relatedTable.id)

  /**
   * Change the reporting level
   */
  useEffect(() => {
    if (relatedTableData && relatedTableData[0] && relatedTableConfig) {
      try {
        const ucode = toUcode(relatedTableData[0][relatedTableConfig.geography_code_field_name])
        let dataLevel = null
        Object.keys(geometries).map(level => {
          if (Object.keys(geometries[level]).includes(ucode)) {
            dataLevel = level
          }
        })
      } catch (err) {
      }
    }
  }, [geometries, relatedTableData]);


  /**
   * Update related table dates
   */
  useEffect(() => {
    (
      async () => {

        // Skip if no data
        // To get the countries
        if (!referenceLayerData?.data?.identifier) {
          return;
        }
        const countryGeomIds = getCountryGeomIds(referenceLayerData.data);
        const indicatorLayer = relatedTableLayer;
        const id = indicatorLayer.id
        const params = {
          geography_code_field_name: relatedTableConfig.geography_code_field_name,
          geography_code_type: relatedTableConfig.geography_code_type,
          country_geom_ids: countryGeomIds
        }
        if (indicatorLayer.config.date_field) {
          params.date_field = indicatorLayer.config.date_field
        }
        if (indicatorLayer.config.date_format) {
          params.date_format = indicatorLayer.config.date_format
        }
        params.version = relatedTableConfig.version
        if (
          JSON.stringify(params) !== JSON.stringify(prevState.params)
        ) {
          prevState.params = params
          try {
            const relatedTableObj = new RelatedTable(relatedTableConfig)
            const response = await relatedTableObj.dates(params)
            dispatch(Actions.IndicatorLayerMetadata.update(id, {
              dates: response,
              count: 0
            }))
          } catch (error) {
            dispatch(Actions.IndicatorLayerMetadata.update(id, {
              dates: error.toString(),
              count: 0
            }))
            dispatch(
              Actions.IndicatorLayers.updateJson(
                id, { error: error.toString() }
              )
            )
          }
        }
      }
    )()
  }, [relatedTable, referenceLayerData, indicatorLayers])
  return null
}

/**
 * Related table filter
 */
export function RelatedTableLayerFilter({ relatedTableLayer }) {
  const dispatch = useDispatch();
  const selectedRelatedTableLayer = useSelector(state => state.selectedRelatedTableLayer)

  return <div className='LayerIcon LayerConfig'>
    {
      selectedRelatedTableLayer === relatedTableLayer.id ?
        <FilterAltIcon fontSize={"small"} onClick={() => {
          dispatch(Actions.SelectedRelatedTableLayer.change(null))
        }}/> :
        <FilterAltOffIcon fontSize={"small"} onClick={() => {
          dispatch(Actions.SelectedRelatedTableLayer.change(relatedTableLayer.id))
        }}/>
    }
  </div>
}