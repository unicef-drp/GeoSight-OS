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
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import RadioGroup from "@mui/material/RadioGroup";
import { SortConfig } from "../../../types/Widget";
import { SortMethodTypes, SortTypes } from "../Definition";
// @ts-ignore
import { SortAscIcon, SortDescIcon } from "../../Icons";

export interface Props {
  data: SortConfig;
  setData: (data: SortConfig) => void;
}

/** Sort by: field, order (two icon buttons) and top N, on one line. */
export function SortConfigForm({ data, setData }: Props) {
  const { t } = useTranslation();
  const fieldLabels: Record<string, string> = {
    [SortTypes.VALUE]: t("admin.widget.sortValue"),
    [SortTypes.NAME]: t("admin.widget.sortName"),
    [SortTypes.CODE]: t("admin.widget.sortCode"),
  };
  const orders = [
    {
      value: SortMethodTypes.ASC,
      label: t("admin.widget.sortAscending"),
      Icon: SortAscIcon,
    },
    {
      value: SortMethodTypes.DESC,
      label: t("admin.widget.sortDescending"),
      Icon: SortDescIcon,
    },
  ];
  return (
    <FormControl className="MuiForm-RadioGroup SortConfig">
      <FormLabel className="MuiInputLabel-root" id="widget-sort-label">
        {t("Sort by")}
      </FormLabel>
      <div className="WidgetConfigSection SortConfig-Line">
        <RadioGroup
          row
          aria-labelledby="widget-sort-label"
          data-testid="sort-field"
          value={data.field}
          onChange={(evt) => setData({ ...data, field: evt.target.value })}
        >
          {Object.values(SortTypes).map((value) => (
            <FormControlLabel
              key={value}
              control={<Radio />}
              value={value}
              label={fieldLabels[value]}
            />
          ))}
        </RadioGroup>
        <div className="SortConfig-Order" role="group">
          {orders.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={
                "SortConfig-OrderButton" +
                (data.method === value ? " Selected" : "")
              }
              aria-label={label}
              title={label}
              aria-pressed={data.method === value}
              data-testid={`sort-${value.toLowerCase()}`}
              onClick={() => setData({ ...data, method: value })}
            >
              <Icon />
            </button>
          ))}
        </div>
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
          data-testid="sort-topn"
          aria-label={t("Top N")}
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
