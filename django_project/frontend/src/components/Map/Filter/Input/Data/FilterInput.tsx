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
 * __date__ = '16/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { memo, useCallback, useRef, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Checkbox from "@mui/material/Checkbox";
import { FilterInputData } from "./FilterInputData";
import { FilterInputDataProps, FilterInputElementProps } from "../../types.d";
import DeleteFilter from "../../FilterDelete";
import { EditIcon } from "../../../../Icons";
import { TYPE } from "../../../../../utils/queryExtraction";
import FilterEditor from "../../FilterEditor";

/** Filter group component */
const FilterInputElement = memo(
  (
    {
      operator,
      // For layout
      name,
      description,
      allowModify,

      // Filter definition
      field,
      value,
      setValue,

      // Active state
      active,
      setActive,

      onDelete,
      onEdited,

      isAdmin
    }: FilterInputElementProps) => {
    const modalRef = useRef(null);
    const [expanded, setExpanded] = useState(false)

    const isEnabled = isAdmin || allowModify;
    /** Render **/
    return (
      <Accordion
        className={'FilterExpression'}
        expanded={!isEnabled ? false : expanded}
        onChange={() => setExpanded(!expanded)}
      >
        <AccordionSummary
          expandIcon={isEnabled ? <ExpandMoreIcon/> : ""}
        >
          <div className='FilterExpressionName'>
            <Checkbox
              checked={active}
              size="small"
              onChange={(event) => {
                setActive(!active)
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
            <div>{name}</div>
            <div className='Separator'></div>
            {
              isEnabled && <>
                <EditIcon
                  className='MuiButtonLike FilterEdit'
                  onClick={(event: any) => {
                    event.stopPropagation()
                    modalRef.current.open(
                      {
                        name: name,
                        description: description,
                        allowModify: allowModify,
                        field: field,
                        operator: operator,
                        type: TYPE.EXPRESSION,
                        value: value,
                      },
                      (newData: any) => {
                        onEdited(newData)
                      }
                    )
                  }}/>
                <DeleteFilter
                  text={'Are you sure want to delete this group?'}
                  onDelete={onDelete}
                  isAdmin={isAdmin}
                />
              </>
            }
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <FilterInputData
            operator={operator}

            // For layout
            description={description}
            allowModify={allowModify}

            // Filter definition
            field={field}
            value={value}
            setValue={setValue}

            isAdmin={isAdmin}
          />
          {
            description && <div
              className='FilterExpressionDescription'>{description}</div>
          }
        </AccordionDetails>
        <FilterEditor ref={modalRef}/>
      </Accordion>
    )
  }
)

/** Filter group component */
const FilterInput = (
  {
    /* Global query */
    query,
    updateQuery,

    /* Event on delete */
    onDelete,

    isAdmin
  }: FilterInputDataProps
) => {

  // Active callbacks
  const setActive = useCallback((value: boolean) => {
    if (query.active !== value) {
      query.active = value
      updateQuery()
    }
  }, []);

  // Value callbacks
  const setValue = useCallback((value: boolean) => {
    if (query.value !== value) {
      query.value = value
      updateQuery()
    }
  }, []);

  // OnDelete Callback
  const onDeleteCallback = useCallback(() => {
    onDelete()
  }, []);

  // onEdited Callback
  const onEditedCallback = useCallback((data: any) => {
    query.name = data.name;
    query.description = data.description;
    query.allowModify = data.allowModify;
    query.field = data.field;
    query.operator = data.operator;
    query.type = data.type;
    query.value = data.value;
    updateQuery()
  }, []);

  // RENDER
  return <FilterInputElement
    operator={query.operator}

    // For layout
    name={query.name}
    description={query.description}
    allowModify={query.allowModify}

    // Filter definition
    field={query.field}
    value={query.value}
    setValue={setValue}

    /* active */
    active={query.active}
    setActive={setActive}

    onDelete={onDeleteCallback}
    onEdited={onEditedCallback}

    isAdmin={isAdmin}
  />
};

export default FilterInput;