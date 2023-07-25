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

import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { FormControl } from "@mui/material";

import { BaseIndicatorValue } from "./base";
import { updateDataWithSetState } from "../../utils";
import {
  SelectWithList
} from "../../../../../../components/Input/SelectWithList";
import Match from '../../../../../../utils/Match'
import { isInArray } from "../../../../../../utils/main";
import IndicatorMapping, {
  indicatorMappingDefault
} from "../../../../Components/Input/IndicatorMapping";

/**
 * Indicator Value Wide Format.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 * @param {Array} indicatorList Indicator List.
 */
export const BaseWideExcelIndicatorValue = forwardRef(
  ({
     data,
     setData,
     files,
     setFiles,
     indicatorList,
     noAttributes = false,
     children
   }, ref
  ) => {

    // Ready check
    const indicatorValueFormRef = useRef(null);
    const childRef = useRef(null);
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          data.key_administration_code
        ) && indicatorValueFormRef?.current?.isReady(data) && childRef?.current?.isReady(data)
      }
    }));

    const [attributes, setAttributes] = useState([])

    // Set default data
    useEffect(
      () => {
        if (attributes?.length) {
          let newData = JSON.parse(JSON.stringify(data))
          // For key_administration_code
          if (!isInArray(attributes, newData.key_administration_code)) {
            newData.key_administration_code = Match.inList.geocode(attributes)
          }
          newData = Object.assign({}, newData, indicatorMappingDefault(data, attributes, indicatorList))
          updateDataWithSetState(data, setData, newData)
        }
      }, [attributes, indicatorList]
    )
    return <Fragment>
      <BaseIndicatorValue
        data={data} setData={setData}
        files={files} setFiles={setFiles}
        attributes={attributes}
        ref={indicatorValueFormRef}
      />
      <div className='FormAttribute'>
        {
          React.cloneElement(
            children, {
              data: data, setData: setData,
              files: files, setFiles: setFiles,
              attributes: attributes,
              setAttributes: setAttributes,
              ref: childRef
            }
          )
        }

        {/* For other data */}
        <FormControl className="BasicFormSection">
          <label className="form-label required">Column Geo Code</label>
          {
            !noAttributes ?
              <SelectWithList
                list={attributes}
                value={data.key_administration_code}
                onChange={evt => {
                  data.key_administration_code = evt.value
                  setData({ ...data })
                }}
              /> :
              <input
                type={"text"}
                value={data.key_administration_code}
                onChange={evt => {
                  data.key_administration_code = evt.target.value
                  setData({ ...data })
                }}
              />
          }
        </FormControl>

        <IndicatorMapping
          config={data}
          setConfig={config => {
            setData({ ...config })
          }}
          attributes={attributes}
          indicatorList={indicatorList}
        />
      </div>
    </Fragment>
  }
)