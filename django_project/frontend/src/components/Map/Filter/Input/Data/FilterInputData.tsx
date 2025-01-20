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

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FilterInputProps } from "../../types.d";
import {
  IS_NOT_NULL,
  IS_NULL,
  OPERATOR
} from "../../../../../utils/queryExtraction";
import { RequestState } from "../../../../../types";
import {
  WhereInputValue
} from "../../../../SqlQueryGenerator/WhereQueryGenerator/WhereInput";

export interface FetchSourceDetail {
  id: string;
  sourceKey?: string;
  receiveData: (data: any) => void;
}

export interface FetchGeometryData {
  field: string;
  receiveData: (data: any) => void;
}

export const FetchSourceDetailIndicator = memo(
  ({ id, receiveData }: FetchSourceDetail) => {

    // @ts-ignore
    const { indicators } = useSelector(state => state.dashboard.data);

    useEffect(() => {
      receiveData(indicators.find((row: any) => row.id + '' == id + ''))
    }, [indicators]);

    return null
  }
)

export const FetchSourceDetailRelatedTable = memo(
  ({ id, receiveData }: FetchSourceDetail) => {

    // @ts-ignore
    const { relatedTables } = useSelector(state => state.dashboard.data);
    useEffect(() => {
      receiveData(relatedTables.find((row: any) => row.id + '' == id + ''))
    }, [relatedTables]);

    return null
  }
)

export const FetchSourceData = memo(
  ({ id, sourceKey, receiveData }: FetchSourceDetail) => {
    const prevFetchedRef = useRef<string>('');
    const stateData = useSelector((state) => {
      // @ts-ignore
      if (state[sourceKey] && state[sourceKey][id]) {
        // @ts-ignore
        return state[sourceKey][id];
      }
      return null;
    });

    /** Fetch the data **/
    useEffect(() => {
      const fetched = id + sourceKey + !!stateData?.fetched;
      if (prevFetchedRef.current !== fetched) {
        receiveData(stateData)
      }
      prevFetchedRef.current = fetched;
    }, [id, sourceKey, stateData]);

    return null
  }
)

export const FetchSourceGeometryData = memo(
  ({ field, receiveData }: FetchGeometryData) => {
    const key = 'datasetGeometries'
    // @ts-ignore
    const identifier = useSelector(state => state.dashboard?.data.referenceLayer?.identifier);
    let usedIdentifier = identifier
    const [keyData, level, fieldIdentifier] = field.split('.')[0].split('_')
    if (fieldIdentifier) {
      usedIdentifier = fieldIdentifier
    }

    // @ts-ignore
    const referenceLayerData = useSelector((state) => {
      let data = null
      // @ts-ignore
      if (state[key] && state[key][usedIdentifier] && state[key][usedIdentifier][level]) {
        const data = []
        // @ts-ignore
        for (const [_, value] of Object.entries(state[key][usedIdentifier][level])) {
          data.push(value)
        }
        return { data: data }
      }
      return data;
    })

    /** Fetch the data **/
    useEffect(() => {
      receiveData(referenceLayerData)
    }, [referenceLayerData]);

    return null
  }
)

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

      isAdmin
    }: FilterInputProps
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
    if (field.includes('indicator_')) {
      sourceDataKey = 'indicatorsData'
    }
    if (field.includes('related_table_')) {
      sourceDataKey = 'relatedTableData'
    }
    if (field.includes('layer_')) {
      sourceDataKey = 'indicatorsData'
    }
    if (field.includes('geometry_')) {
      sourceDataKey = 'Geometry'
    }

    /** The state of element **/
    const [source, setSource] = useState(null);
    const [data, setData] = useState<RequestState>(null);

    // Receive source detail callbacks
    const receiveSource = useCallback((_data: any) => {
      let update = true
      if (update && JSON.stringify(_data) == JSON.stringify(data)) {
        update = false
      }
      if (update) {
        setSource(_data)
      }
    }, []);

    // Receive data
    const receiveData = useCallback((data: any) => {
      if (data) {
        setData(data)
      } else {
        setData(null)
      }
    }, []);

    const needsValue = ![IS_NULL, IS_NOT_NULL].includes(operator)
    // @ts-ignore
    const operatorName = OPERATOR[operator]

    // Check the datatype
    let dataType = keyField === 'value' ? 'Number' : 'String';
    if (sourceDataKey === 'indicatorsData') {
      dataType = keyField === 'value' ? source?.type : 'String'
    }
    if (sourceDataKey === 'relatedTableData') {
      if (source?.fields_definition) {
        const _field = source.fields_definition.find(
          (_field: any) => _field.name == keyField
        )
        if (_field) {
          dataType = _field.type
        }
      }
    }

    let options: any[] = ['loading']
    if (data) {
      options = Array.from(new Set(data.data.map((row: any) => row[keyField])))
    }
    if (data == null || !dataType) {
      options = ['loading']
    }
    return <>
      {
        sourceDataKey ? <>
          {
            sourceDataKey === 'indicatorsData' ?
              <FetchSourceDetailIndicator
                id={id}
                receiveData={receiveSource}
              /> : sourceDataKey === 'relatedTableData' ?
                <FetchSourceDetailRelatedTable
                  id={id}
                  receiveData={receiveSource}
                /> : null
          }
          {
            sourceDataKey !== 'Geometry' ?
              <FetchSourceData
                id={id}
                sourceKey={sourceDataKey}
                receiveData={receiveData}
              /> : <FetchSourceGeometryData
                field={field}
                receiveData={receiveData}
              />
          }
        </> : null
      }
      <div>
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