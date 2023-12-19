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

import alasql from "alasql";
import { isValidDate, parseDateTime } from "./main"
import { spacedField } from "./queryExtraction";
import { COUNT_UNIQUE } from "../components/SqlQueryGenerator/Aggregation";

/**
 * Return related table data
 */
export const getRelatedTableData = (data, config, selectedGlobalTime, geoField = 'geometry_code', aggregateDate = true) => {
  if (data) {
    data = JSON.parse(JSON.stringify(data))
    const { aggregation } = config
    const where = config?.where.replaceAll('"', '`').replace(/`(.*?)`/g, function (match, text, href) {
      if (match.includes("'")) {
        return match.replaceAll('`', '"')
      }
      return match
    });
    const date_field = spacedField(config.date_field)
    const geography_code_field_name = spacedField(geoField)
    let aggregation_method = ''
    let aggregation_field = ''
    let aggregation_full = aggregation.replaceAll('(', '(data.')
    if (aggregation) {
      aggregation_method = aggregation.split('(')[0]
      if (aggregation.split('(')[1]) {
        aggregation_field = aggregation.split('(')[1].replace(')', '')
      }
      aggregation_full = aggregation_full.replace(aggregation_field, spacedField(aggregation_field))
      aggregation_field = spacedField(aggregation_field)
    }
    try {
      if (!date_field) {
        const sql = `SELECT ${geography_code_field_name} as _geometry_code,
                            ${aggregation_full}          as _value,
                            MAX(data.concept_uuid)       as _concept_uuid,
                            MAX(data.admin_level)        as _admin_level
                     FROM ? as data` + (where ? ` WHERE ${where}` : '') + ` GROUP BY ${geography_code_field_name}  ORDER BY ${geography_code_field_name} DESC`
        const results = alasql(sql, [data]).map((result, idx) => {
          return {
            id: idx,
            admin_level: result._admin_level,
            geometry_code: result._geometry_code,
            concept_uuid: result._concept_uuid,
            date: null,
            value: result._value,
          }
        })
        return {
          rows: results
        }
      } else {
        let updatedWhere = where;
        if (selectedGlobalTime?.min) {
          if (updatedWhere) {
            updatedWhere += ' AND '
          }
          updatedWhere += ` data.${date_field}>="${selectedGlobalTime?.min}"`
        }
        if (selectedGlobalTime?.max) {
          if (updatedWhere) {
            updatedWhere += ' AND '
          }
          updatedWhere += ` data.${date_field}<="${selectedGlobalTime?.max}"`
        }

        // Update the date with ISO Format
        data = data.map(row => {
          if (typeof row[date_field] === 'string') {
            const date = new Date(row[date_field])
            if (isValidDate(date)) {
              row[date_field] = date.toISOString()
            }
          }
          return row
        })
        // -----------------------------------
        // Create SQL query
        // -----------------------------------
        let sql = `SELECT ${geography_code_field_name}             as _geometry_code,` +
          (aggregateDate ? `MAX(data.${date_field})` : `data.${date_field}`) + ` as _date,
                          MAX(data.concept_uuid)                   as _concept_uuid,
                          MAX(data.geometry_code)                  as _ucode,
                          MAX(data.geometry_name)                  as _geometry_name,
                          ${aggregation_full} as _value,
                          MAX(data.admin_level)        as _admin_level
                   FROM ? as data` + (updatedWhere ? ` WHERE ${updatedWhere}` : '') + ` GROUP BY ${geography_code_field_name}` + (!aggregateDate ? `, data.${date_field}` : '') + `  
                   ORDER BY ${geography_code_field_name} DESC `
        if (['MAJORITY', 'MINORITY'].includes(aggregation_method)) {
          sql = `SELECT ${geography_code_field_name} as _geometry_code,` +
            (aggregateDate ? `MAX(data.${date_field})` : `data.${date_field}`) + ` as _date,
                        MAX(data.concept_uuid)       as _concept_uuid,
                        MAX(data.geometry_code)      as _ucode,
                        MAX(data.geometry_name)      as _geometry_name,
                        data.${aggregation_field}         as _value,
                        COUNT(${aggregation_field})  as value_occurrence,
                        MAX(data.admin_level)        as _admin_level
                 FROM ? as data` + (updatedWhere ? ` WHERE ${updatedWhere}` : '') + ` GROUP BY ${geography_code_field_name}, data.${aggregation_field}` + (!aggregateDate ? `, data.${date_field}` : '') +
            ` ORDER BY ${geography_code_field_name} DESC, value_occurrence ${aggregation_method === 'MAJORITY' ? 'DESC' : 'ASC'}`
        }
        if ([COUNT_UNIQUE].includes(aggregation_method)) {
          sql = `SELECT ${geography_code_field_name}             as _geometry_code,` +
            (aggregateDate ? `MAX(data.${date_field})` : `data.${date_field}`) + ` as _date,
                          MAX(data.concept_uuid)                   as _concept_uuid,
                          MAX(data.geometry_code)                   as _ucode,
                          MAX(data.geometry_name)                   as _geometry_name,
                          COUNT(DISTINCT(data.${aggregation_field})) as _value,
                          MAX(data.admin_level)        as _admin_level
                   FROM ? as data` + (updatedWhere ? ` WHERE ${updatedWhere}` : '') + ` GROUP BY ${geography_code_field_name}` + (!aggregateDate ? `, data.${date_field}` : '') + `  
                   ORDER BY ${geography_code_field_name} DESC `
        }
        const results = alasql(sql, [data]).map((result, idx) => {
          return {
            id: idx,
            admin_level: result._admin_level,
            geometry_code: result._geometry_code,
            geometry_name: result._geometry_name,
            concept_uuid: result._concept_uuid,
            ucode: result._ucode,
            date: result._date,
            value: result._value,
          }
        })
        return {
          rows: results
        }
      }
    } catch (error) {
      return {
        error: error.toString()
      }
    }
  } else {
    return {
      rows: []
    }
  }
}

/***
 * Return table fields ready for the query
 */
export function getRelatedTableFields(relatedTable, relatedTableData) {
  if (relatedTable?.related_fields) {
    return relatedTable.related_fields.map(field => {
      let options = null
      if (relatedTableData) {
        options = relatedTableData.map(data => '' + data[field])
        options = Array.from(new Set(options))
      }
      return {
        name: field,
        value: field,
        options: options
      }
    })
  } else {
    return []
  }
}

/** Update related table response */
export function updateRelatedTableResponse(response) {
  response.map(row => {
    for (const [key, value] of Object.entries(row)) {
      const isDate = (
        key.toLowerCase().replaceAll('_', '').includes('date') ||
        key.toLowerCase().replaceAll('_', '').includes('time')
      )
      if (isDate && !isNaN(value)) {
        row[key] = parseDateTime(value)
      }
    }
  })
  return response
}