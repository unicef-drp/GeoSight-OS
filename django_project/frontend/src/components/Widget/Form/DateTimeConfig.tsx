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
 * __date__ = '19/08/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { FormControl, Radio } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
// @ts-ignore
import DatePicker from "react-datepicker";
import React from "react";
import { DateTimeConfig } from "../../../types/Widget";
import { TimeType } from "../Definition";
import { SelectWithList } from "../../Input/SelectWithList";
import { INTERVALS } from "../../../utils/Dates";
import { RemoveIcon } from "../../Icons";
import { useSelector } from "react-redux";

export interface Props {
  dateTimeType: string;
  setDateTimeType: (dateTimeType: string) => void;
  dateTimeConfig: DateTimeConfig;
  setDateTimeConfig: (dateTimeConfig: DateTimeConfig) => void;
}

export function DateTimeConfigForm({
  dateTimeType,
  dateTimeConfig,
  setDateTimeType,
  setDateTimeConfig,
}: Props) {
  // @ts-ignore
  const { default_time_mode } = useSelector((state) => state.dashboard.data);
  const { use_only_last_known_value } = default_time_mode;
  return (
    <FormControl className="MuiForm-RadioGroup">
      <FormLabel className="MuiInputLabel-root">Date/Time</FormLabel>
      <RadioGroup
        className="Horizontal"
        value={dateTimeType}
        onChange={(evt) => {
          setDateTimeType(evt.target.value);
        }}
      >
        {Object.keys(TimeType).map((key) => {
          return (
            <FormControlLabel
              disabled={use_only_last_known_value}
              key={key}
              control={<Radio />}
              /*@ts-ignore*/
              value={TimeType[key]}
              /*@ts-ignore*/
              label={TimeType[key]}
            />
          );
        })}
      </RadioGroup>
      {dateTimeType === TimeType.PREDEFINED ? (
        <div className="MuiForm-SubGroup">
          <div className="CustomDateFilterValues BasicFormSection">
            <SelectWithList
              list={[INTERVALS.DAILY, INTERVALS.MONTHLY, INTERVALS.YEARLY]}
              menuPlacement={"top"}
              required={true}
              value={dateTimeConfig.interval}
              onChange={(evt: any) => {
                setDateTimeConfig({
                  ...dateTimeConfig,
                  interval: evt.value,
                });
              }}
              isDisabled={use_only_last_known_value}
            />
            <div className="Separator">FROM</div>
            <DatePicker
              /* @ts-ignore */
              showTimeSelect
              dateFormat="dd-MM-yyyy hh:mm:ss"
              selected={
                dateTimeConfig.minDateFilter
                  ? new Date(dateTimeConfig.minDateFilter)
                  : null
              }
              maxDate={
                dateTimeConfig.maxDateFilter
                  ? new Date(dateTimeConfig.maxDateFilter)
                  : null
              }
              onChange={(date: any) => {
                setDateTimeConfig({
                  ...dateTimeConfig,
                  minDateFilter: new Date(date).toISOString(),
                });
              }}
              disabled={use_only_last_known_value}
            />
            <div className="Separator">
              <RemoveIcon />
            </div>
            <div className="react-datepicker-wrapper">
              <DatePicker
                /* @ts-ignore */
                showTimeSelect
                dateFormat="dd-MM-yyyy hh:mm:ss"
                selected={
                  dateTimeConfig.maxDateFilter
                    ? new Date(dateTimeConfig.maxDateFilter)
                    : null
                }
                minDate={new Date(dateTimeConfig.minDateFilter)}
                onChange={(date: any) => {
                  let newDate = null;
                  if (date) {
                    newDate = new Date(date).toISOString();
                  }
                  setDateTimeConfig({
                    ...dateTimeConfig,
                    maxDateFilter: newDate,
                  });
                }}
                disabled={use_only_last_known_value}
              />
              <div className="helptext" style={{ width: "100%" }}>
                Make the max date empty to make the data filtered up to `today`.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </FormControl>
  );
}
