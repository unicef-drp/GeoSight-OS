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

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  ReferenceLayerInput
} from "../../../../Components/Input/ReferenceLayerInput";
import {
  DateTimeSettings
} from "../../../../Components/Input/DateTimeSettings";

/**
 * Indicator Value Form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 * @param {Array} Attributes Data attributes.
 * @param {Boolean} valueOnly If the data just a value only.
 */
export const BaseIndicatorValue = forwardRef(
  ({
     data, setData, files, setFiles, attributes,
     valueOnly = false, children, ...props
   }, ref
  ) => {

    // Ready check
    const referenceLayerRef = useRef(null);
    const dateTimeSettingsRef = useRef(null);
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return referenceLayerRef?.current?.isReady(data) && dateTimeSettingsRef?.current?.isReady(data)
      }
    }));

    return <div className='BaseIndicatorAttribute'>
      <ReferenceLayerInput
        data={data} setData={setData}
        attributes={attributes}
        ref={referenceLayerRef}
        valueOnly={valueOnly}
        {...props}
      />
      <DateTimeSettings
        data={data} setData={setData}
        attributes={attributes}
        ref={dateTimeSettingsRef}
        valueOnly={valueOnly}
      />
      {children}
    </div>
  }
)