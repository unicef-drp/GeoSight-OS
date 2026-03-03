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
import React, { Fragment, memo, useEffect, useState } from "react";
import { Widget } from "../../../types/Widget";
import RequestParameter from "./RequestParameter";
import { IndicatorData, ParameterProps } from "../../../class/IndicatorData";
import { Session } from "../../../utils/Sessions";
import { useSelector } from "react-redux";
import { Indicator } from "../../../types/Indicator";
import { SortMethodTypes, SortTypes } from "../Definition";
import { formatNumber } from "../../../utils/Utilities";
import { capitalize } from "../../../utils/main";
import CircularProgress from "@mui/material/CircularProgress";

export interface DataValueProps {
  name: string;
  value: number | null;
}

export interface DataProps {
  fetching: boolean;
  value: DataValueProps[] | null;
  error: string | null;
}

export interface Props {
  widget: Widget;
  groupBy: string;
  sortBy: string;
  fields: string[];
}

function SummaryGroup({ widget, groupBy, sortBy, fields }: Props) {
  const { config } = widget;
  const { aggregation, operation, sort } = config;
  const { useTopN, topN } = sort;
  const method = operation ? operation : aggregation?.method;

  const indicators =
    // @ts-ignore
    useSelector((state) => state.dashboard.data?.indicators);

  const [parameters, setParameters] = useState<ParameterProps>({});
  const [value, setValue] = useState<DataProps>({
    fetching: true,
    value: null,
    error: null,
  });

  // Fetch some default data
  useEffect(() => {
    (async () => {
      try {
        if (!indicators) {
          return;
        }
        if (parameters["indicator_id__in"] === undefined) {
          return;
        }
        // Don't request if parameter with date
        if (!parameters["date__gte"]) {
          return;
        }
        if (!parameters["indicator_id__in"]?.length) {
          setValue({
            fetching: false,
            value: null,
            error: "No indicators found.",
          });
          return;
        }
        const session = new Session("Widget request " + widget.id);
        const output = await new IndicatorData().statistic({
          ...parameters,
          latest_value: true,
          aggregate_methods: [method],
          group_by: groupBy,
        });
        if (!session.isValid) {
          return;
        }
        if (groupBy === "indicator_id") {
          output.map(
            (row: { indicator_id: number; value: number; name: string }) => {
              const indicator = indicators.find(
                (indicator: Indicator) => indicator.id === row["indicator_id"],
              );
              if (indicator) {
                if (sort.field === SortTypes.CODE) {
                  row["name"] = indicator.shortcode;
                } else {
                  row["name"] = indicator.name;
                }
              }
              // @ts-ignore
              row.value = row[method.toLowerCase()];
            },
          );
        } else {
          output.map((row: any) => {
            row.name = row[groupBy];
            row.value = row[method.toLowerCase()];
          });
        }
        setValue({
          fetching: false,
          value: output,
          error: null,
        });
      } catch (err) {
        setValue({
          fetching: false,
          value: null,
          error: err.toString(),
        });
      }
    })();
  }, [parameters, indicators]);

  const ViewOutput = () => {
    if (value.fetching) {
      return (
        <div className="dashboard__right_side__loading">
          <CircularProgress />
        </div>
      );
    }
    if (value.error) {
      return <div className="error">{value.error}</div>;
    }

    // Render tables
    let byGroup: any = {};
    value.value.forEach(function (rowData: any) {
      const rowValue = parseFloat(rowData.value);
      let groupName = rowData.name;

      if (!isNaN(rowValue)) {
        if (!byGroup[groupName]) {
          byGroup[groupName] = { value: null, name: rowData.name };
        }
        byGroup[groupName].value = parseFloat(rowData.value);
      }
    });

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
        return first[1]["name"].localeCompare(second[1]["name"]);
      }
    });
    if (sort.method === SortMethodTypes.DESC) {
      sorted = sorted.reverse();
    }

    // Using topN
    if (useTopN) {
      sorted = sorted.slice(0, topN);
    }
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
              {["name", "value"].map((field) => {
                if (field.toLowerCase() === "value") {
                  return (
                    <td>
                      {formatNumber(
                        value[1][field],
                        aggregation?.useDecimalPlace
                          ? aggregation?.decimalPlace
                          : 0,
                        aggregation?.useAutoUnits,
                      )}
                    </td>
                  );
                }
                return <td>{value[1][field]}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <Fragment>
      <RequestParameter
        widget={widget}
        setParameter={(newParameters: ParameterProps) => {
          if (JSON.stringify(parameters) !== JSON.stringify(newParameters)) {
            setParameters(newParameters);
          }
        }}
      />
      <div className="widget__sgw">
        <ViewOutput />
      </div>
    </Fragment>
  );
}

export default memo(SummaryGroup);
