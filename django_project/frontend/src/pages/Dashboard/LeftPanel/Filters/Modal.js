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

import React, { useEffect, useState } from "react";
import { Button, FormControlLabel, Input, InputLabel } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import {
  IS_IN,
  IS_NOT_IN,
  NUMBER_OPERATORS,
  STRING_OPERATORS
} from "../../../../utils/queryExtraction";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../components/Modal";
import { SelectPlaceholder } from "../../../../components/Input";
import {
  WhereInputValue
} from "../../../../components/SqlQueryGenerator/WhereQueryGenerator/WhereInput";

/***
 * Return modal to edit filter
 * @param {boolean} open Open.
 * @param {function} setOpen Function to open/close.
 * @param {dict} data Data of filter.
 * @param {list} fields Fields data
 * @param {function} update Function to update the data.
 */
export default function FilterEditorModal(
  { open, setOpen, data, fields, update }
) {
  /** Update value based on operator **/
  const updateValue = (value) => {
    if ([IS_IN, IS_NOT_IN].includes(operator) && !Array.isArray(value)) {
      return value ? [value] : []
    } else if (![IS_IN, IS_NOT_IN].includes(operator) && Array.isArray(value)) {
      return value[0] ? value[0] : ''
    }
    return value
  }

  const [field, setField] = useState(data.field ? data.field : '')
  const [operator, setOperator] = useState(data.operator ? data.operator : '')
  const [value, setValue] = useState(data.value ? data.value : '')
  const [name, setName] = useState(data.name ? data.name : '')
  const [description, setDescription] = useState(data.description ? data.description : '')
  const [allowModify, setAllowModify] = useState(['true', true].includes(data.allowModify) ? true : false)

  let currentValue = updateValue(value);

  useEffect(() => {
    setField(data.field ? data.field : '')
    setOperator(data.operator ? data.operator : '')
    setValue(data.value ? data.value : '')
  }, [data]);

  /** When data saved */
  const onSave = () => {
    let currentValue = updateValue(value);
    if (field && operator) {
      update({
        ...data,
        field: field,
        operator: operator,
        value: currentValue,
        name: name,
        description: description,
        allowModify: allowModify,
      })
    }
  }
  const fieldData = fields.filter((row) => {
    return row.id === field
  })[0]
  const OPERATOR = fieldData?.type === 'String' ? STRING_OPERATORS : NUMBER_OPERATORS

  return <div
    onClick={(event) => {
      event.stopPropagation()
    }}>
    <Modal
      className='FilterEditModal'
      open={open}
      onClosed={
        () => {
          setOpen(false)
        }
      }
    >
      <ModalHeader onClosed={
        () => {
          setOpen(false)
        }
      }>
        {data.field ? "Updating" : "Creating"} new filter
      </ModalHeader>
      <ModalContent>
        <form className='BasicForm' style={{ padding: "0" }}>
          <div>
            <InputLabel><b>Filter Name*</b></InputLabel>
            <Input
              type="text" placeholder="Filter name" value={name}
              disableUnderline={true}
              onChange={(event) => {
                setName(event.target.value)
              }}/>
            <InputLabel>Description</InputLabel>
            <Input
              type="text" placeholder="Filter description" value={description}
              disableUnderline={true}
              onChange={(event) => {
                setDescription(event.target.value)
              }}/>
          </div>
          <div className='FilterEditModalQueryWrapper'>
            <div>Create rule</div>
            <div className='FilterEditModalQuery'>
              <SelectPlaceholder
                className='FilterEditModalQueryField'
                placeholder='Pick the field'
                list={fields}
                initValue={field}
                onChangeFn={(value) => {
                  setField(value)
                }}/>
              <SelectPlaceholder
                placeholder='Pick an operation'
                list={
                  Object.keys(OPERATOR).map((key, idx) => {
                    return { id: key, name: OPERATOR[key] }
                  })
                }
                initValue={operator}
                onChangeFn={(value) => {
                  setOperator(value)
                }}/>
              {
                field && operator ? <WhereInputValue
                  field={field.type} operator={operator} value={currentValue}
                  setValue={setValue} optionsData={fieldData?.data}/> : null
              }
            </div>
          </div>
          <div>
            <br/>
            <FormControlLabel
              checked={allowModify}
              control={<Checkbox/>}
              onChange={evt => {
                setAllowModify(!allowModify)
              }}
              label={'Allow users to modify filter parameters (values)'}/>
          </div>
          <div className='button-div'>
            <Button
              variant="primary"
              className='save__button'
              disabled={!field || !operator || !name}
              onClick={onSave}>
              {
                data.field ? "Update filter" : "Create filter"
              }
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  </div>
}
