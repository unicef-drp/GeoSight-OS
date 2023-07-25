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
  useState,
} from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  RelatedTableInputSelector
} from '../../../../ModalSelector/InputSelector'

import '../style.scss';

/**
 * Related Table Excel Wide Format specific inputs.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 * @param {Array} indicatorList Indicator List.
 */
export const BaseWideExcelRelatedTable = forwardRef(
  ({
     data, setData, files, setFiles, indicatorList, children
   }, ref
  ) => {

    // Get default data from parameters
    let defaultRelatedTable = null
    if (data?.related_table_id) {
      defaultRelatedTable = {
        id: parseInt(data.rt_id),
        name: data.related_table_name
      }
    }
    const [attributes, setAttributes] = useState([])
    const [isReplace, setIsReplace] = useState(defaultRelatedTable ? true : false)
    const [selectedRelatedTable, setSelectedRelatedTable] = useState(defaultRelatedTable);

    // Ready check
    const childRef = useRef(null);
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          !(isReplace && !selectedRelatedTable)
        ) && childRef?.current?.isReady(data)
      }
    }));

    useEffect(
      () => {
        if (!isReplace) {
          data.related_table_uuid = null
          setSelectedRelatedTable(null)
        } else {
          setData({ ...data })
        }
      }, [isReplace]
    )

    useEffect(
      () => {
        if (isReplace && selectedRelatedTable) {
          if (selectedRelatedTable.unique_id) {
            data.related_table_uuid = selectedRelatedTable.unique_id
          }
          data.related_table_name = selectedRelatedTable.name
          setData({ ...data })
        }
      }, [selectedRelatedTable]
    )

    return <Fragment>
      <div className='FormAttribute'>
        <div className="BasicFormSection">
          <label className="form-label required" htmlFor="group">
            Related table name
          </label>
          <input
            type='text'
            value={data.related_table_name}
            onChange={evt => {
              data.related_table_name = evt.target.value
              setData({ ...data })
            }}/>
        </div>

        <div className="BasicFormSection">
          <FormControl className="BasicFormSection">
            <RadioGroup
              name="import_type"
              value={isReplace}
              onChange={evt => {
                setIsReplace(evt.target.value === 'true')
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={2}>
                  <FormControlLabel
                    value={false} control={<Radio/>}
                    label={'Create new table'}/>
                </Grid>
                <Grid item xs={2}>
                  <FormControlLabel
                    value={true} control={<Radio/>}
                    label={'Update existing table'}/>
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
        </div>
        {
          isReplace ?
            <div className="BasicFormSection RelatedTableForm">
              <label className="form-label required" htmlFor="group">
                Related table to be replaced
              </label>
              <RelatedTableInputSelector
                data={selectedRelatedTable ? [selectedRelatedTable] : []}
                setData={selectedRT => {
                  setSelectedRelatedTable(selectedRT[0])
                }}
                isMultiple={false}
              />
            </div> : ""
        }
      </div>

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
    </Fragment>
  }
)