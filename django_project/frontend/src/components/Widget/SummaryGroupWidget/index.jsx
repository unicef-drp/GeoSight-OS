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

import React, { Fragment, useState } from 'react';
import { useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { DEFINITION } from "../index"
import { formatNumberSmart, numberWithCommas } from '../../../utils/number'
import './style.scss'

/**
 * General widget to show summary of data.
 * @param {int} idx Index of widget
 * @param {list} data List of data {value, date}
 * @param {object} widgetData Widget Data
 */
export default function Index(
  { data, widgetData, compactNumbers = false }
) {
  const { name, config } = widgetData
  const { operation, property_2 } = config

  // Sorting state
  const [sortBy, setSortBy] = useState('value'); // 'value' | 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const {
    referenceLayer
  } = useSelector(state => state.dashboard.data);
  const geometries = useSelector(state => state.datasetGeometries[referenceLayer?.identifier]);

  /**
   * Return value of widget
   * @returns {JSX.Element}
   */
  function getValue() {
    if (data !== null && geometries) {
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

          // Format values if compactNumbers is enabled
          if (compactNumbers) {
            for (const [key, value] of Object.entries(byGroup)) {
              value.value = formatNumberSmart(value.value);
            }
          } else {
            // Format with commas if not using compact numbers
            for (const [key, value] of Object.entries(byGroup)) {
              value.value = numberWithCommas(value.value);
            }
          }

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

          // Sort group based on selected options
          var sorted = Object.keys(byGroup).map(function (key) {
            return [key, byGroup[key]];
          });
          
          // Sort by selected criteria
          if (sortBy === 'value') {
            sorted.sort(function (first, second) {
              const value1 = first[1].value;
              const value2 = second[1].value;
              return sortOrder === 'asc' ? value1 - value2 : value2 - value1;
            });
          } else {
            sorted.sort(function (first, second) {
              const name1 = first[0];
              const name2 = second[0];
              return sortOrder === 'asc' ? name1.localeCompare(name2) : name2.localeCompare(name1);
            });
          }
          return <table>
            <tbody>
            {
              sorted.map((value, index) => (
                <tr key={index} className='widget__sgw__row'>
                  <td className='widget__sgw__row__name'>{value[0]}</td>
                  <td>
                    <div
                      style={{ width: value[1].perc + '%' }}>{value[1].value}</div>
                  </td>
                </tr>
              ))
            }
            </tbody>
          </table>
        }
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
        <div className='widget__title'>{name}</div>
        <div className='widget__content'>
          <div className='widget__sgw__sort-controls'>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="value">Value</MenuItem>
                <MenuItem value="name">Geographical Name</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={sortOrder}
                label="Sort Order"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </div>
          {getValue()}
        </div>
      </div>
    </Fragment>
  )
}
