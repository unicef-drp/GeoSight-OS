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
import { dictDeepCopy } from "./main";
import {
  INTERNEXT_REGEX
} from "../components/SqlQueryGenerator/WhereQueryGenerator";

export const IDENTIFIER = 'indicator_'
export const JOIN_IDENTIFIER = 'concept_uuid'

/** TYPE WHERE SECTION */
export const TYPE = {
  GROUP: 'GROUP',
  EXPRESSION: 'EXPRESSION'
}

export const VALUE_TYPES = ['text', 'number']
// TODO We need to do it in elegant way
//  This is matching the key on OPERATOR
export const IS_NULL = 'IS NULL'
export const IS_NOT_NULL = 'IS NOT NULL'
export const IS_IN = 'IN'
export const IS_NOT_IN = 'NOT IN'
export const IS_LIKE = 'LIKE'
export const IS_NOT_LIKE = 'NOT LIKE'
export const IS_BETWEEN = 'BETWEEN'
export const OPERATORS = {
  '=': 'equals',
  '<>': 'not equals',
  'IS NULL': 'is null',
  'IS NOT NULL': 'is not null',
}
export const NUMBER_OPERATORS = Object.assign({}, OPERATORS, {
  '>': 'more than',
  '>=': 'above or equal',
  '<': 'less than',
  '<=': 'below or equal',
  'BETWEEN': 'between'
});
export const NUMBER_OPERATORS_SIMPLIFIED = {
  '=': 'Single selection',
  'IN': 'Multi-selection',
  '>=': 'Above or equal',
  '<=': 'Below or equal',
  'BETWEEN': 'Between'
};

export const MULTI_SELECTABLE_OPERATORS = [IS_IN, IS_NOT_IN]
export const SINGLE_SELECTABLE_OPERATORS = ['=', '<>']
export const SELECTABLE_OPERATORS = MULTI_SELECTABLE_OPERATORS + SINGLE_SELECTABLE_OPERATORS
export const STRING_OPERATORS = Object.assign({}, OPERATORS, {
  'IN': 'in',
  'NOT IN': 'not in',
  'LIKE': 'like',
  'NOT LIKE': 'not like',
});
export const STRING_OPERATORS_SIMPLIFIED = {
  '=': 'Single selection',
  'IN': 'Multi-selection',
};

export const OPERATOR_WITH_INTERVAL = 'last x (time)'
export const OPERATOR_WITH_INTERNEXT = 'next x (time)'
export const DATE_OPERATORS_SIMPLIFIED = {
  '=': 'Single selection',
  'IN': 'Multi-selection',
  '>=': 'After',
  '<=': 'Before',
  'BETWEEN': 'Between'
};

export const OPERATOR = Object.assign({}, NUMBER_OPERATORS, STRING_OPERATORS);

export const getOperators = (type, isSimplified) => {
  if (type === 'text') {
    return dictDeepCopy(isSimplified ? STRING_OPERATORS_SIMPLIFIED : STRING_OPERATORS)
  } else if (type === 'date') {
    const operators = dictDeepCopy(isSimplified ? DATE_OPERATORS_SIMPLIFIED : DATE_OPERATORS_SIMPLIFIED)
    operators[OPERATOR_WITH_INTERVAL] = 'Last'
    operators[OPERATOR_WITH_INTERNEXT] = 'Next'
    return operators
  } else {
    return dictDeepCopy(isSimplified ? NUMBER_OPERATORS_SIMPLIFIED : NUMBER_OPERATORS)
  }
}

/** OPERATOR BETWEEN WHERE */
export const WHERE_OPERATOR = {
  AND: 'AND',
  OR: 'OR'
}

/** INIT DATA */
export const INIT_DATA = {
  GROUP: () => {
    return Object.assign({}, {
      type: TYPE.GROUP,
      operator: WHERE_OPERATOR.AND,
      queries: []
    })
  },
  WHERE: () => {
    return Object.assign({}, {
      field: '',
      operator: '=',
      whereOperator: WHERE_OPERATOR.AND,
      type: TYPE.EXPRESSION
    })
  }
}

export function spacedField(field) {
  if (!field.includes('`') && (
    field.includes(' ') || field.includes('-') || field[0] === field[0].toUpperCase())
  ) {
    field = '`' + field + '`'
  }
  return field
}

/**
 * Return indicator query
 * @param {array} data Data that will be filtered.
 * @param {string} whereQuery String where query.
 */
export function queryData(data, whereQuery) {
  if (whereQuery) {
    return alasql(`SELECT *
                   FROM ?
                   WHERE ${whereQuery}`, [data])
  }
  return data
}

