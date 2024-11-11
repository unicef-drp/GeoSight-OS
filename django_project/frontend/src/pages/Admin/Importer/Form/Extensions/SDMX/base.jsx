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
import CircularProgress from "@mui/material/CircularProgress";
import { usePapaParse } from 'react-papaparse';

import { updateDataWithSetState } from "../../utils";
import { IconTextField } from "../../../../../../components/Elements/Input";
import { MainDataGrid } from "../../../../../../components/MainDataGrid";
import { arrayToOptions, delay } from "../../../../../../utils/main";

import DsdForm from './DsdComponents/DsdForm';

import './style.scss';


let sdmxApiInput = null;
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
export const BaseSDMXForm = forwardRef(
  ({
    data, setData, files, setFiles, attributes, setAttributes, children
  }, ref
  ) => {
    const { readString } = usePapaParse();
    const [url, setUrl] = useState('');
    const [request, setRequest] = useState({
      error: '',
      loading: false,
      requestData: null
    });
    const { error, loading, requestData } = request

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(data.url && requestData)
      }
    }));

    // Set default data
    useEffect(
      () => {
        updateDataWithSetState(data, setData, {
          'row_number_for_header': 1,
          'sheet_name': '',
          'url': '',
        })
        if (data.url) {
          urlChanged(data.url, true)
        }
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

    /** Read url **/
    const readUrl = async (url) => {
      if (!url || url !== sdmxApiInput) {
        return
      }
      setRequest({ loading: true, error: '', requestData: null })
      const options = { url }
      let axiosResponse = await axios(options);
      try {
        readString(axiosResponse.data, {
          header: true,
          worker: true,
          complete: async (result) => {
            if (result.errors.length <= 1) {
              const json = result.data.map((row, idx) => {
                row.id = idx
                return row
              })
              const headers = Object.keys(json[0])
              const array = [headers]
              json.slice(1).map(_ => {
                const row = []
                headers.map(header => {
                  row.push(_[header])
                })
                array.push(row)
              })

              if (!data.date_time_data_field) {
                data.date_time_data_field = 'TIME_PERIOD'
              }
              if (!data.key_value) {
                data.key_value = 'OBS_VALUE'
              }
              setRequest({ loading: false, error: '', requestData: json })
              setAttributes(arrayToOptions(array))
              await delay(500);
              setData({ ...data })
            } else {
              setRequest({
                loading: false,
                error: 'The request is not csv format',
                requestData: null
              })
            }
          },
        })
      } catch (error) {
        setRequest({
          loading: false,
          error: 'The request is not csv format',
          requestData: null
        })

      }
    }

    // When file changed
    const urlChanged = (newUrl, force = false) => {
      setUrl(newUrl)
      sdmxApiInput = newUrl
      setTimeout(function () {
        if (force || newUrl === sdmxApiInput) {
          const urls = newUrl.split('?')
          if (urls[1]) {
            newUrl = [urls[0], 'format=csv'].join('?')
          }
          sdmxApiInput = newUrl
          if (force || data.url !== newUrl) {
            data.url = newUrl
            setData({ ...data })
            readUrl(newUrl)
          }
          setUrl(newUrl)
        }
      }, 500);
    }
    return <Fragment>
      <DsdForm urlChanged={urlChanged} />
      {children}
      <div className='RetrievedData'>
        <label className="form-label" htmlFor="group">
          Retrieved data
        </label>
        <MainDataGrid
          style={{ height: "500px" }}
          rows={loading ? [] : requestData ? requestData : []}
          columns={requestData ? Object.keys(requestData[0]).map(key => {
            return {
              field: key,
              headerName: key,
              hide: (key === 'id' ? true : false),
              flex: 1,
              minWidth: 200
            }
          }) : []}
          pageSize={20}
          rowsPerPageOptions={[20]}
          disableSelectionOnClick
          loading={loading}
        />
      </div>
    </Fragment>
  }
)
