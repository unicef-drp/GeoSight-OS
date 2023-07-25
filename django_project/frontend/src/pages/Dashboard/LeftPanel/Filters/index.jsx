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

/* ==========================================================================
   Filters SELECTOR
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import FilterControl from "./Control";
import { allDataIsReady, filteredGeoms } from "../../../../utils/indicators";
import { Actions } from "../../../../store/dashboard";
import {
  IDENTIFIER,
  INIT_DATA,
  queryData
} from "../../../../utils/queryExtraction";
import { dictDeepCopy } from "../../../../utils/main";
import { fetchingData } from "../../../../Requests";
import {
  indicatorLayerId,
  indicatorLayersLikeIndicator
} from "../../../../utils/indicatorLayer";

import './style.scss';


/**
 * Filter section.
 */
function FilterSection() {
  const {
    filters,
    indicators,
    indicatorLayers,
    referenceLayer,
    relatedTables,
    filtersAllowModify
  } = useSelector(state => state.dashboard.data);
  const ableToModify = filtersAllowModify || editMode;
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const referenceLayerData = useSelector(state => state.referenceLayerData)
  const indicatorsData = useSelector(state => state.indicatorsData)
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  const geometries = useSelector(state => state.geometries);
  const dispatcher = useDispatch();

  const [relatedTableData, setRelatedTableData] = useState({})
  const levels = referenceLayerData[referenceLayer.identifier]?.data?.dataset_levels

  // Set older filters
  const prevState = useRef();
  /** Filter data **/
  const filter = async (currentFilter) => {
    if (!levels) {
      return;
    }
    if (!allDataIsReady(indicatorsData)) {
      return
    }
    const level = levels.find(level => level.level === selectedAdminLevel.level)
    if (!level || !geometries[level.level]) {
      return;
    }
    const config = JSON.stringify({
      filter: currentFilter,
      time: selectedGlobalTime
    })
    const reporting_level = level.level;
    if (prevState.config !== config || prevState.level !== selectedAdminLevel.level) {
      // Doing the filter if it is different filter
      // PREPARE DATA LIST
      let dataList = [];
      const data = []
      // Geometry data
      const codes = []
      for (const [key, geomData] of Object.entries(geometries[level.level])) {
        const geom = JSON.parse(JSON.stringify(geomData))
        geom.geometry_code = geom.code
        data.push(geom)
        codes.push(geom.geometry_code)
      }
      dataList.push({
        id: `geometry_${level.level}`,
        reporting_level: level.level,
        data: data
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
        if (indicator.data) {
          const indicatorCodes = indicator.data.map(data => data.concept_uuid)
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
      relatedTables.map(relatedTable => {
        const objData = relatedTableData[relatedTable.id]
        if (objData) {
          const data = dictDeepCopy(objData)
          data.id = `related_table_${relatedTable.id}`
          data.reporting_level = reporting_level
          dataList.push(data)
          const codes = geometries[reporting_level] ? Object.keys(geometries[reporting_level]) : []
          if (data.data) {
            // TODO :
            //  We need to update if the related table can receive other code
            // We assign geometry code as the related table geography code field name
            data.data.map(obj => {
              obj.geometry_code = obj[relatedTable.geography_code_field_name]
            })
            const indicatorCodes = data.data.map(data => data.concept_uuid)
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
        dispatcher(
          Actions.FilteredGeometries.update(filteredGeometries)
        )
      }
      dispatcher(
        Actions.FiltersData.update(currentFilter)
      );
      prevState.config = config
      prevState.level = selectedAdminLevel.level
    }
  }

  // Apply the filters query
  useEffect(() => {
    if (referenceLayerData[referenceLayer.identifier]?.data &&
      referenceLayerData[referenceLayer.identifier].data.dataset_levels) {
      filter(filters)
    }
  }, [filters, indicatorsData, relatedTableData, geometries, selectedAdminLevel]);

  // FETCH RELATED TABLE DATA
  useEffect(() => {
    relatedTables.map(relatedTableConfig => {
      const params = {}
      if (referenceLayer.identifier) {
        params['reference_layer_uuid'] = referenceLayer.identifier
      }
      if (relatedTableConfig.geography_code_field_name) {
        params['geography_code_field_name'] = relatedTableConfig.geography_code_field_name
      }
      if (relatedTableConfig.geography_code_type) {
        params['geography_code_type'] = relatedTableConfig.geography_code_type
      }
      const url = relatedTableConfig.url.replace('data', 'values')
      fetchingData(
        url, params, {}, function (response, error) {
          let rows = response
          if (relatedTableConfig.query) {
            try {
              rows = queryData(rows, relatedTableConfig.query)
            } catch (err) {
              error = err.toString()
            }
          }
          relatedTableData[relatedTableConfig.id] = {
            data: rows
          }
          setRelatedTableData({ ...relatedTableData })
        }
      )
    })
  }, [relatedTables])

  // FIELDS FROM GEOMETRY
  let fields = []
  if (levels) {
    levels.map(level => {
      ['ucode', 'name'].map(key => {
        const id = `geometry_${level.level}.${key}`
        let data = ['loading']
        if (geometries[level.level]) {
          data = [...new Set(
            Object.keys(geometries[level.level]).map(geom => {
              return geometries[level.level][geom][key]
            })
          )]
        }
        fields.push({
          id: id,
          name: `${key}`,
          group: `Admin - ${level.level_name}`,
          data: data,
          level: level.level,
          type: 'String'
        })
      })
    })
  }

  // FIELDS FROM INDICATORS
  indicators.map(indicator => {
    const indicatorData = indicatorsData[indicator.id]
    let keys = ['label', 'value']
    if (indicatorData?.fetched && indicatorData?.data) {
      indicatorData?.data.map(row => {
        keys = [...new Set(keys.concat(Object.keys(row)))]
      })
    }
    keys.forEach(key => {
      const id = `${IDENTIFIER}${indicator.id}.${key}`
      if (!['label', 'value', 'concept_uuid'].includes(key)) {
        return
      }
      let data = ['loading']
      if (indicatorData?.fetched && indicatorData?.data) {
        data = [...new Set(
          indicatorData?.data.map(data => {
            return data[key]
          }).filter(data => {
            return data
          }))
        ]
      }
      fields.push({
        id: id,
        name: `${key}`,
        group: 'Indicator - ' + indicator.name,
        data: data,
        type: key === 'value' ? indicator?.type : 'String'
      })
    })
  })

  // FIELDS FROM DYNAMIC INDICATOR
  indicatorLayersLikeIndicator(indicatorLayers).map(indicatorLayer => {
    const layerId = indicatorLayerId(indicatorLayer)
    const indicatorData = indicatorsData[layerId]
    let keys = ['label', 'value']
    if (indicatorData?.fetched && indicatorData?.data) {
      indicatorData?.data.map(row => {
        keys = [...new Set(keys.concat(Object.keys(row)))]
      })
    }
    keys.forEach(key => {
      const id = `${layerId}.${key}`
      if (!['label', 'value', 'concept_uuid'].includes(key)) {
        return
      }
      let data = ['loading']
      if (indicatorData?.fetched && indicatorData?.data) {
        data = [...new Set(
          indicatorData?.data.map(data => {
            return data[key]
          }).filter(data => {
            return data
          }))
        ]
      }
      fields.push({
        id: id,
        name: `${key}`,
        group: 'Indicator Layer - ' + indicatorLayer.name,
        data: data,
        type: key === 'value' ? 'Number' : 'String'
      })
    })
  })

  // FIELDS FROM RELATED TABLES
  relatedTables.map(obj => {
    const objData = relatedTableData[obj.id]
    let keys = obj.selected_related_fields ? obj.selected_related_fields : obj.related_fields
    keys.forEach(key => {
      const id = `related_table_${obj.id}.${key}`
      let data = ['loading']
      if (objData) {
        data = [...new Set(
          objData?.data?.map(data => {
            return data[key]
          }).filter(data => {
            return data
          }))
        ]
      }
      fields.push({
        id: id,
        name: `${key}`,
        group: 'Related Table - ' + obj.name,
        data: data,
        type: key === 'value' ? obj?.type : 'String'
      })
    })
  })

  return <Fragment>
    <div className='FilterControl'>
      <div className='FilterControlInfo'>
        Filter changes based on the admin level shows on the map.
      </div>
      <FilterControl
        filtersData={
          (filters && Object.keys(filters).length > 0) ? filters : INIT_DATA.GROUP()
        }
        fields={fields}
        filter={filter}
        ableToModify={ableToModify}
      />
    </div>
  </Fragment>
}

/**
 * Filters Accordion.
 */
export default function FiltersAccordion() {
  const { filters } = useSelector(state => state.dashboard.data);

  return (
    <Accordion
      className='FilterAccordion'
      expanded={true}
    >
      <AccordionDetails>
        {
          filters !== undefined ? <FilterSection/>
            : <div>Loading</div>
        }
      </AccordionDetails>
    </Accordion>
  )
}