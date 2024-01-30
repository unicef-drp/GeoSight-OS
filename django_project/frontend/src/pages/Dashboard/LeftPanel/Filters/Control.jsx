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

/* ==========================================================================
   Filters CONTROL
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch } from "react-redux"
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import {
  WhereInputValue
} from "../../../../components/SqlQueryGenerator/WhereQueryGenerator/WhereInput";
import { SelectPlaceholder } from "../../../../components/Input";
import {
  INIT_DATA,
  IS_NOT_NULL,
  IS_NULL,
  OPERATOR,
  TYPE,
  WHERE_OPERATOR
} from "../../../../utils/queryExtraction"

import { Actions } from '../../../../store/dashboard'
import { capitalize } from "../../../../utils/main";
import FilterEditorModal from './Modal'
import { DeleteIcon, EditIcon } from '../../../../components/Icons'

import './style.scss'

const Switcher = styled(Switch)(({ theme }) => ({}));
const expandedByFilterField = {}

export function OperatorSwitcher({ ...props }) {
  return <FormControlLabel
    className='OperatorSwitcher'
    control={<Switcher/>}
    {...props}
  />
}

/**
 * Control All Filter.
 * @param {dict} filtersData Filters of dashboard.
 * @param {list} fields Data fields.
 * @param {Function} filter Filter function.
 * @param {bool} ableToModify Able to modify.
 */
