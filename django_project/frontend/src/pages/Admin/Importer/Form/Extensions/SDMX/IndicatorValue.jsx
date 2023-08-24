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
import {
  ReferenceLayerInput
} from "../../../../Components/Input/ReferenceLayerInput";
import {
  DateTimeSettings
} from "../../../../Components/Input/DateTimeSettings";
import { BaseSDMXForm } from "./base";
import {
  SelectWithList
} from "../../../../../../components/Input/SelectWithList";
import {
  IndicatorSettings
} from "../../../../Components/Input/IndicatorSettings";
import { updateDataWithSetState } from "../../utils";

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
export const SDMXIndicatorValue = forwardRef(
  ({
     data, setData, files, setFiles, indicatorList
   }, ref
  ) => {
    const [attributes, setAttributes] = useState([])

    // Ready check
    const referenceLayerRef = useRef(null);
    const dateTimeSettingsRef = useRef(null);
    const indicatorRef = useRef(null);
    const baseRef = useRef(null);
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(data.key_administration_code) && !!(data.key_value) && referenceLayerRef?.current?.isReady(data) && dateTimeSettingsRef?.current?.isReady(data) && indicatorRef?.current?.isReady(data) && baseRef?.current?.isReady(data)
      }
    }));

    // Set default data
    useEffect(
      () => {
        let newData = JSON.parse(JSON.stringify(data))
        if (newData.key_administration_code !== 'REF_AREA') {
          newData.key_administration_code = 'REF_AREA'
        }
        if (newData.date_time_data_field !== 'TIME_PERIOD') {
          newData.date_time_data_field = 'TIME_PERIOD'
        }
        if (newData.key_value !== 'OBS_VALUE') {
          newData.key_value = 'OBS_VALUE'
        }
        updateDataWithSetState(data, setData, newData)
      }, [data, attributes]
    )

    return <Fragment>
      <div className='BaseIndicatorAttribute'>
        <ReferenceLayerInput
          data={data} setData={setData}
          attributes={attributes}
          ref={referenceLayerRef}
        />
        <DateTimeSettings
          data={data} setData={setData}
          attributes={attributes}
          ref={dateTimeSettingsRef}
          drivenOnly={true}
        />
      </div>
      <div className='FormAttribute'>
        <BaseSDMXForm
          data={data}
          setData={setData}
          attributes={attributes}
          setAttributes={setAttributes}
          ref={baseRef}
        >
          {/* For other data */}
          <FormControl className="BasicFormSection">
            <label className="form-label required">Column Geograph Code</label>
            {
              <SelectWithList
                list={attributes}
                value={data.key_administration_code}
                onChange={evt => {
                  data.key_administration_code = evt.value
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
            <SelectWithList
              list={attributes}
              value={data.key_value}
              onChange={evt => {
                data.key_value = evt.value
                setData({ ...data })
              }}
            />
          </FormControl>
        </BaseSDMXForm>
      </div>
    </Fragment>
  }
)