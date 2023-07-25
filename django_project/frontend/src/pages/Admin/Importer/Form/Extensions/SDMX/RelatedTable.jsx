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
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { BaseSDMXForm } from "./base";
import { BaseWideExcelRelatedTable } from '../Base/WideExcelRelatedTable'

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
export const SDMXRelatedTable = forwardRef(
  ({
     data, setData, files, setFiles, indicatorList
   }, ref
  ) => {
    const [attributes, setAttributes] = useState([])

    // Ready check
    const formRef = useRef(null);
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return formRef?.current?.isReady(data)
      }
    }))

    return <Fragment>
      <BaseWideExcelRelatedTable
        data={data} setData={setData}
        files={files} setFiles={setFiles}
        indicatorList={indicatorList}
        ref={formRef}
      >
        <BaseSDMXForm/>
      </BaseWideExcelRelatedTable>
    </Fragment>
  }
)