/**
 * Return where
 * @param where
 * @param ignoreActive
 * @param ids
 * @param sameGroupOperator If the operator are same in groups queries.
 */
export function returnWhere(where, ignoreActive, ids, sameGroupOperator = true, changeGeometryId = true) {
  switch (where.type) {
    case TYPE.GROUP:
      const queriesData = where.queries.filter(query => {
        if (query.type === TYPE.GROUP) {
          return query.queries.length
        }
        return true
      });
      const queries = queriesData.map((query, idx) => {
        const queryStr = returnWhere(query, ignoreActive, ids, sameGroupOperator, changeGeometryId)
        if (sameGroupOperator || idx === where.queries.length - 1) {
          return queryStr
        } else {
          const targetQuery = queriesData[idx + 1];
          if (targetQuery) {
            return `${queryStr} ${query?.whereOperator ? query?.whereOperator : targetQuery?.operator}`
          } else {
            return `${queryStr}`
          }
        }
      }).filter(el => el.length)

      if (queries.length === 0) {
        return ''
      } else {
        if (sameGroupOperator) {
          return `(${
            queries.join(` ${where.operator} `)
          })`
        } else {
          return `(${
            queries.join(` `)
          })`
        }
      }
    case TYPE.EXPRESSION:
      const needQuote = where.field.includes(' ') || (where.field[0] === where.field[0].toUpperCase())
      let field = needQuote ? `"${where.field}"`.replaceAll('""', '"') : where.field
      const fieldSplit = field.split('.')
      // We put all geometry_x as geometry_layer
      if (changeGeometryId && fieldSplit[0].includes('geometry_')) {
        fieldSplit[0] = 'geometry_layer'
      }
      field = fieldSplit.join('.')
      const used = ignoreActive || (where.active && (!ids || ids.includes(fieldSplit[0])))
      return used ? returnDataToExpression(field, where.operator, where.value) : ''

  }
}

/**
 * Remove " or ' on the first and last
 */
export function stringValueToFlat(value) {
  if (value) {
    if (['"', "'"].includes(value[0])) {
      value = value.slice(1);
    }
  }
  if (value) {
    if (['"', "'"].includes(value[value.length - 1])) {
      value = value.slice(0, -1);
    }
  }
  return value
}

/**
 * Return SQL in human way
 */
export function returnWhereToDict(where, upperWhere) {
  let fromQuery = []
  if (where) {
    const whereOperator = upperWhere?.operator ? upperWhere?.operator : WHERE_OPERATOR.AND
    switch (where.type) {
      case "ComparisonBooleanPrimary": {
        const field = where?.left?.value
        let operator = where?.operator
        let value = where?.right?.value
        value = value ? stringValueToFlat(value) : value
        return {
          ...INIT_DATA.WHERE(),
          field: field,
          operator: operator,
          value: value,
          whereOperator: whereOperator
        }
      }
      case "InExpressionListPredicate": {
        const field = where?.left?.value
        let operator = where.hasNot === "NOT" ? IS_NOT_IN : IS_IN
        let value = where?.right?.value
        value = value.map(el => stringValueToFlat(el.value)).filter(el => {
          return el
        })
        return {
          ...INIT_DATA.WHERE(),
          field: field,
          operator: operator,
          value: value,
          whereOperator: whereOperator
        }
      }
      case "LikePredicate": {
        const field = where?.left?.value
        let operator = where.hasNot === "NOT" ? IS_NOT_LIKE : IS_LIKE
        let value = where?.right?.value
        value = stringValueToFlat(value).replaceAll("%", "")
        return {
          ...INIT_DATA.WHERE(),
          field: field,
          operator: operator,
          value: value,
          whereOperator: whereOperator
        }
      }
      case "BetweenPredicate": {
        const field = where?.left?.value
        let operator = 'BETWEEN'
        let right = where?.right
        return {
          ...INIT_DATA.WHERE(),
          field: field,
          operator: operator,
          value: [right.left.value, right.right.value],
          whereOperator: whereOperator
        }
      }
      case "IsNullBooleanPrimary": {
        const field = where?.value?.value
        let operator = where.hasNot === 'NOT' ? IS_NOT_NULL : IS_NULL
        let value = null
        return {
          ...INIT_DATA.WHERE(),
          field: field,
          operator: operator,
          value: value,
          whereOperator: whereOperator
        }
      }
      case "OrExpression": {
        let queries = [].concat(returnWhereToDict(where.left, where))
        if (queries[queries.length - 1]) {
          queries[queries.length - 1].whereOperator = WHERE_OPERATOR.OR
        }
        queries = queries.concat(returnWhereToDict(where.right, where))
        return queries
      }
      case "AndExpression":
        return [].concat(returnWhereToDict(where.left, where)).concat(returnWhereToDict(where.right, where))
      case "SimpleExprParentheses":
        let queries = []
        where.value.value.forEach(query => {
          queries = queries.concat(returnWhereToDict(query, where))
        })
        if (queries.length >= 2) {
          queries[1].whereOperator = queries[0].whereOperator
        }
        return {
          ...INIT_DATA.GROUP(),
          queries: queries,
          operator: whereOperator
        }
    }
  }
  return fromQuery;
}

