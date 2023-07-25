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
  useState
} from 'react';
import axios from "axios";
import Grid from "@mui/material/Grid";
import {
  SelectWithList
} from "../../../../../../components/Input/SelectWithList";

/**
 * Base Excel Form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 */
export const BaseSharepointForm = forwardRef(
  ({
     data, setData, files, setFiles
   }, ref
  ) => {
    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          data.sharepoint_config_id && data.sharepoint_relative_path &&
          ![null, undefined].includes(data.row_number_for_header) &&
          data.sheet_name
        )
      }
    }));


    // Fetch sharepoint config
    const [sharepoints, setSharepoints] = useState([])
    useEffect(
      () => {
        axios.get(urls.api.sharepointListAPI)
          .then(response => {
            const sharepointsData = response.data.map(row => {
              row.value = row.id
              row.label = row.full_name
              return row
            })
            if (sharepointsData.length) {
              data.sharepoint_config_id = sharepointsData[0].id
              setData({ ...data })
            }
            setSharepoints([...sharepointsData])
          })
      }, []
    )

    return <Fragment>
      {
        sharepoints.length ?
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <div className="BasicFormSection">
                <label className="form-label required" htmlFor="group">
                  Sharepoint Config
                </label>
                <SelectWithList
                  placeholder={'Select sharepoint'}
                  list={sharepoints}
                  value={data.sharepoint_config_id}
                  required={true}
                  onChange={evt => {
                    data.sharepoint_config_id = evt.value
                    setData({ ...data })
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="BasicFormSection">
                <label className="form-label required" htmlFor="group">
                  Relative path of file
                </label>
                <input
                  type='text'
                  value={data.sharepoint_relative_path}
                  onChange={evt => {
                    data.sharepoint_relative_path = evt.target.value
                    setData({ ...data })
                  }}/>
                <span className='form-helptext'>
                  Relative path of file from the config url.
                </span>
              </div>
            </Grid>
          </Grid> : null
      }
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <div className="BasicFormSection">
            <label className="form-label required" htmlFor="group">
              Sheet name
            </label>
            <input
              type='text'
              value={data.sheet_name}
              onChange={evt => {
                data.sheet_name = evt.target.value
                setData({ ...data })
              }}/>
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className="BasicFormSection">
            <label className="form-label required" htmlFor="group">
              Row number: header
            </label>
            <input
              type='number'
              value={data.row_number_for_header}
              min={1}
              onChange={evt => {
                data.row_number_for_header = evt.target.value
                setData({ ...data })
              }}/>
          </div>
        </Grid>
      </Grid>
    </Fragment>
  }
)