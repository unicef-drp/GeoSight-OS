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

import { FilterInputProps } from "./types.d";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  IS_NOT_NULL,
  IS_NULL,
  OPERATOR
} from "../../../utils/queryExtraction";
import {
  WhereInputValue
} from "../../SqlQueryGenerator/WhereQueryGenerator/WhereInput";
import CircularProgress from "@mui/material/CircularProgress";
import { RequestState } from "../../../types";

export interface FetchSourceDetail {
  id: string;
  sourceKey?: string;
  receiveData: (data: any) => void;
}

export const FetchSourceDetailIndicator = memo(
  ({ id, receiveData }: FetchSourceDetail) => {
    console.log('FetchSourceDetailIndicator')

    // @ts-ignore
    const { indicators } = useSelector(state => state.dashboard.data);

    useEffect(() => {
      console.log('--------')
      console.log(id)
      console.log(indicators)
      receiveData(indicators.find((row: any) => row.id == id))
    }, [indicators]);

    return null
  }
)
export const FetchSourceDataIndicator = memo(
  ({ id, sourceKey, receiveData }: FetchSourceDetail) => {
    console.log('FetchSourceDataIndicator')
    const prevFetchingRef = useRef<boolean>(true);
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
      const fetched = !!stateData?.fetched
      if (prevFetchingRef.current !== fetched) {
        receiveData(stateData)
      }
      prevFetchingRef.current = fetched;
    }, [stateData]);

    return null
  }
)
/** Filter group component */
export const FilterInputIndicator = memo(
  (
    {
      // For layout
      name,
      description,
      allowModify,

      // Filter definition
      field,
      operator,
      type,
      value,
    }: FilterInputProps) => {

    console.log('FilterInputIndicator ' + name)
    // Get the id and keyField
    const [id, keyField] = field.replace('indicator_', '').split('.');

    /** Check the source **/
    let sourceDataKey = ''
    if (field.includes('indicator_')) {
      sourceDataKey = 'indicatorsData'
    }

    /** The state of element **/
    const [currentValue, setCurrentValue] = useState(value)
    const [source, setSource] = useState(null);
    const [data, setData] = useState<RequestState>(null);

    // Receive source detail callbacks
    const receiveSource = useCallback((data: any) => {
      setSource(data)
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
    let dataType = source?.type
    if (sourceDataKey === 'indicatorsData') {
      dataType = keyField === 'value' ? source?.type : 'String'
    }
    let options: any[] = []
    if (data) {
      options = data.data.map((row: any) => row[keyField])
    }

    return <>
      {
        sourceDataKey ? <>
          <FetchSourceDetailIndicator
            id={id}
            receiveData={receiveSource}
          />
          <FetchSourceDataIndicator
            id={id}
            sourceKey={sourceDataKey}
            receiveData={receiveData}
          />
        </> : null
      }
      {
        data == null || !dataType ?
          <div className='Throbber'
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 flexDirection: 'column'
               }}
          >
            <CircularProgress size={36}/>
          </div> : <div>
            {keyField} {operatorName}
            {
              needsValue &&
              <div className='FilterInputWrapper'>
                {
                  needsValue &&
                  // @ts-ignore
                  <WhereInputValue
                    fieldType={dataType}
                    field={type}
                    operator={operator}
                    value={currentValue}
                    optionsData={options}
                  />
                }
              </div>
            }
            {
              description && <div
                className='FilterExpressionDescription'>{description}</div>
            }
          </div>
      }
    </>

  }
)