/**
 * Return value
 */
const cleanValueFn = (value, returnEmpty = false) => {
  return !value ? returnEmpty ? '' : "''" : (isNaN(value) ? `${value.includes("'") ? `"${value}"` : `'${value}'`}` : value);
}

/**
 * Return DATA in SQL
 */
export function returnDataToExpression(field, operator, value) {
  const cleanOperator = operator
  let cleanValue = cleanValueFn(value)

  // if it is interval
  try {
    const regex = INTERVAL_REGEX;
    const matches = cleanValue.match(regex);
    if (matches) {
      cleanValue = value
    }
  } catch (err) {

  }
  try {
    const regex = INTERNEXT_REGEX;
    const matches = cleanValue.match(regex);
    if (matches) {
      cleanValue = value
    }
  } catch (err) {

  }

  if ([IS_IN, IS_NOT_IN].includes(operator)) {
    if (value) {
      cleanValue = value.map(val => (cleanValueFn(val, true))).join(',')
    }
    if (cleanValue) {
      cleanValue = `(${cleanValue})`
    } else {
      cleanValue = `('')`
    }
  } else if ([IS_LIKE, IS_NOT_LIKE].includes(operator)) {
    return `${field} ${cleanOperator} ${cleanValueFn(`%${value}%`)}`
  } else if ([IS_NULL, IS_NOT_NULL].includes(operator)) {
    return `${field} ${cleanOperator}`
  } else if ([IS_BETWEEN].includes(operator)) {
    try {
      if (value[0]?.includes('T') || value[1]?.includes('T')) {
        if (value[0]?.length <= 3) {
          value[1] = "''"
        }
        if (value[1]?.length <= 3) {
          value[1] = "''"
        }
        return `${field} ${operator} '${value[0]}' AND '${value[1]}'`.replaceAll("''", "'")
      }
    } catch (err) {

    }
    const min = isNaN(parseFloat(value[0])) ? 0 : parseFloat(value[0])
    const max = isNaN(parseFloat(value[1])) ? 100 : parseFloat(value[1])
    return `${field} ${operator} ${min} AND ${max}`
  }
  return `${field} ${cleanOperator} ${cleanValue}`
}

/**
 * Return query from dictionary
 */
export function queryFromDictionary(inputData, dictionary, ignoreActive) {
  const ids = inputData.map(indicator => {
    return indicator.id
  })
  const where = returnWhere(dictionary, ignoreActive, ids);

  let query = 'SELECT * FROM '
  let mainFrom = '';
  const dataList = [];
  let idx = 0
  inputData.map(rowData => {
    const id = `${rowData.id}`;
    const data = rowData.data;
    if (data && (id === 'geometry_layer' || (id !== 'geometry_layer' && where?.includes(id)))) {
      if (idx === 0) {
        mainFrom = `${id}`;
        query += `? ${id}`;
      } else {
        query += ` INNER JOIN ? ${id} ON ${mainFrom}.${JOIN_IDENTIFIER}=${id}.${JOIN_IDENTIFIER}`
      }
      dataList.push(data);
      idx += 1
    }
  })
  if (where) {
    query += ' WHERE ' + where;
  }
  if (dataList.length === 0) {
    return {
      query: '',
      dataList: dataList
    }
  }
  return {
    query: query,
    dataList: dataList
  }
}

/**
 * Return query data from dictionary
 */
export function queryingFromDictionary(indicators, dictionary, ignoreActive) {
  // TODO
  //  This will be removed after the aggregation
  // -----------------------------------------------------------------------
  const indicatorsPerLevel = {}
  indicators.forEach((indicator, idx) => {
    const group = indicator.reporting_level;
    if (!indicatorsPerLevel[group]) {
      indicatorsPerLevel[group] = []
    }
    indicatorsPerLevel[group].push(indicator)
  })
  let data = {}
  for (const [key, indicators] of Object.entries(indicatorsPerLevel)) {
    let {
      query,
      dataList
    } = queryFromDictionary(indicators, dictionary, ignoreActive)
    try {
      data[key] = alasql(query, dataList)
    } catch (err) {
      if (dataList[0]) {
        data[key] = dataList[0]
      }
    }
  }
  return data
}