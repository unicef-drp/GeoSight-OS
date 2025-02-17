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

import React, { memo, useCallback, useEffect, useState } from "react";
import { FilterExpressionProps } from "../types.d";
import {
  IS_NOT_NULL,
  IS_NULL,
  OPERATOR,
  returnDataToExpression
} from "../../../../utils/queryExtraction";
import {
  WhereInputValue
} from "../../../SqlQueryGenerator/WhereQueryGenerator/WhereInput";
import alasql from "alasql";
import {
  FetchSourceDetailIndicator,
  FetchSourceDetailIndicatorLayer,
  FetchSourceDetailRelatedTable
} from "../Data/LayerDetail";
import { FetchSourceData, FetchSourceGeometryData } from "../Data/SourceData";
import { SourceDataKey, SourceDataType } from "../Data/types.d";
import {
  FetchFromDataOptions,
  FetchIndicatorOptions
} from "../Data/DataOptions";

/** Props for input data **/
export interface Props extends FilterExpressionProps {
  active?: boolean;
  onFiltered?: (data: string[]) => void;
}

/** Filter group component */
export const FilterInputData = memo(
  (
    {
      // For layout
      allowModify,

      // Filter definition
      field,
      operator,
      value,
      setValue,

      // Is active or isAdmin
      active,
      isAdmin,

      // On Filtered
      onFiltered
    }: Props
  ) => {
    const isEnabled = isAdmin || allowModify;

    // Get the id and keyField
    const [id, keyField] = field.replace(
      'indicator_', ''
    ).replace(
      'related_table_', ''
    ).split('.');

    /** Check the source **/
    let sourceDataKey = ''
    let sourceDataType = ''
    if (field.includes('indicator_')) {
      sourceDataKey = SourceDataKey.INDICATORS_DATA
      sourceDataType = SourceDataType.INDICATOR
    } else if (field.includes('layer_')) {
      sourceDataKey = SourceDataKey.INDICATORS_DATA
      sourceDataType = SourceDataType.INDICATOR_LAYER
    } else if (field.includes('related_table_')) {
      sourceDataKey = SourceDataKey.RELATED_TABLE_DATA
      sourceDataType = SourceDataType.RELATED_TABLE
    } else if (field.includes('geometry_')) {
      sourceDataKey = SourceDataKey.GEOMETRY
      sourceDataType = SourceDataType.GEOMETRY
    }

    /** The state of element **/
    const [source, setSource] = useState(null);
    const [data, setData] = useState<any[]>(null);
    const [options, setOptions] = useState<any[]>(null);
    const [result, setResult] = useState<string[]>(null);

    /** Update all necessary variables **/
    const needsValue = ![IS_NULL, IS_NOT_NULL].includes(operator)
    // @ts-ignore
    const operatorName = OPERATOR[operator]

    /** Check the datatype **/
    let dataType = keyField === 'value' ? 'Number' : 'String';
    if (sourceDataKey === SourceDataKey.INDICATORS_DATA) {
      dataType = keyField === 'value' ? source?.type : 'String'
    }
    if (sourceDataKey === SourceDataKey.RELATED_TABLE_DATA) {
      if (source?.fields_definition) {
        const _field = source.fields_definition.find(
          (_field: any) => _field.name == keyField
        )
        if (_field) {
          dataType = _field.type
        }
      }
    }

    /** Receive source detail callbacks **/
    const receiveSource = useCallback((_data: any) => {
      let update = true
      if (update && JSON.stringify(_data) == JSON.stringify(data)) {
        update = false
      }
      if (update) {
        setSource(_data)
      }
    }, []);

    /** Receive data **/
    const receiveData = useCallback((data: any[]) => {
      if (data) {
        let usedData = data
        switch (sourceDataKey) {
          case SourceDataKey.INDICATORS_DATA:
            usedData = data.map(
              row => {
                return {
                  admin_level: row.admin_level,
                  concept_uuid: row.concept_uuid,
                  geometry_code: row.geometry_code,
                  label: row.label,
                  value: row.value
                }
              }
            )
            break;
        }
        setData(usedData)
      } else {
        setData(null)
      }
    }, []);

    /** Receive options callbacks **/
    const receiveOptions = useCallback((_options: any) => {
      let update = true
      if (update && JSON.stringify(_options) == JSON.stringify(options)) {
        update = false
      }
      if (update) {
        setOptions(_options)
      }
    }, []);

    /** Run filter calculation **/
    const updateFilter = () => {
      if (active) {
        const queryWhere = returnDataToExpression(`data.${keyField}`, operator, value)
        const query = `
            SELECT ARRAY(concept_uuid) AS concept_uuids
            FROM ? data
            WHERE ${queryWhere}
            ORDER BY concept_uuid
        `
        const _result = alasql(query, [data])
        setResult(_result[0].concept_uuids ? _result[0].concept_uuids : [])
      }
    }

    /** When field, operator, value changed, make geometries null **/
    useEffect(() => {
        setResult(null)
        updateFilter()
      },
      [data, field, operator, value]
    );

    /** When active and has data, calculate filter **/
    useEffect(() => {
        if (onFiltered) {
          if (active && result === null) {
            if (data) {
              updateFilter()
            }
          } else if (result) {
            onFiltered(result)
          }
        }
      },
      [active, data]
    );

    /** When data, field, operator, value changed **/
    useEffect(() => {
        if (onFiltered) {
          // if result changed
          onFiltered(result)
        }
      },
      [result]
    );

    return <>
      {
        sourceDataKey ? <>

          {/* GETTING THE LAYER DETAIL*/}
          {
            sourceDataType === SourceDataType.INDICATOR ?
              <FetchSourceDetailIndicator
                id={id}
                onChange={receiveSource}
              /> : sourceDataType === SourceDataType.INDICATOR_LAYER ?
                <FetchSourceDetailIndicatorLayer
                  id={id}
                  onChange={receiveSource}
                /> : sourceDataType === SourceDataType.RELATED_TABLE ?
                  <FetchSourceDetailRelatedTable
                    id={id}
                    onChange={receiveSource}
                  /> : null
          }

          {/* GET THE DATA*/}
          {
            sourceDataKey !== SourceDataKey.GEOMETRY ?
              <FetchSourceData
                id={id}
                sourceKey={sourceDataKey}
                onChange={receiveData}
              /> : <FetchSourceGeometryData
                field={field}
                onChange={receiveData}
              />
          }

          {/* GET OPTIONS DATA*/}
          {
            sourceDataType === SourceDataType.INDICATOR
            && keyField === 'value' ?
              <FetchIndicatorOptions
                id={id}
                onChange={receiveOptions}
              /> : <FetchFromDataOptions
                id={id}
                data={data}
                operator={operator}
                keyField={keyField}
                onChange={receiveOptions}
              />
          }
        </> : null
      }
      <div className='FilterInputWrapperWithIndicator'>
        <div className='FilterInputWrapperIndicator'>
          {keyField} {operatorName}
        </div>
        {
          needsValue &&
          <div className='FilterInputWrapper'>
            {
              needsValue &&
              // @ts-ignore
              <WhereInputValue
                fieldType={dataType}
                operator={operator}
                value={value}
                setValue={(value: any) => {
                  setValue(value)
                }}
                optionsData={options}
                disabled={!isEnabled}
              />
            }
          </div>
        }
      </div>
    </>
  }
)