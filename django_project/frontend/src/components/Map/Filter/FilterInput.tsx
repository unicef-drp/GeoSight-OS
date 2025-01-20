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

import { FilterInputDataProps, FilterInputElementProps } from "./types.d";
import React, { memo, useCallback, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Checkbox from "@mui/material/Checkbox";
import DeleteFilter from "./FilterDelete";
import { FilterInputData } from "./FilterInputData";

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
      type,
      value,
      setValue,

      // Active state
      active,
      setActive,

      onDelete
    }: FilterInputElementProps) => {

    console.log('FilterInputElement ' + field)
    const [expanded, setExpanded] = useState(false)
    /** Render **/
    return (
      <Accordion
        className={'FilterExpression'}
        expanded={!allowModify ? false : expanded}
        onChange={() => setExpanded(!expanded)}
      >
        <AccordionSummary
          expandIcon={allowModify ? <ExpandMoreIcon/> : ""}
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
              allowModify && <>
                <DeleteFilter
                  text={'Are you sure want to delete this group?'}
                  onDelete={onDelete}
                />
              </>
            }
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <FilterInputData
            operator={operator}

            // For layout
            name={name}
            description={description}
            allowModify={allowModify}

            // Filter definition
            field={field}
            type={type}
            value={value}
            setValue={setValue}
          />
          {
            description && <div
              className='FilterExpressionDescription'>{description}</div>
          }
          {
            allowModify ? <>

            </> : ""
          }
        </AccordionDetails>
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
    onDelete
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

  // RENDER
  return <FilterInputElement
    operator={query.operator}

    // For layout
    name={query.name}
    description={query.description}
    allowModify={query.allowModify}

    // Filter definition
    field={query.field}
    type={query.type}
    value={query.value}
    setValue={setValue}

    /* active */
    active={query.active}
    setActive={setActive}

    onDelete={onDeleteCallback}
  />
};

export default FilterInput;