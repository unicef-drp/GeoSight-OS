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
 * __date__ = '08/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useRef } from "react";
import { isArray } from "chart.js/helpers";
import ReactAutocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Grow, Popper } from "@mui/material";

const defaultFilter = createFilterOptions();

export default function Autocomplete({ ...props }) {
  const isTyping = useRef(false);

  if (!isArray(props.value)) {
    if (props.value && !props.options.includes(props.value)) {
      props.options.push(props.value);
    }
  }
  return (
    <ReactAutocomplete
      {...props}
      className={
        "ReactAutocomplete " + (props.className ? props.className : "")
      }
      popupIcon={<ArrowDropDownIcon />}
      filterOptions={props.filterOptions ?? ((options, state) => {
        if (!isTyping.current) return options;
        return defaultFilter(options, state);
      })}
      onInputChange={(event, value, reason) => {
        isTyping.current = reason === "input";
        props.onInputChange?.(event, value, reason);
      }}
      onChange={(event, value, reason, details) => {
        isTyping.current = false;
        props.onChange?.(event, value, reason, details);
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 0,
            borderRadius: 0,
          },
        },
      }}
    />
  );
}
