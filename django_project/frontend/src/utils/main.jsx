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

'use strict';

import i18n from "i18next";

/**
 * Deep copy of dictionary
 */
export function dictDeepCopy(dict, moreDeep = true) {
  if (moreDeep) {
    return JSON.parse(JSON.stringify(dict))
  }
  if (Array.isArray(dict)) {
    return Object.assign([], dict)
  } else if (typeof dict === 'object') {
    return Object.assign({}, dict)
  } else {
    return JSON.parse(JSON.stringify(dict))
  }
}


/**
 * return translation of message
 * mostly for checking if the sentences has incorrect character
 *
 * @param sentence : string
 */
export function translate(sentence) {
  if (sentence === undefined) {
    return sentence
  }

  sentence = sentence.replace('https://', '')
  // split with ':'
  const newSentences = sentence.split(':').map(val => {
    const cleanSentence = val.replace(/ +(?= )/g, '')
    return i18n.t(cleanSentence.trim())
  })
  return newSentences.join(': ')
}

/**
 * Delays the execution in x milliseconds.
 *
 * @param {int} millis Milliseconds
 */
export function delay(millis) {
  return new Promise(resolve => {
    setTimeout(resolve, millis);
  });
}

/**
 * Delete from array.
 */
export function deleteFromArray(item, array) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array
}


/**
 * Return number with commas
 */
export function numberWithCommas(x, decimalNum = 2) {
  if (x === null) {
    return '';
  } else if (isNaN(x)) {
    return x;
  } else {
    let numFloat = parseFloat(x);
    if (!isNaN(numFloat)) {
      x = numFloat;
    } else {
      return x
    }
    if (typeof x !== 'number') {
      return x
    }
    x = x.toFixed(decimalNum)
    let number = x.split('.')[0];
    let decimal = x.split('.')[1];
    let string = number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (decimal && parseInt(decimal)) {
      string += '.' + decimal.replace(/[0]+$/, '');
    }
    return string;
  }
}

/**
 * Capitalize a string
 * @param target
 * @returns {string}
 */
export function capitalize(target) {
  return (target.charAt(0).toUpperCase() + target.slice(1)).replaceAll('_', ' ');
}

/**
 * JSON TO PARAMS
 */
export function jsonToUrlParams(object) {
  const params = []
  for (const [key, value] of Object.entries(object)) {
    params.push(`${key}=${value}`)
  }
  return params.join('&')
}

/***
 * Hex to RGBA
 */
export function hexToRGB(hex, alpha) {
  if (!hex) {
    return "rgb(0,0,0)";
  }
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha !== undefined) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}

/**
 * Return lighter/darker color
 * @param hexColor
 * @param magnitude Positive value to lighten, negative value to darken
 * @returns {string|*}
 */
export function newShade(hexColor, magnitude) {
  hexColor = hexColor.replace(`#`, ``);
  if (hexColor.length === 6) {
    const decimalColor = parseInt(hexColor, 16);
    let r = (decimalColor >> 16) + magnitude;
    r > 255 && (r = 255);
    r < 0 && (r = 0);
    let g = (decimalColor & 0x0000ff) + magnitude;
    g > 255 && (g = 255);
    g < 0 && (g = 0);
    let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
    b > 255 && (b = 255);
    b < 0 && (b = 0);
    return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
  } else {
    return hexColor;
  }
};

/*** Return url params */
export function urlParams(url) {
  if (!url) {
    url = window.location.href
  }
  const urls = url.split('?')

  if (urls[1]) {
    const parameters = urls[1].split('#')[0].split('&')
    const paramDict = {}
    parameters.map(param => {
      const splitParam = param.split('=')
      paramDict[splitParam[0]] = decodeURI(splitParam.slice(1).join('='))
    })
    return paramDict
  } else {
    return {}
  }
}

/** Split params and parse to int **/
export const splitParams = (param, isInt = true) => {
  return param ? param.split(',').map(obj => {
    try {
      if (isInt) {
        return parseInt(obj)
      } else {
        return obj;
      }
    } catch (err) {
      return obj
    }
  }) : []
}


/*** Return url params */
export function stringToUrlAndParams(url) {
  if (!url) {
    url = window.location.href
  }
  const urls = url.split('?')

  if (urls[1]) {
    const parameters = urls[1].split('&')
    const paramDict = {}
    parameters.map(param => {
      const splitParam = param.split('=')
      paramDict[splitParam[0]] = splitParam.slice(1).join('=')
    })
    return [urls[0], paramDict]
  } else {
    return [urls[0], {}]
  }
}

/**
 * Change string to singular
 */
export function toSingular(str) {
  let singularStr = str
  if (str[str.length - 1] === 's') {
    singularStr = singularStr.substring(0, singularStr.length - 1);
  }
  return singularStr
}

/**
 * Json to xls
 * @param {Array} data Array of object.
 * @param {string} filename Filename of json
 * @param {string} sheetName Sheet name
 */
