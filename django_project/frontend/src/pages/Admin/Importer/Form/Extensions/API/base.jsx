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
import Grid from "@mui/material/Grid";
import { updateDataWithSetState } from "../../utils";
import JsonSelector from "../../../../../../components/JsonSelector";

/**
 * Base Excel Form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 */
export const BaseApiForm = forwardRef(
  ({
     data, setData, files, setFiles, attributes, setAttributes
   }, ref
  ) => {
    const [open, setOpen] = useState(false)

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(data.api_url)
      }
    }));

    // Set default data
    useEffect(
      () => {
        updateDataWithSetState(data, setData, {
          'api_url': ''
        })
      }, []
    )

    return <Fragment>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <div className="BasicFormSection">
            <label className="form-label required" htmlFor="group">
              API Url of the data
            </label>
            <input
              type={'text'}
              placeholder={'API Url of the data'}
              value={data.api_url}
              onChange={evt => {
                data.api_url = evt.target.value
                setData({ ...data })
              }}
            />
          </div>
          <JsonSelector
            open={open} setOpen={setOpen}
            url={data.api_url}
            inputAttributes={[{
              name: 'keys_for_list',
              title: 'Key for the list features'
            }]}
            setInputAttributes={(attributes, features, fields) => {
              data.key_feature_list = attributes[0].value.replace('x.', '')
              setAttributes(fields)
              setOpen(false)
            }}/>
        </Grid>
        <Grid item xs={6}>
          <div className="BasicFormSection">
            <label className="form-label required" htmlFor="group">
              Key for the list features
            </label>
            <input
              type={'text'}
              placeholder={'Key for the list features'}
              disabled={!data.api_url}
              value={data.key_feature_list}
              onClick={() => {
                setOpen(true)
              }}
              onChange={evt => {
                data.key_feature_list = evt.target.value
                setData({ ...data })
              }}
            />
          </div>
        </Grid>
      </Grid>
    </Fragment>
  }
)