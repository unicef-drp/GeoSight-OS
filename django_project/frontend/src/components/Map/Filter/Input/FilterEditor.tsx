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
 * __date__ = '20/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from "react";
import { Button, Checkbox, Input, InputLabel } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  INIT_DATA,
  IS_IN,
  IS_NOT_IN
} from "../../../../utils/queryExtraction";
import Modal, { ModalContent, ModalHeader } from "../../../Modal";
import { FilterExpressionProps } from "../types.d";
import { FilterFieldOperatorInput } from "./FieldOperator";
import { FilterInputData } from "./FilterInputData";

import '../style.scss';

export interface FilterEditorModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  inputData: FilterExpressionProps;
  onApply: (val: any) => void;
}

/** Update value based on operator **/
const updateValue = (operator: string, value: any) => {
  if ([IS_IN, IS_NOT_IN].includes(operator) && !Array.isArray(value)) {
    return value ? [value] : []
  } else if (![IS_IN, IS_NOT_IN].includes(operator) && Array.isArray(value)) {
    return value[0] ? value[0] : ''
  }
  return value
}

/*** Return modal to edit filter */
export function FilterEditorModal(
  { open, setOpen, onApply, inputData }: FilterEditorModalProps
) {
  const [data, setData] = useState(null)


  // Field callbacks
  const setFieldCallback = (value: boolean) => {
    console.log(data)
    setData({ ...data, field: value })
  }

  // Operator callbacks
  const setOperatorCallback = (value: boolean) => {
    console.log(data)
    setData({ ...data, operator: value })
  }

  // Value callbacks
  const setValueCallback = (value: boolean) => {
    console.log(data)
    setData({ ...data, value: value })
  }


  useEffect(() => {
    setData(inputData)
  }, [inputData])

  /** When data saved */
  const onSave = () => {
    let currentValue = updateValue(data.operator, data.value);
    if (data.field && data.operator) {
      onApply({
        ...data,
        value: currentValue
      })
    }
  }

  if (!data) {
    return null
  }

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
        {inputData.field ? "Updating" : "Creating"} new filter
      </ModalHeader>
      <ModalContent
        className={''}
      >
        <form className='BasicForm' style={{ padding: "0" }}>
          <div>
            <InputLabel><b>Filter Name*</b></InputLabel>
            <Input
              type="text" placeholder="Filter name" value={data.name}
              disableUnderline={true}
              onChange={(event) => {
                setData({ ...data, name: event.target.value })
              }}/>
            <InputLabel>Description</InputLabel>
            <Input
              type="text" placeholder="Filter description"
              value={data.description}
              disableUnderline={true}
              onChange={(event) => {
                setData({ ...data, description: event.target.value })
              }}/>
          </div>
          <div className='FilterEditModalQueryWrapper'>
            <div>Create rule</div>
            <div className='FilterEditModalQuery'>
              <FilterFieldOperatorInput
                field={data.field}
                setField={setFieldCallback}
                operator={data.operator}
                setOperator={setOperatorCallback}
              />
              {
                data.field &&
                <FilterInputData
                  // For layout
                  allowModify={true}

                  // Filter definition
                  field={data.field}
                  operator={data.operator}
                  value={data.value}
                  setValue={setValueCallback}
                  isAdmin={true}
                />
              }
            </div>
          </div>
          <div>
            <br/>
            <FormControlLabel
              checked={data.allowModify}
              control={<Checkbox/>}
              onChange={evt => {
                setData({ ...data, allowModify: !data.allowModify })
              }}
              label={'Allow users to modify filter parameters (values)'}/>
          </div>
          <div className='button-div'>
            <Button
              // @ts-ignore
              variant="primary"
              className='save__button'
              disabled={!data.field || !data.operator || !data.name}
              onClick={onSave}>
              {
                inputData.field ? "Update filter" : "Create filter"
              }
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  </div>
}


/** Filter editor */
export const FilterEditor = forwardRef(
  ({}, ref) => {
    const [open, setOpen] = useState(false)
    const [state, setState] = useState(
      {
        data: INIT_DATA.WHERE(),
        setData: null
      }
    )

    // Ready check
    useImperativeHandle(ref, () => ({
      open(data: any, setData: (data: any) => void) {
        setState({ data: data, setData: setData })
        setOpen(true)
      }
    }));

    return <>
      {
        open && <FilterEditorModal
          open={open}
          setOpen={setOpen}
          // @ts-ignore
          inputData={state.data}
          onApply={
            data => {
              state.setData(data)
              setOpen(false)
            }
          }
        />
      }
    </>
  }
)
export default FilterEditor;