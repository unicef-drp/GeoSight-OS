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

import React from "react";
import { useTranslation } from "react-i18next";
import { FormControl, Radio } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Checkbox from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import { AGGREGATION_TYPES } from "../../../utils/analysisData";
import { AggregationConfig } from "../../../types/Widget";

export interface Props {
  data: AggregationConfig;
  setData: (data: AggregationConfig) => void;
}

export function AggregationConfigForm({ data, setData }: Props) {
  const { t } = useTranslation();
  return (
    <FormControl className="MuiForm-RadioGroup">
      <FormLabel className="MuiInputLabel-root">{t("Aggregation")}</FormLabel>
      <div className={"WidgetConfigSection"}>
        <RadioGroup
          row
          value={data.method}
          onChange={(evt) => {
            setData({ ...data, method: evt.target.value });
          }}
        >
          {Object.keys(AGGREGATION_TYPES).map((key) => {
            return (
              <FormControlLabel
                key={key}
                control={<Radio />}
                /*@ts-ignore*/
                value={AGGREGATION_TYPES[key]}
                /*@ts-ignore*/
                label={AGGREGATION_TYPES[key]}
              />
            );
          })}
        </RadioGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.useDecimalPlace}
              onChange={(evt) => {
                setData({ ...data, useDecimalPlace: evt.target.checked });
              }}
            />
          }
          label={t("Decimal places")}
        />
        <input
          style={{ width: "50px" }}
          disabled={!data.useDecimalPlace}
          type="number"
          onChange={(event) => {
            setData({ ...data, decimalPlace: parseInt(event.target.value) });
          }}
          value={data.decimalPlace}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={data.useAutoUnits}
              onChange={(evt) => {
                setData({ ...data, useAutoUnits: evt.target.checked });
              }}
            />
          }
          label={t("Auto units")}
        />
      </div>
    </FormControl>
  );
}
