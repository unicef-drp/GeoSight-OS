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
import { isInOptions, optionsToList } from '../../../../../../utils/main'
import Match from '../../../../../../utils/Match'
import { updateDataWithSetState } from "../../utils";
import {
  IndicatorSettings
} from "../../../../Components/Input/IndicatorSettings";
import {
  SelectWithList
} from "../../../../../../components/Input/SelectWithList";

/**
 * Indicator Value Long Format.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 * @param {dict} ready .
 * @param {Function} setReady Set is ready.
 * @param {Array} indicatorList Indicator List.
 */
export const BaseLongExcelIndicatorValue = forwardRef(
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
    const indicatorRef = useRef(null);
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          data.key_administration_code && data.key_value
        ) && indicatorValueFormRef?.current?.isReady(data) && childRef?.current?.isReady(data) && indicatorRef?.current?.isReady(data)
      }
    }));

    const [attributes, setAttributes] = useState([])

    // Set default data
    useEffect(
      () => {
        if (attributes?.length) {
          const newData = JSON.parse(JSON.stringify(data))
          // For key_administration_code
          if (!isInOptions(attributes, newData.key_administration_code)) {
            newData.key_administration_code = Match.inList.geocode(optionsToList(attributes))
          }
          // For shortcoce
          if (!isInOptions(attributes, newData.key_indicator_shortcode)) {
            newData.key_indicator_shortcode = Match.inList.indicatorIdentifier(optionsToList(attributes))
          }
          // For value
          if (!isInOptions(attributes, newData.key_value)) {
            newData.key_value = findMostMatched(optionsToList(attributes), 'value').value
          }
          updateDataWithSetState(data, setData, newData)
        }
      }, [attributes]
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
          <label className="form-label required">Geo Code Column</label>
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
        <IndicatorSettings
          data={data}
          setData={setData}
          attributes={attributes}
          indicatorList={indicatorList}
          ref={indicatorRef}
        />
        <FormControl className="BasicFormSection">
          <label className="form-label required">Value Column</label>
          {
            !noAttributes ?
              <SelectWithList
                list={attributes}
                value={data.key_value}
                onChange={evt => {
                  data.key_value = evt.value
                  setData({ ...data })
                }}
              /> :
              <input
                type={"text"}
                value={data.key_value}
                onChange={evt => {
                  data.key_value = evt.target.value
                  setData({ ...data })
                }}
              />
          }
        </FormControl>
      </div>
    </Fragment>
  }
)