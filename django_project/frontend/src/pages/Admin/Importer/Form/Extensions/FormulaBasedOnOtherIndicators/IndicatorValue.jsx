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
 * __date__ = '05/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, {
  forwardRef,
  Fragment,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { FormulaBasedForm } from "./base";

// Other inputs
import { BaseIndicatorValue } from "../Base/base";
import {
  IndicatorSettings
} from "../../../../Components/Input/IndicatorSettings";

/**
 * Base Excel Form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 */
export const FormulaBasedIndicatorValue = forwardRef(
  ({
     data, setData, files, setFiles, indicatorList
   }, ref
  ) => {
    const baseRef = useRef(null);
    const indicatorRef = useRef(null);
    const indicatorValueFormRef = useRef(null);
    const [attributes, setAttributes] = useState(['time'])

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return baseRef?.current?.isReady(data) && indicatorValueFormRef?.current?.isReady(data) && indicatorRef?.current?.isReady(data)
      }
    }));

    return <Fragment>
      <BaseIndicatorValue
        data={data} setData={setData}
        files={files} setFiles={setFiles}
        attributes={attributes}
        ref={indicatorValueFormRef}
        noGeoCode={true}
      />
      <div className='FormAttribute'>
        <IndicatorSettings
          data={data}
          setData={setData}
          attributes={attributes}
          indicatorList={indicatorList}
          ref={indicatorRef}
          valueOnly={true}
        />
        <FormulaBasedForm
          data={data}
          setData={setData}
          attributes={attributes}
          setAttributes={setAttributes}
          ref={baseRef}
        />
      </div>
    </Fragment>
  }
)