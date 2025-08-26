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
 * __date__ = '26/08/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, { Fragment, memo } from "react";

import { capitalize, numberWithCommas } from "../../../utils/main";
import { WidgetConfig } from "../../../types/Widget";
import { analyzeData } from "../../../utils/analysisData";
import { SortMethodTypes } from "../Definition";
import CircularProgress from "@mui/material/CircularProgress";

export interface Props {
  data: any[];
  config: WidgetConfig;
  groupBy: string;
  sortBy: string;
  fields: string[];
}

function SummaryGroup({ data, config, groupBy, sortBy, fields }: Props) {
  const { aggregation, sort } = config;
  const { method, useTopN, topN } = sort;

  /**Return value of widget */
  function getValue() {
    if (!data) {
      return (
        <div className="dashboard__right_side__loading">
          <CircularProgress />
        </div>
      );
    }

    // Render tables
    let byGroup: any = {};
    data.forEach(function (rowData: any) {
      const rowValue = parseFloat(rowData.value);
      let groupName = rowData[groupBy];

      if (!isNaN(rowValue)) {
        if (!byGroup[groupName]) {
          byGroup[groupName] = { values: [] };
          fields.map((field) => {
            byGroup[groupName][field] = rowData[field];
          });
        }
        byGroup[groupName].values.push(parseFloat(rowData.value));
      }
    });
    // ---------------------------------
    // Calculate the value
    // ---------------------------------
    for (let key in byGroup) {
      // @ts-ignore
      byGroup[key].value = analyzeData(aggregation.method, byGroup[key].values);
    }

    // ---------------------------------
    // Sort
    // ---------------------------------
    let sorted = Object.keys(byGroup).map(function (key) {
      return [key, byGroup[key]];
    });
    sorted.sort(function (first, second) {
      if (sortBy.toLowerCase() === "value") {
        return first[1].value - second[1].value;
      } else {
        return first[1][sortBy].localeCompare(second[1][sortBy]);
      }
    });
    if (method === SortMethodTypes.DESC) {
      sorted = sorted.reverse();
    }

    // Using topN
    if (useTopN) {
      sorted = sorted.slice(0, topN);
    }
    // ---------------------------------
    return (
      <table>
        <thead>
          <tr>
            {fields.map((field) => (
              <th>{capitalize(field)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((value, index) => (
            <tr key={index}>
              {fields.map((field) => {
                if (field.toLowerCase() === "value") {
                  return <td>{numberWithCommas(value[1][field])}</td>;
                }
                return <td>{value[1][field]}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <Fragment>
      <div className="widget__sgw">{getValue()}</div>
    </Fragment>
  );
}

export default memo(SummaryGroup);
