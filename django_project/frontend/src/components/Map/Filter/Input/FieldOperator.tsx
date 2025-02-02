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

import React, { memo } from "react";
import { SelectPlaceholder } from "../../../Input";
import { useSelector } from "react-redux";
import {
  IDENTIFIER,
  NUMBER_OPERATORS,
  STRING_OPERATORS
} from "../../../../utils/queryExtraction";
import {
  indicatorLayerId,
  indicatorLayersLikeIndicator
} from "../../../../utils/indicatorLayer";


export interface Props {
  field: string;
  setField: (data: any) => void;
  operator: string;
  setOperator: (data: any) => void;
}

export const FilterFieldOperatorInput = memo(
  ({ field, setField, operator, setOperator }: Props) => {
    // @ts-ignore
    const identifier = useSelector(state => state.dashboard?.data.referenceLayer?.identifier);
    // @ts-ignore
    const referenceLayerData = useSelector(state => state.referenceLayerData)
    const {
      indicators,
      indicatorLayers,
      relatedTables
      // @ts-ignore
    } = useSelector(state => state.dashboard?.data)


    let fields: any = []

    // reference layer data
    // FIELDS FROM DATASET
    if (referenceLayerData) {
      for (const [_identifier, dataset] of Object.entries(referenceLayerData)) {
        const {
          dataset_levels: levels,
          name
          // @ts-ignore
        } = dataset?.data
        if (!levels) {
          return;
        }
        levels.map((level: any) => {
          ['ucode', 'name'].map(key => {
            const id = _identifier === identifier ? `geometry_${level.level}.${key}` : `geometry_${level.level}_${identifier.replaceAll('-', '_')}.${key}`
            fields.push({
              id: id,
              name: `${key}`,
              group: `${name} - ${level.level_name}`,
              type: 'String'
            })
          })
        })
      }
    }
    // FIELDS FROM INDICATORS
    indicators.map((indicator: any) => {
      let keys = ['label', 'value', 'concept_uuid']
      keys.forEach(key => {
        const id = `${IDENTIFIER}${indicator.id}.${key}`
        fields.push({
          id: id,
          name: key === 'concept_uuid' ? 'concept uuid' : `${key}`,
          group: 'Indicator - ' + indicator.name,
          type: key === 'value' ? indicator?.type : 'String'
        })
      })
    })


    // FIELDS FROM DYNAMIC INDICATOR
    indicatorLayersLikeIndicator(indicatorLayers).map((indicatorLayer: any) => {
      const layerId = indicatorLayerId(indicatorLayer)
      let keys = ['label', 'value']
      keys.forEach(key => {
        const id = `${layerId}.${key}`
        if (!['label', 'value', 'concept_uuid'].includes(key)) {
          return
        }
        fields.push({
          id: id,
          name: key === 'concept_uuid' ? 'concept uuid' : `${key}`,
          group: 'Indicator Layer - ' + indicatorLayer.name,
          type: key === 'value' ? 'Number' : 'String'
        })
      })
    })


    // FIELDS FROM RELATED TABLES
    relatedTables.map((obj: any) => {
      obj.fields_definition.forEach((field: any) => {
        const key = field.name
        const _type = field.type
        const id = `related_table_${obj.id}.${key}`
        fields.push({
          id: id,
          name: `${key}`,
          group: 'Related Table - ' + obj.name,
          type: key === 'value' ? obj?.type : _type
        })
      })
    })

    const selectedField = fields.find((_field: any) => _field.id == field)
    const OPERATOR = ['string', 'text'].includes(selectedField?.type?.toLowerCase()) ? STRING_OPERATORS : NUMBER_OPERATORS
    return <>
      <SelectPlaceholder
        className='FilterEditModalQueryField'
        placeholder='Pick the field'
        list={fields}
        initValue={field}
        onChangeFn={(value: string) => {
          setField(value)
        }}/>
      <SelectPlaceholder
        className='FilterEditModalQueryMethod'
        placeholder='Pick an operation'
        list={
          Object.keys(OPERATOR).map((key, idx) => {
            // @ts-ignore
            return { id: key, name: OPERATOR[key] }
          })
        }
        initValue={operator}
        onChangeFn={(value: any) => {
          setOperator(value)
        }}/>
    </>
  }
)