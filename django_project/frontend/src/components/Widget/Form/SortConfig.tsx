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

// @ts-ignore
import DatePicker from "react-datepicker";
import React from "react";
import { SortConfig } from "../../../types/Widget";
import FormControlLabel from "@mui/material/FormControlLabel";
import { FormControl, Radio } from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import Checkbox from "@mui/material/Checkbox";
import { useTranslation } from "react-i18next";
import FormLabel from "@mui/material/FormLabel";
import { SortMethodTypes, SortTypes } from "../Definition";

export interface Props {
  data: SortConfig;
  setData: (data: SortConfig) => void;
}

export function SortConfigForm({ data, setData }: Props) {
  const { t } = useTranslation();
  console.log(data);
  return (
    <FormControl className="MuiForm-RadioGroup">
      <FormLabel className="MuiInputLabel-root">{t("Sort by")}</FormLabel>
      <div className={"WidgetConfigSection"}>
        <RadioGroup
          row
          value={data.field}
          onChange={(evt) => {
            setData({ ...data, field: evt.target.value });
          }}
        >
          {Object.keys(SortTypes).map((key) => {
            return (
              <FormControlLabel
                key={key}
                control={<Radio />}
                /*@ts-ignore*/
                value={SortTypes[key]}
                /*@ts-ignore*/
                label={SortTypes[key]}
              />
            );
          })}
        </RadioGroup>
        <RadioGroup
          row
          value={data.method}
          onChange={(evt) => {
            setData({ ...data, method: evt.target.value });
          }}
        >
          {Object.keys(SortMethodTypes).map((key) => {
            return (
              <FormControlLabel
                key={key}
                control={<Radio />}
                /*@ts-ignore*/
                value={SortMethodTypes[key]}
                /*@ts-ignore*/
                label={SortMethodTypes[key]}
              />
            );
          })}
        </RadioGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.useTopN}
              onChange={(evt) => {
                setData({ ...data, useTopN: evt.target.checked });
              }}
            />
          }
          label={t("Top N")}
        />
        <input
          style={{ width: "50px" }}
          disabled={!data.useTopN}
          type="number"
          onChange={(event) => {
            setData({ ...data, topN: parseInt(event.target.value) });
          }}
          value={data.topN}
        />
      </div>
    </FormControl>
  );
}