export function jsonToXlsx(data, filename, sheetName = "Sheet 1") {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  if (data[0]) {
    worksheet["!cols"] = Object.keys(data[0]).map(key => {
      return { wch: data.reduce((w, r) => Math.max(w, r[key]?.length), 10) }
    });
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

/** Return now date in UTC */
export function nowUTC() {
  const date = new Date();
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
      date.getUTCDate(), date.getUTCHours(),
      date.getUTCMinutes(), date.getUTCSeconds())
  )
}

/**
 * Json to xls
 * @param {Date} d
 */
export function formatDate(d, reverseDate = false, toUTC = false) {
  let month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
  if (toUTC) {
    month = '' + (d.getUTCMonth() + 1);
    day = '' + d.getUTCDate();
    year = d.getUTCFullYear();
  }

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;
  if (reverseDate) {
    return [day, month, year].join('-');
  } else {
    return [year, month, day].join('-');
  }
}

/** Update date from period and interval. */
export function updateDate(dt, amount, period) {
  switch (period) {
    case 'years':
      return dt.setFullYear(dt.getFullYear() + amount) && dt;
    case 'months':
      return dt.setMonth(dt.getMonth() + amount) && dt;
    case 'days':
      return dt.setDate(dt.getDate() + amount) && dt;
    case 'hours':
      return dt.setHours(dt.getHours() + amount) && dt;
    case 'minutes':
      return dt.setMinutes(dt.getMinutes() + amount) && dt;
    case 'seconds':
      return dt.setSeconds(dt.getSeconds() + amount) && dt;
  }
  return dt
}

/**
 * Json to xls
 * @param {Date} d
 */
export function formatDateTime(d, reverseDate = false, toUTC = false, showSecond = true) {
  let month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear(),
    hour = '' + d.getHours(),
    minute = '' + d.getMinutes(),
    second = '' + d.getSeconds();
  if (toUTC) {
    month = '' + (d.getUTCMonth() + 1);
    day = '' + d.getUTCDate();
    year = d.getUTCFullYear();
    hour = '' + d.getUTCHours();
    minute = '' + d.getUTCMinutes();
    second = '' + d.getUTCSeconds();
  }
  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;
  if (hour.length < 2)
    hour = '0' + hour;
  if (minute.length < 2)
    minute = '0' + minute;
  if (second.length < 2)
    second = '0' + second;

  const times = [hour, minute]
  if (showSecond) {
    times.push(second)
  }
  if (reverseDate) {
    return [day, month, year].join('-') + ' ' + times.join(':');
  } else {
    return [year, month, day].join('-') + ' ' + times.join(':');
  }
}

/***
 * Check if invalid date
 */
export function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

/***
 * Check if value is in options
 */
export function optionsToList(arr, value) {
  let usedArr = arr
  if (arr[0]?.constructor === Object) {
    usedArr = arr.map(_ => _.value)
  }
  return usedArr
}

/***
 * Check if value is in options
 */
export function isInOptions(arr, value) {
  return value && optionsToList(arr).includes(value)
}

/**
 * Replace \n with br
 */
export function replaceWithBr(html) {
  return html.replace(/\n/g, "<br />")
}

/***
 * Hex to RGBA
 */
export function hexToRGBList(hex, alpha) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
    alpha
  ]
}

/***
 * Parse DateTime
 */
export function parseDateTime(value) {
  try {
    if (!isNaN(value)) {
      if ([9, 10].includes(('' + value).length)) {
        return new Date(value * 1000).toISOString()
      } else if (('' + value).length === 13) {
        return new Date(value).toISOString()
      }
    }
  } catch (err) {
  }
  return value
}


/***
 * Slugify
 */
export function slugify(value) {
  return value.replaceAll(' ', '-').toLowerCase()
}


/*** Return domain. */
export function domain() {
  return location.protocol + '//' + location.host
}

/*** Random color ***/
export function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/*** Return unique list ***/
export function uniqueList(list) {
  const out = Array.from(new Set(list))
  out.sort()
  return out;
}

/*** Is valid email ***/
export function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

/*** Is valid email ***/
export function arrayToOptions(array) {
  if (!array[0]) {
    return []
  }
  return array[0].map((header, idx) => {
    const example = Array.from(new Set(array.slice(1).filter(_ => ![undefined, null, ''].includes(_[idx])).map(_ => _[idx])))
    return {
      label: header,
      value: header,
      help: '<span><i style="opacity: 0.6; font-size: 0.8rem">(' + example.slice(0, 2).map(_ => _).concat('...').join(', ') + ')</i></span>'
    }
  })
}

/*** Is ASCII ***/
export function isASCII(str) {
  return /^[\x00-\x7F]*$/.test(str);
}

export function toFloat(val) {
  if (typeof val === 'string' || val instanceof String) {
    if (!isNaN(parseFloat(val))) {
      return parseFloat(val)
    }
  }
  return val
}