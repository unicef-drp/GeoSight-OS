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
   RELATED TABLE LAYER FILTER
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import $ from 'jquery';
import { useDispatch, useSelector } from "react-redux";

import { Actions } from '../../../../store/dashboard'
import { getRelatedTableFields } from "../../../../utils/relatedTable";
import { dictDeepCopy } from "../../../../utils/main";
import { WhereQueryGenerator } from "../../../../components/SqlQueryGenerator";

/**
 * Related table layer filter.
 */
export default function RelatedTableLayerMapConfig() {
  const dispatch = useDispatch();
  const { relatedTables } = useSelector(state => state.dashboard.data)
  const { indicatorLayers } = useSelector(state => state.dashboard.data)
  const selectedRelatedTableLayer = useSelector(state => state.selectedRelatedTableLayer)
  const relatedTableDataState = useSelector(state => state.relatedTableData)

  const [open, setOpen] = useState(false);

  /** When selected is changed **/
  useEffect(() => {
    setOpen(selectedRelatedTableLayer !== null)
  }, [selectedRelatedTableLayer]);

  let config;
  let relatedFields;
  let selectedRelatedTableLayerId = selectedRelatedTableLayer
  const relatedTableLayer = indicatorLayers.find(layer => layer.id === selectedRelatedTableLayerId)
  if (relatedTableLayer) {
    const relatedTable = relatedTableLayer.related_tables[0]
    const relatedTableData = relatedTableDataState[relatedTableLayer.related_tables[0].id]?.data
    const relatedTableConfig = relatedTables.find(rt => rt.id === relatedTable.id)

    relatedFields = getRelatedTableFields(relatedTableConfig, relatedTableData)
    config = dictDeepCopy(relatedTableLayer.config)
  }

  /** Update fields to required fields **/
  const updateFields = (fields) => {
    if (!fields) {
      return fields
    }
    return fields.map(field => {
      return {
        name: field.name,
        type: field.type ? field.type : 'text',
        value: field.name,
        options: field?.options
      }
    })
  }

  return <div
    className={'IndicatorLayerMiddleConfig ' + (open ? 'Open' : '')}>
    <Fragment>
      {
        relatedTableLayer && selectedRelatedTableLayer ?
          <Fragment>
            <div
              id='RelatedTableLayerConfigDuplication'
              className='WhereConfigurationWrapper Duplication'
              onScroll={(evt) => {
                $('#RelatedTableLayerMiddleConfigReal').scrollLeft($('#RelatedTableLayerConfigDuplication').scrollLeft())
              }}
            >
              <WhereQueryGenerator
                fields={updateFields(relatedFields)}
                whereQuery={config.where}
                setWhereQuery={(where) => {
                  const indicatorLayer = indicatorLayers.find(layer => layer.id === relatedTableLayer.id)
                  config.where = where
                  if (JSON.stringify(indicatorLayer.config) !== JSON.stringify(config)) {
                    indicatorLayer.config = config
                    dispatch(Actions.IndicatorLayers.update(indicatorLayer))
                  }
                }}
                disabledChanges={{
                  add: true,
                  remove: true,
                  sql: true,
                  and_or: true,
                  field: true,
                  operator: true,
                }}
                isCompact={true}
              />
            </div>
            <div
              id='RelatedTableLayerMiddleConfigReal'
              className='WhereConfigurationWrapper Real'
            >
              <WhereQueryGenerator
                fields={updateFields(relatedFields)}
                whereQuery={config.where}
                setWhereQuery={(where) => {
                  const indicatorLayer = indicatorLayers.find(layer => layer.id === relatedTableLayer.id)
                  config.where = where
                  if (JSON.stringify(indicatorLayer.config) !== JSON.stringify(config)) {
                    indicatorLayer.config = config
                    dispatch(Actions.IndicatorLayers.update(indicatorLayer))
                  }
                }}
                disabledChanges={{
                  add: true,
                  remove: true,
                  sql: true,
                  and_or: true,
                  field: true,
                  operator: true,
                }}
                isCompact={true}
              />
            </div>
          </Fragment> : null
      }
    </Fragment>
  </div>
}