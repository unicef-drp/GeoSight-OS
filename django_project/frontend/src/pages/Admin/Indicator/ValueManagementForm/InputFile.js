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

import React, { useState } from 'react';
import Modal, { ModalHeader } from "../../../../components/Modal";
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import { SaveButton } from "../../../../components/Elements/Button";

/**
 * InputFile component.
 */
export default function InputFile({ data, apply, open, setOpen }) {
  const rowNumber = 0
  const sheetName = "sheet_name";
  const admCodeName = "column_name_administration_code";
  const valueColumn = "column_name_value";
  const valueExtraColumn = "column_name_extras";
  const initAttributes = {}
  initAttributes[sheetName] = {
    value: 0,
    options: []
  }
  initAttributes[admCodeName] = {
    value: "",
    options: []
  }
  initAttributes[valueColumn] = {
    value: "",
    options: []
  }
  initAttributes[valueExtraColumn] = {
    value: [],
    options: []
  }
  const [workbook, setWorkbook] = useState(null);
  const [attributes, setAttributes] = useState(initAttributes);

  // When file changed
  const fileChanged = (evt) => {
    let workbook = null;
    const file = evt.target.files[0];
    const fr = new FileReader();
    fr.onload = function () {
      workbook = XLSX.read(fr.result, {
        type: 'binary'
      });

      const sheetsOptions = []
      workbook.Workbook.Sheets.map(sheet => {
        if (sheet.Hidden === 0) {
          sheetsOptions.push(sheet.name)
        }
      })
      const sheetAttribute = attributes[sheetName]
      sheetAttribute.options = sheetsOptions
      sheetAttribute.value = sheetsOptions[0]
      // Set all states
      setWorkbook(workbook)
      sheetChanged(attributes, workbook)
    }
    fr.readAsBinaryString(file)
  }


  // When Sheet changed
  const sheetChanged = (attributes, workbook) => {
    const value = attributes[sheetName].value
    if (workbook) {
      const array = XLSX.utils.sheet_to_json(workbook.Sheets[value], {
        header: 1,
        defval: '',
        blankrows: true
      });

      const admCode = attributes[admCodeName]
      const header = array[rowNumber] ? array[rowNumber] : []
      admCode.options = header
      admCode.value = findMostMatched(admCode.options, 'pcode').value

      attributes[valueColumn].options = header
      attributes[valueExtraColumn].options = header
    }
    setAttributes({ ...attributes })
  }

  const getData = (attributes, workbook) => {
    const value = attributes[sheetName].value
    const fileData = {}
    if (workbook) {
      const array = XLSX.utils.sheet_to_json(workbook.Sheets[value], {
        header: 1,
        defval: '',
        blankrows: true
      });

      const header = array[rowNumber] ? array[rowNumber] : []
      const admCodeIdx = header.indexOf(attributes[admCodeName].value)
      const valueIdx = header.indexOf(attributes[valueColumn].value)
      const extras = {}
      attributes[valueExtraColumn].value.map(extra => {
        extras[extra] = header.indexOf(extra)
      })

      array.map((row, idx) => {
        if (idx !== 0) {
          fileData[row[admCodeIdx]] = {
            value: row[valueIdx],
            extras: []
          }
          for (const [key, extraIdx] of Object.entries(extras)) {
            fileData[row[admCodeIdx]].extras.push({
              name: key,
              value: row[extraIdx]
            })
          }
        }
      })
    }
    return fileData
  }

  return <Modal
    className='ValueManagementForm'
    open={open}
    onClosed={() => {
      setOpen(false)
    }}
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
    }}>
      Using excel to fill all inputs
    </ModalHeader>
    <div>
      <form className="BasicForm">
        <div className="modal-body">
          <div>
            <b>
              1. Create a spreadsheet with at least 2 columns.
            </b>
            <div>
              You can add optional extra columns for extra
              values.
            </div>
          </div>

          <div>
            <table role="table">
              <thead>
              <tr>
                <th>Area Code</th>
                <th>Value</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>SO1234</td>
                <td>1</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div>
              <b>2. Select the spreadsheet.</b>
            </div>
            <div className="custom-file">
              <input type="file" className="custom-file-input"
                     id="file-data" accept=".xlsx,.xls" onChange={(evt) => {
                fileChanged(evt)
              }
              }/>
              <label className="form-helptext"
                     htmlFor="validatedCustomFile">
                Choose spreadsheet to refill automatically...
              </label>
            </div>
          </div>

          <div>
            <div>
              <b>3. Choose the sheet.</b>
            </div>
            <SelectWithList
              list={attributes[sheetName].options}
              value={attributes[sheetName].value}
              menuPlacement='top'
              onChange={evt => {
                attributes[sheetName].value = evt.value
                setAttributes({ ...attributes })
                sheetChanged(attributes, workbook)
              }}/>
          </div>

          <div>
            <div>
              <b>4. Choose area code column.</b>
            </div>
            <SelectWithList
              list={attributes[admCodeName].options}
              value={attributes[admCodeName].value}
              menuPlacement='top'
              onChange={evt => {
                attributes[admCodeName].value = evt.value
                setAttributes({ ...attributes })
              }}/>
          </div>

          <div>
            <div>
              <b>5. Choose value column.</b>
            </div>
            <SelectWithList
              list={attributes[valueColumn].options}
              value={attributes[valueColumn].value}
              menuPlacement='top'
              onChange={evt => {
                attributes[valueColumn].value = evt.value
                setAttributes({ ...attributes })
              }}/>
          </div>

          <div>
            <div>
              <b>6. Choose extra columns.</b>
            </div>
            <SelectWithList
              list={attributes[valueExtraColumn].options}
              value={attributes[valueExtraColumn].value}
              isMulti
              menuPlacement='top'
              className='Dynamic'
              onChange={evt => {
                attributes[valueExtraColumn].value = evt.map(row => {
                  return row.value
                })
                setAttributes({ ...attributes })
              }}/>
          </div>

          <div>
            <SaveButton
              variant="primary"
              text="Apply"
              disabled={
                !attributes[sheetName].value ||
                !attributes[admCodeName].value ||
                !attributes[valueColumn].value
              }
              onClick={() => {
                const fileData = getData(attributes, workbook)
                data.map(row => {
                  const found = fileData[row[0]]
                  row[1].value = ""
                  row[1].extras = []
                  if (found) {
                    row[1].value = found.value
                    row[1].extras = found.extras
                  }
                })
                apply(data)
                setOpen(false)
              }}
            />
          </div>
        </div>
      </form>
    </div>
  </Modal>
}