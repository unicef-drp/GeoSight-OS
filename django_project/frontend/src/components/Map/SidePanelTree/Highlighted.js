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

import React from 'react';
import { useSelector } from "react-redux";
import _ from 'lodash';

/**
 * Description layer.
 * @param {string} text text.
 * @param {string} highlight highlight.
 * @param {boolean} isGroup isGroup.
 */
export default function Highlighted(
  { text = '', highlight = '', isGroup = false }
) {
  const { truncate_indicator_layer_name } = useSelector(state => state.dashboard.data);
  const ellipsisClass = truncate_indicator_layer_name ? 'Ellipsis' : '';
  if (!highlight.trim()) {
    return <span
      className={`LayerName ${ellipsisClass} ${isGroup ? 'Group' : ''}`}
      title={text}>
      {text}
    </span>
  }
  const regex = new RegExp(`(${_.escapeRegExp(highlight)})`, 'gi')
  const parts = text.split(regex)
  const words = text.split(' ');

  const getMarkClass = (part) => {
    for (const idx in words) {
      if (words[idx].toLowerCase().startsWith(part.toLowerCase())) {
        return 'prefix';
      } else if (words[idx].toLowerCase().endsWith(part.toLowerCase())) {
        return 'suffix';
      }
    }
  }

  return (
    <span
      className={`LayerName ${ellipsisClass} ${isGroup ? 'Group' : ''}`}
      title={text}>
      <div>
        {
          parts.filter(part => part).map((part, i) => (
            regex.test(part) ?
              <mark key={i} className={getMarkClass(part)}>{part}</mark> :
              <span
                key={i}
                className={i === parts.length - 1 ? 'LastPart' : ''}>
              {part}
            </span>
          ))
        }
      </div>
    </span>
  )
}
