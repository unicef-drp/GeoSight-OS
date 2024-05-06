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

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toUcode } from "../../../../utils/georepo";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { Actions } from "../../../../store/dashboard";
import { fetchingData } from "../../../../Requests";
import {
  referenceLayerIndicatorLayer
} from "../../../../utils/indicatorLayer";

/**
 * Related table layer handler
 */
export default function RelatedTableLayer({ relatedTableLayer }) {
  const dispatch = useDispatch();
  const {
    relatedTables,
    referenceLayer: referenceLayerDashboard,
    indicatorLayers
  } = useSelector(state => state.dashboard.data)
  const referenceLayer = referenceLayerIndicatorLayer(referenceLayerDashboard, relatedTableLayer)
  const relatedTableDataState = useSelector(state => state.relatedTableData)
  const geometries = useSelector(state => state.datasetGeometries[referenceLayer.identifier]);

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
    indicatorLayers.map(indicatorLayer => {
      const relatedTableLayer = indicatorLayer.related_tables[0]
      if (!relatedTableLayer) {
        return;
      }
      const relatedTable = relatedTables.find(rt => rt.id === relatedTableLayer.id)
      if (!relatedTable) {
        return
      }
      const id = indicatorLayer.id
      const params = {
        geography_code_field_name: relatedTable.geography_code_field_name,
        geography_code_type: relatedTable.geography_code_type,
      }
      if (referenceLayer) {
        params.reference_layer_uuid = referenceLayer.identifier
      }
      if (indicatorLayer.config.date_field) {
        params.date_field = indicatorLayer.config.date_field
      }
      if (indicatorLayer.config.date_format) {
        params.date_format = indicatorLayer.config.date_format
      }
      fetchingData(
        '/api/related-table/' + relatedTable.id + '/dates', params, {}, function (response, error) {
          if (!error) {
            dispatch(Actions.IndicatorLayerMetadata.update(id, {
              dates: response,
              count: 0
            }))
          } else {
            dispatch(Actions.IndicatorLayerMetadata.update(id, {
              dates: error.toString(),
              count: 0
            }))
          }
        }
      )
    })
  }, [relatedTables, indicatorLayers, referenceLayer])
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