export default function FilterControl(
  { filtersData, fields, filter, ableToModify }
) {
  const dispatcher = useDispatch()
  const [filters, setFilters] = useState(filtersData)

  // Apply the filters query
  useEffect(() => {
    if (JSON.stringify(filters) !== JSON.stringify(filtersData)) {
      setFilters(filtersData)
    }
  }, [filtersData]);

  /**
   * Update Filter
   */
  const updateFilter = (force) => {
    filter(filters)
    if (force) {
      dispatcher(
        Actions.Filters.update({ ...filters })
      )
      setFilters({ ...filters });
    }
  }

  /** --------------------------------------------------
   ** Render filter group.
   ** -------------------------------------------------- **/
  const FilterGroup = ({ where, upperWhere }) => {
    const [operator, setOperator] = useState(where.operator)
    const [open, setOpen] = useState(false)
    const [data, setData] = useState(INIT_DATA.WHERE())
    const [addType, setAddType] = useState(null)

    const optionsTypes = [
      { id: WHERE_OPERATOR.AND, name: 'And' },
      { id: WHERE_OPERATOR.OR, name: 'Or' }
    ]

    const switchWhere = (operator) => {
      setOperator(operator);
      where.operator = operator;
      updateFilter(true)
    }

    const add = (newData) => {
      switch (addType) {
        case TYPE.EXPRESSION: {
          where.queries.push(newData);
          break
        }
        case TYPE.GROUP:
          where.queries.push({
            ...INIT_DATA.GROUP(),
            queries: [newData]
          });
          break
      }
      updateFilter(true)
    }

    // Apply when group control changed
    const groupCheckedChanged = (where, checked) => {
      where.active = checked
      if (where.queries) {
        where.queries.map(query => {
          groupCheckedChanged(query, checked)
        })
      }
      updateFilter(true)
    }

    const hasMoreQuery = where.queries.length > 1

    return <div className='FilterGroup'>
      <div className='FilterGroupHeader'>
        <div className='FilterGroupOption'>
          {
            hasMoreQuery ?
              <Checkbox
                className='GroupSwitcher'
                checked={where.active}
                size="small"
                onChange={() => {
                  groupCheckedChanged(where, !where.active)
                }}
              /> : null
          }
          {
            ableToModify ?
              <Fragment>
                <SelectPlaceholder
                  disabled={!hasMoreQuery}
                  placeholder='Operator'
                  list={hasMoreQuery ? optionsTypes : [optionsTypes[0]]}
                  initValue={hasMoreQuery ? operator : optionsTypes[0].id}
                  onChangeFn={(value) => {
                    switchWhere(value)
                  }}
                />
                <div className='FilterGroupName'>
                </div>
                <Tooltip title="Add New Filter">
                  <AddCircleIcon
                    className='FilterGroupAddExpression MuiButtonLike'
                    onClick={
                      () => {
                        setOpen(true)
                        setAddType(TYPE.EXPRESSION)
                      }}/>
                </Tooltip>
                <Tooltip title="Add New Group">
                  <CreateNewFolderIcon
                    className='FilterGroupAdd MuiButtonLike' onClick={
                    () => {
                      setOpen(true)
                      setAddType(TYPE.GROUP)
                    }
                  }/>
                </Tooltip>
                <FilterEditorModal
                  open={open}
                  setOpen={(opened) => {
                    setOpen(opened)
                    setData(INIT_DATA.WHERE());
                  }}
                  data={data}
                  fields={fields}
                  update={add}/>
                {
                  upperWhere ? (
                    <Tooltip title="Delete Group">
                      <DeleteIcon
                        className='FilterGroupDelete MuiButtonLike' onClick={
                        () => {
                          let isExecuted = confirm("Do you want to delete this group?");
                          if (isExecuted) {
                            upperWhere.queries = [...upperWhere.queries.filter(query => {
                              return query !== where
                            })]
                            updateFilter(true)
                          }
                        }
                      }/>
                    </Tooltip>
                  ) : ''}
                <div className='FilterGroupEnd'>
                </div>
              </Fragment> :
              <div className='OperatorIdentifier'>{operator}</div>
          }
        </div>
      </div>
      {
        where.queries.length > 0 ?
          where.queries.map(
            (query, idx) => (
              <FilterRender
                key={idx} where={query} upperWhere={where}
                updateFilter={updateFilter}/>
            )
          )
          :
          <div className='FilterNote'>There is no filter for this group.</div>
      }
    </div>
  }
  /** --------------------------------------------------
   ** Render input of filter.
   ** -------------------------------------------------- **/
  const FilterInput = ({ where, upperWhere }) => {
    const [expanded, setExpanded] = useState(
      expandedByFilterField[where.name] ? expandedByFilterField[where.name] : false
    )
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(where.active)

    const updateExpanded = () => {
      setExpanded(!expanded)
      expandedByFilterField[where.name] = !expanded
    }
    const updateActive = (active) => {
      setActive(active)
      where.active = active
      updateFilter()
    }
    const update = (newWhere) => {
      where.field = newWhere.field
      where.operator = newWhere.operator
      where.value = newWhere.value
      where.name = newWhere.name
      where.description = newWhere.description
      where.allowModify = newWhere.allowModify
      expandedByFilterField[where.name] = expanded
      updateFilter(true)
    }
    const field = where.field
    const operator = where.operator
    const value = where.value
    const fieldData = fields.filter((row) => {
      return row.id === field
    })[0]
    const fieldName = fieldData?.name

    // When fields changed, remove the where if no field found
    // TODO:
    //  We need to fix geometry one
    useEffect(() => {
      if (!where.field.includes('geometry_')) {
        if (!fields.find(field => field.id === where.field)) {
          upperWhere.queries = [...upperWhere.queries.filter(query => {
            return query !== where
          })]
          updateFilter(true)
        }
      }
    }, [fields]);

    /**
     * Return filter input
     */
    const FilterInputElement = () => {
      const [currentValue, setCurrentValue] = useState(value)
      const updateValue = (value) => {
        const cleanValue = !isNaN(value) ? (!Array.isArray(value) ? Number(value) : value) : value;
        setCurrentValue(cleanValue)
        where.value = cleanValue
        updateFilter()
      }
      const needsValue = ![IS_NULL, IS_NOT_NULL].includes(operator)
      return <div>
        {fieldName ? fieldName : field} {OPERATOR[operator]}
        {
          needsValue ?
            <div className='FilterInputWrapper'>
              <WhereInputValue
                fieldType={fieldData?.type}
                field={field.type} operator={operator} value={currentValue}
                setValue={updateValue} optionsData={fieldData?.data}/>
            </div> : ""
        }
        {where.description ?
          <div
            className='FilterExpressionDescription'>{where.description}</div> : ''
        }
      </div>
    }
    const ableToExpand = where.allowModify;
    const isLoading = !fieldData?.data || fieldData?.data[0] === 'loading'
    return <Accordion
      className={'FilterExpression'}
      expanded={!ableToExpand ? false : expanded}
      onChange={updateExpanded}>
      <AccordionSummary
        expandIcon={ableToExpand ? <ExpandMoreIcon/> : ""}
      >
        <div
          className='FilterExpressionName'
          onClick={(event) => {
            updateExpanded()
          }}>
          <Checkbox
            checked={active}
            disabled={isLoading}
            size="small"
            onChange={(event) => {
              updateActive(event.target.checked)
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          />
          {
            isLoading ?
              <div className='Throbber'><CircularProgress size={16}/>
              </div> : null
          }
          {
            where.name ?
              <div>{where.name}</div> :
              fieldName ?
                <div>{capitalize(fieldName.split('.')[1])}</div> :
                <div>Loading</div>
          }
        </div>
        {ableToModify ?
          <Fragment>
            <EditIcon
              className='MuiButtonLike FilterEdit'
              onClick={(event) => {
                event.stopPropagation()
                setOpen(true)
              }}/>
            {
              upperWhere ? (
                <Tooltip title="Delete Filter">
                  <DeleteIcon
                    className='MuiButtonLike FilterDelete MuiButtonLike'
                    onClick={
                      (e) => {
                        let isExecuted = confirm("Do you want to delete this filter?");
                        if (isExecuted) {
                          upperWhere.queries = [...upperWhere.queries.filter(query => {
                            return query !== where
                          })]
                          updateFilter(true)
                        }
                        e.stopPropagation()
                      }
                    }/>
                </Tooltip>
              ) : ''
            }

            <FilterEditorModal
              open={open} setOpen={setOpen} data={where}
              fields={fields} update={update}/>
          </Fragment>
          : ""}
      </AccordionSummary>
      <AccordionDetails>
        {ableToExpand ? <FilterInputElement/> : ""}
      </AccordionDetails>
    </Accordion>
  }

  /** --------------------------------------------------
   ** Render input of filter.
   ** -------------------------------------------------- **/
  const FilterRender = ({ where, upperWhere }) => {
    switch (where.type) {
      case TYPE.GROUP:
        return <FilterGroup where={where} upperWhere={upperWhere}/>
      case TYPE.EXPRESSION:
        return <FilterInput where={where} upperWhere={upperWhere}/>
      default:
        return ''
    }
  }
  return <Fragment>
    <FilterRender
      where={filters}
      upperWhere={null}/>
  </Fragment>
}