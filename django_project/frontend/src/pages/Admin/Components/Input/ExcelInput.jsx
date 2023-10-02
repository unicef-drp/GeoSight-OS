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

import React, { Fragment, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import CircularProgress from "@mui/material/CircularProgress";
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import { arrayToOptions } from "../../../../utils/main";

/**
 * Excel input specified
 * @param {dict} inputSheet Selected sheet name .
 * @param {Function} setInputSheet Set new selected sheet.
 * @param {int} inputHeaderNumber Header number to be checked.
 * @param {Function} inputHeaderRowNumber Set header number.
 * @param {Function} setAttributes Set header number.
 * @param {Function} setFileChanged Set file changed.
 */
export default function ExcelInput(
  {
    inputSheet, setInputSheet,
    inputHeaderRowNumber, setInputHeaderRowNumber,
    setAttributes,
    setFileChanged
  }
) {
  const [reading, setReading] = useState(false);
  const [state, setState] = useState({
    sheets: [],
    workbook: null
  });
  const { sheets, workbook } = state

  /** Update row attributes **/
  const updateAttributes = () => {
    if (workbook) {
      const array = XLSX.utils.sheet_to_json(workbook.Sheets[inputSheet], {
        header: 1,
        defval: '',
        blankrows: true,
        raw: false
      });

      // Change the options
      setAttributes(arrayToOptions(array.slice(inputHeaderRowNumber - 1)))
    }
  }

  // Save reference layer and level when changed
  useEffect(
    () => {
      updateAttributes()
    }, [workbook, inputSheet, inputHeaderRowNumber]
  )


  // When file changed
  const fileChanged = (evt) => {
    // Read excel
    setReading(true)
    setTimeout(function () {
      const file = evt.target.files[0];
      setFileChanged(file)
      if (!file) {
        setState({
          sheets: [],
          workbook: null
        })
        setInputSheet(null)
        setAttributes([])
        setReading(false)
      } else {
        const fr = new FileReader();
        fr.onload = function () {
          const workbook = XLSX.read(fr.result, {
            type: 'binary'
          });

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
          setReading(false)
        }
        fr.readAsBinaryString(file)
      }
    }, 200)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <div className="BasicFormSection">
          <label className="form-label required" htmlFor="group">
            Excel file
            {
              reading ?
                <Fragment>&nbsp;<CircularProgress size={10}/></Fragment> : null
            }
          </label>
          <input
            type="file" accept='.xlsx,.xls'
            onChange={fileChanged}/>
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
            Row number of the header
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