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
   GENERAL WIDGET FOR SHOWING SUMMARY OF DATA
   ========================================================================== */

import React, { Fragment } from 'react';
import { useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";

import { DEFINITION } from "../../index"
import { numberWithCommas } from '../../../../utils/main'

/**
 * General widget to show summary of data.
 * @param {int} idx Index of widget
 * @param {list} data List of data {value, date}
 * @param {object} widgetData Widget Data
 */
export default function Index(
  { idx, data, widgetData }
) {
  const { name, config } = widgetData
  const { operation, property_2 } = config

  const geometries = useSelector(state => state.geometries);

  /**
   * Return value of widget
   * @returns {JSX.Element}
   */
  function getValue() {
    if (data !== null) {
      switch (operation) {
        case DEFINITION.WidgetOperation.SUM:
          let maxValue = 0;
          let byGroup = {}
          data.forEach(function (rowData) {
            const rowValue = parseFloat(rowData.value);
            let groupName = rowData[property_2];

            // Change the name if geometry code
            if (property_2 === 'geometry_code') {
              // We need to check max value for all group
              for (const [level, geometriesLevel] of Object.entries(geometries)) {
                if (geometriesLevel[groupName]) {
                  groupName = geometriesLevel[groupName].label;
                }
              }
            }

            if (!isNaN(rowValue)) {
              if (!byGroup[groupName]) {
                byGroup[groupName] = {
                  value: 0,
                  perc: 0
                }
              }
              byGroup[groupName].value += parseFloat(rowData.value)
            }
          })

          // We need to check max value for all group
          for (const [key, value] of Object.entries(byGroup)) {
            if (maxValue < value.value) {
              maxValue = value.value
            }
          }

          // Get percentage of values
          for (const [key, value] of Object.entries(byGroup)) {
            value.perc = ((value.value / maxValue) * 80) + 20;
          }

          // Sort group
          var sorted = Object.keys(byGroup).map(function (key) {
            return [key, byGroup[key]];
          });
          sorted.sort(function (first, second) {
            return second[1].value - first[1].value;
          });
          return <table>
            <tbody>
            {
              sorted.map((value, index) => (
                <tr key={index} className='widget__sgw__row'>
                  <td className='widget__sgw__row__name'>{value[0]}</td>
                  <td>
                    <div
                      style={{ width: value[1].perc + '%' }}>{numberWithCommas(value[1].value)}</div>
                  </td>
                </tr>
              ))
            }
            </tbody>
          </table>
        default:
          return <div className='widget__error'>Operation Not Found</div>;
      }
    }
    return <div className='dashboard__right_side__loading'>
      <CircularProgress/>
    </div>
  }

  return (
    <Fragment>
      <div className='widget__sw widget__sgw'>
        <div className='widget__gw__title'>{name}</div>
        <div className='widget__content'>{getValue()}</div>
      </div>
    </Fragment>
  )
}
