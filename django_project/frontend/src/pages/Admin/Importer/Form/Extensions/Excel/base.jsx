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
  useImperativeHandle
} from 'react';
import ExcelInput from "../../../../Components/Input/ExcelInput";
import { updateDataWithSetState } from "../../utils";

/**
 * Base Excel Form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 * @param {dict} ready .
 * @param {Function} setReady Set is ready.
 * @param {Array} attributes Data attributes.
 * @param {Function} setAttributes Set data attribute.
 */
export const BaseExcelForm = forwardRef(
  ({
     data, setData, files, setFiles, attributes, setAttributes
   }, ref
  ) => {
    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          ![null, undefined].includes(data.row_number_for_header) &&
          data.sheet_name && files.file
        )
      }
    }));

    // Set default data
    useEffect(
      () => {
        updateDataWithSetState(data, setData, {
          'row_number_for_header': 1,
          'sheet_name': ''
        })
      }, []
    )

    // Set default data
    useEffect(
      () => {
        if (!data.row_number_for_header) {
          updateDataWithSetState(data, setData, {
            'row_number_for_header': 1
          })
        }
      }, [data]
    )

    return <Fragment>
      <ExcelInput
        inputSheet={data.sheet_name}
        setInputSheet={sheetName => {
          data.sheet_name = sheetName
          setData({ ...data })
        }}
        inputHeaderRowNumber={data.row_number_for_header}
        setInputHeaderRowNumber={rowNumber => {
          data.row_number_for_header = rowNumber
          setData({ ...data })
        }}
        setAttributes={attr => {
          setAttributes(attr)
        }}

        setFileChanged={file => {
          files['file'] = file
          setFiles({ ...files })
        }}
      />
    </Fragment>
  }
)
