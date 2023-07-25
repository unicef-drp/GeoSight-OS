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
 * __date__ = '07/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import nunjucks from "nunjucks"

var env = nunjucks.configure({ autoescape: true });
env.addFilter('humanize', function (str) {
  return str.replaceAll('_', ' ')
});
env.addFilter('max', function (array) {
  if (!array.length) {
    return null
  }
  return Math.max(...array)
});
env.addFilter('min', function (array) {
  if (!array.length) {
    return null
  }
  return Math.min(...array)
});
env.addFilter('avg', function (array) {
  if (!array.length) {
    return null
  }
  return array.reduce((a, b) => a + b) / array.length;
});
env.addFilter('sum', function (array) {
  if (!array.length) {
    return null
  }
  return array.reduce((a, b) => a + b);
});

/**
 * SPECIFICALLY FOR FORMULA BASED
 * **/
function get_values(indicator, geometryType, t1, t2) {
  const globalNow = new Date().getTime();
  if (!this.ctx?.context?.admin_boundary) {
    return []
  }

  function getTime(t, label) {
    let now = new Date(globalNow);
    if (!t) {
      throw new Error(
        `${label} can't be empty.\u00A0
          The options are ['last x days', 'last x months', 'last x years', 'now'].`
      )
    }
    if (t.match(/last ([1-9]|[0-9]\d{1,}) day\(s\)/g)) {
      t = t.replace('last', '').replace('days', '')
      t = parseInt(t)
      now.setDate(now.getDate() - t);
    } else if (t.match(/last ([1-9]|[0-9]\d{1,}) month\(s\)/g)) {
      t = t.replace('last', '').replace('months', '')
      t = parseInt(t)
      now.setMonth(now.getMonth() - t);
    } else if (t.match(/last ([1-9]|[0-9]\d{1,}) year\(s\)/g)) {
      t = t.replace('last', '').replace('years', '')
      t = parseInt(t)
      now.setFullYear(now.getFullYear() - t);
    } else if (t !== 'now') {
      if (!t.includes('Z') && !t.includes('+')) {
        t += '+00:00'
      }
      now = new Date(t)
      if (!(now instanceof Date && !isNaN(now))) {
        throw new Error(
          `${label} is not recognized.\u00A0
        The options are ['now', 'last x day(s)', 'last x month(s)', 'last x year(s)' and '%Y-%m-%dT%H:%M:%S'].`
        )
      }
    }
    return now
  }

  // create from and to
  const from = t1 ? getTime(t1, 't1') : null;
  const to = getTime(t2, 't2')
  if (to < from) {
    throw new Error(`t2 can't be lesser than t1`)
  }

  function getIndicatorData(geometries, indicator) {
    let data = []
    geometries.forEach(geometry => {
      if (geometry?.indicators && geometry.indicators[indicator]) {
        data = data.concat(geometry.indicators[indicator].map(data => {
          data.admin_level = geometry.admin_level
          data.concept_uuid = geometry.concept_uuid
          data.geom_code = geometry.geom_code
          data.name = geometry.name
          return data
        }))
      }
    })
    const output = data.filter(row => {
      const dataTime = new Date(row.time)
      return (!from || (from && dataTime >= from)) && dataTime <= to
    })
    output.sort(function (first, second) {
      if (second.time > first.time) {
        return -1
      }
      return 1
    })
    return output
  }

  const context = this.ctx?.context?.admin_boundary
  switch (geometryType) {
    case 'current':
      return getIndicatorData([context], indicator)
    case 'parent':
      return getIndicatorData([context.parent], indicator)
    case 'children':
      return getIndicatorData(context.children, indicator)
    case 'siblings':
      return getIndicatorData(context.siblings, indicator)
    default:
      throw new Error(
        `Geometry type ${geometryType} is not recognized.\u00A0
        The options are ['current', 'parent', 'children', 'siblings'].`
      )
  }
}

function get_value(indicator, geometryType, t1, t2, aggregation) {
  const data = get_values.call({
    ctx: this.ctx
  }, indicator, geometryType, t1, t2).map(row => row.value)
  if (!data?.length) {
    return null
  }
  switch (aggregation) {
    case 'last':
      return data[data.length - 1]
    case 'sum':
      return data.reduce((accum, val) => {
        return accum + val
      }, 0);
    case 'min':
      return Math.min(...data)
    case 'max':
      return Math.max(...data)
    case 'avg':
      const sum = data.reduce((accum, val) => {
        return accum + val
      }, 0)
      return sum / data.length;
    default:
      if (!aggregation) {
        throw new Error(
          `aggregation is can't be empty.\u00A0
          The options are ['last', 'sum', 'min', 'max', 'avg'].`
        )
      }
      throw new Error(
        `aggregation ${aggregation} is not recognized.\u00A0
        The options are ['last', 'sum', 'min', 'max', 'avg'].`
      )
  }
}

env.addGlobal('get_value', get_value);
env.addGlobal('get_values', get_values);


/**
 * Return template content
 */
export function nunjucksContent(template, context, defaultTemplateInput = '') {
  return `
      ${nunjucks.renderString(
    template ? template : defaultTemplateInput, context
  )}
  `;
}