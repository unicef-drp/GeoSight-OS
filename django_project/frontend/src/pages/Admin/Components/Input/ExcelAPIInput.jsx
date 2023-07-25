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

import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import axios from "axios";
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import { IconTextField } from "../../../../components/Elements/Input";
import CircularProgress from "@mui/material/CircularProgress";

let excelApiInput = null;
/**
 * Excel input specified
 * @param {string} inputLabel String for input label .
 * @param {string} inputUrl Input url .
 * @param {Function} setInputUrl Set Input url.
 * @param {string} inputSheet Selected sheet name .
 * @param {Function} setInputSheet Set new selected sheet.
 * @param {int} inputHeaderRowNumber Header number to be checked.
 * @param {Function} setInputHeaderRowNumber Set header number.
 * @param {Function} setAttributes Set header number.
 */
export default function ExcelAPIInput(
  {
    inputLabel = 'Excel Url API',
    inputUrl, setInputUrl,
    inputSheet, setInputSheet,
    inputHeaderRowNumber, setInputHeaderRowNumber,
    setAttributes
  }
) {
  const [url, setUrl] = useState('');
  const [state, setState] = useState({
    sheets: [],
    workbook: null
  });
  const { sheets, workbook } = state
  const [request, setRequest] = useState({
    error: '',
    loading: false,
  });
  const { error, loading } = request

  /** Update row attributes **/
  const updateAttributes = () => {
    if (workbook) {
      const array = XLSX.utils.sheet_to_json(workbook.Sheets[inputSheet], {
        header: 1,
        defval: '',
        blankrows: true
      });

      // Change the options
      const headers = array[inputHeaderRowNumber - 1] ? array[inputHeaderRowNumber - 1] : []
      setAttributes(headers)
    }
  }

  const readUrl = async (url) => {
    if (!url || url !== excelApiInput) {
      return
    }
    const options = { url, responseType: "arraybuffer" }
    setRequest({ loading: true, error: '' })
    let axiosResponse = await axios(options);
    try {
      const workbook = XLSX.read(axiosResponse.data);

      const sheetsOptions = []
      workbook.Workbook.Sheets.map(sheet => {
        if (sheet.Hidden === 0) {
          sheetsOptions.push(sheet.name)
        }
      })

      // Set all states
      setState({
        sheets: sheetsOptions,
        workbook: workbook
      })
      setInputSheet(sheetsOptions[0])
      setRequest({ loading: false, error: '' })
    } catch (error) {
      setRequest({ loading: false, error: 'The request is not excel' })

    }
  }

  // Save reference layer and level when changed
  useEffect(
    () => {
      updateAttributes()
    }, [workbook, inputSheet, inputHeaderRowNumber]
  )

  // Url changed
  useEffect(
    () => {
      setUrl(inputUrl)
      excelApiInput = inputUrl
      readUrl(inputUrl).then(r => null)
    }, [inputUrl]
  )

  // When file changed
  const urlChanged = (url) => {
    setUrl(url)
    excelApiInput = url
    setTimeout(function () {
      if (url === excelApiInput) {
        setInputUrl(url)
      }
    }, 500);
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <div className="BasicFormSection">
          <label className="form-label required" htmlFor="group">
            {inputLabel}
          </label>
          <IconTextField
            iconEnd={(loading ? <CircularProgress/> : null)}
            value={url}
            onChange={evt => urlChanged(evt.target.value)}
          />
          {
            error ? <div className='error'>{error}</div> : null
          }
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className="BasicFormSection">
          <label className="form-label required" htmlFor="group">
            Sheet name
          </label>
          <SelectWithList
            list={sheets}
            value={inputSheet}
            onChange={evt => setInputSheet(evt.value)}/>
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className="BasicFormSection">
          <label className="form-label required" htmlFor="group">
            Row number: header
          </label>
          <input
            type='number'
            min={1}
            value={inputHeaderRowNumber}
            onChange={evt => setInputHeaderRowNumber(parseInt(evt.target.value))}/>
        </div>
      </Grid>
    </Grid>
  )
}