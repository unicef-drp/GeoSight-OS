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
import axios from "axios";
import Grid from "@mui/material/Grid";
import {
  SelectWithList
} from "../../../../../../components/Input/SelectWithList";
import { updateDataWithSetState } from "../../utils";
import { SaveButton } from "../../../../../../components/Elements/Button";
import {
  Notification,
  NotificationStatus
} from "../../../../../../components/Notification";
import { arrayToOptions } from "../../../../../../utils/main";

/**
 * Base Excel Form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 */
export const BaseSharepointForm = forwardRef(
  ({
     data, setData, files, setFiles, attributes, setAttributes
   }, ref
  ) => {
    // Notification
    const notificationRef = useRef(null);
    const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
      notificationRef?.current?.notify(newMessage, newSeverity)
    }

    const [fileInfo, setFileInfo] = useState({});
    const [fetching, setFetching] = useState(false);

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
        data = updateDataWithSetState(data, setData, {
          'row_number_for_header': 1,
          'sheet_name': ''
        })

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

    const toDefault = () => {
      data.sheet_name = ''
      setFileInfo({})
      setData({ ...data })
      setAttributes([])
    }

    const toArray = (data) => {
      const array = [data.headers];
      if (data.example) {
        array.push(data.example)
      }
      return arrayToOptions(array)
    }

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
                    data.sharepoint_relative_path = ''
                    toDefault()
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className="BasicFormSection">
                <label className="form-label required" htmlFor="group">
                  Relative path of file
                </label>
                <input
                  type='text'
                  value={data.sharepoint_relative_path}
                  onChange={evt => {
                    data.sharepoint_relative_path = evt.target.value
                    toDefault()
                  }}/>
                <span className='form-helptext'>
                  Relative path of file from the config URL, e.g. "/teams/ICTD-GeoSight/DocumentLibrary1/TESTS/sample.xlsx".
                </span>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className="BasicFormSection">
                <label
                  className="form-label required" htmlFor="group"
                  style={{ color: 'white' }}>
                  Fetch
                </label>
                <SaveButton
                  variant="primary"
                  text="Fetch sharepoint file detail"
                  onClick={() => {
                    setFetching(true);
                    axios.post(
                      `/api/sharepoint/${data.sharepoint_config_id}/info`,
                      {
                        row_number_for_header: data.row_number_for_header,
                        relative_url: data.sharepoint_relative_path
                      },
                      {
                        headers: {
                          'X-CSRFToken': csrfmiddlewaretoken
                        }
                      }
                    ).then(response => {
                      setFetching(false);
                      if (Object.keys(response)) {
                        const _responseData = response.data
                        setFileInfo(_responseData)
                        data.sheet_name = Object.keys(_responseData)[0]
                        setData({ ...data })
                        setAttributes(toArray(_responseData[data.sheet_name]))
                      } else {
                        throw Error('File is empty')
                      }
                    }).catch(error => {
                      setFetching(false);
                      if (error?.response?.data) {
                        notify(error.response.data, NotificationStatus.ERROR)
                      } else {
                        notify(error.message, NotificationStatus.ERROR)
                      }
                    })
                  }}
                  disabled={!data.sharepoint_relative_path || !data.sharepoint_config_id || fetching}
                />
                <span className='form-helptext'>
                  Click to get the sheet name and header list.<br/>
                  Also click when change "Row number of the header".
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
            <SelectWithList
              list={Object.keys(fileInfo)}
              value={data.sheet_name}
              onChange={evt => {
                data.sheet_name = evt.value
                setData({ ...data })
                setAttributes(toArray(fileInfo[data.sheet_name]))
              }}/>
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className="BasicFormSection">
            <label className="form-label required" htmlFor="group">
              Row number of the header
            </label>
            <input
              type='number'
              value={data.row_number_for_header}
              min={1}
              onChange={evt => {
                data.row_number_for_header = evt.target.value
                setData({ ...data })
                setAttributes([])
              }}/>
          </div>
        </Grid>
      </Grid>
      <Notification ref={notificationRef}/>
    </Fragment>
  }
)