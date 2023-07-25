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
} from 'react';

import { BaseExcelForm } from "./base";
import { BaseWideExcelRelatedTable } from '../Base/WideExcelRelatedTable'
import '../style.scss';

/**
 * Related Table Excel Wide Format specific inputs.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 * @param {dict} ready .
 * @param {Function} setReady Set is ready.
 * @param {Array} indicatorList Indicator List.
 */
export const WideExcelRelatedTable = forwardRef(
  ({
     data, setData, files, setFiles, indicatorList
   }, ref
  ) => {
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
        <BaseExcelForm/>
      </BaseWideExcelRelatedTable>
    </Fragment>
  }
)