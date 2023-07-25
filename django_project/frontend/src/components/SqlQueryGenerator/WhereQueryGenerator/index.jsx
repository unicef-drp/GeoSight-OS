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
   Where Query Generator
   ========================================================================== */

import React from 'react';
import sqlParser from "js-sql-parser";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Input } from "@mui/material";
import {
  INIT_DATA,
  returnWhere,
  returnWhereToDict
} from "../../../utils/queryExtraction";
import WhereRender from "./WhereRender"

import './style.scss';

const INTERVAL_IDENTIFIER = '::interval'
const INTERVAL_QUERY_BEFORE = 'now() - interval '

/**
 * Left-Right toggle button.
 * @param {string} fields Initial state of toggle between left or right.
 * @param {string} whereQuery Function when state is on lft.
 * @param {function} setWhereQuery Function when state is on right.
 * @param {dict} disabledChanges Disabled some inputs.
 * @param props
 */
export default function WhereQueryGenerator(
  {
    fields, whereQuery, setWhereQuery, disabledChanges = {}, ...props
  }
) {
  // ---------------------------------------------------
  // Change interval with temporary one
  let cleanWhere = whereQuery
  const regex = /now\(\) - interval '\d+ (years|months|days|hours|minutes|seconds)'/g;
  const matches = whereQuery.match(regex);
  if (matches) {
    matches.map(match => {
      let newStr = match.replaceAll(INTERVAL_QUERY_BEFORE, '')
      newStr = newStr.replaceAll("'", "") + INTERVAL_IDENTIFIER
      newStr = `'${newStr}'`
      cleanWhere = cleanWhere.replace(match, newStr)
    })
  }
  // ---------------------------------------------------

  let whereDict = INIT_DATA.GROUP()
  let error = null
  try {
    const parsed = sqlParser.parse(
      `SELECT *
       FROM test
       WHERE ${cleanWhere}`)
    const queries = returnWhereToDict(parsed.value.where)
    whereDict.queries = Array.isArray(queries) ? queries : [queries]
  } catch (err) {
    error = err.toString()
  }


  const onLoading = fields === undefined || fields === null
  if (onLoading) {
    return <div>Loading</div>
  }
  const updateWhere = () => {
    let newQuery = returnWhere(whereDict, true, null, false);
    newQuery = newQuery.substring(1)
    newQuery = newQuery.slice(0, -1);

    const regex = /'\d+ (years|months|days|hours|minutes|seconds)::interval'/g;
    const matches = newQuery.match(regex);
    if (matches) {
      matches.map(match => {
        let newStr = match.replaceAll(INTERVAL_IDENTIFIER, '')
        newStr = INTERVAL_QUERY_BEFORE + newStr
        newQuery = newQuery.replace(match, newStr)
      })
    }
    setWhereQuery(newQuery)
  }
  return <div className='WhereConfiguration'>
    <div className='WhereConfigurationResult'>
      {
        disabledChanges.add ? null :
          <AddCircleIcon className='AddButton' onClick={() => {
            const newWhere = INIT_DATA.WHERE()
            newWhere.field = fields[0].name
            whereDict.queries.push(newWhere)
            updateWhere()
          }}/>
      }
      <div className='WhereConfigurationQuery'>
        <Input
          className='WhereConfigurationResultIndicator'
          placeholder={'Put where SQL'}
          disabled={disabledChanges.sql}
          value={whereQuery}
          onChange={(evt) => {
            setWhereQuery(evt.target.value)
          }}
        />
      </div>
    </div>
    {
      whereQuery ?
        error ? <div className='error'>{error}</div> :
          <WhereRender
            where={whereDict}
            upperWhere={null}
            updateWhere={updateWhere}
            fields={fields}
            disabledChanges={disabledChanges}
            {...props}
          />
        : ""
    }
  </div>
}
