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

import React, { useEffect, useRef } from "react";
import { isArray } from "chart.js/helpers";
import ReactAutocomplete, {
  createFilterOptions,
} from "@mui/material/Autocomplete";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const defaultFilter = createFilterOptions();

export default function Autocomplete({ ...props }) {
  const isTyping = useRef(false);
  useEffect(() => {
    try {
      const syntheticEvent = { target: { getAttribute: () => null } };
      const options = props.options.filter(
        (option) => !["select all", "loading"].includes(option.toLowerCase()),
      );
      if (props.multiple) {
        if (
          isArray(props.value) &&
          props.value.length &&
          props.onChange &&
          options.length
        ) {
          const filtered = props.value.filter((v) => options.includes(v));
          if (filtered.length !== props.value.length) {
            props.onChange(syntheticEvent, filtered, "selectOption");
          }
        }
      } else {
        if (
          !isArray(props.value) &&
          props.value &&
          !options.includes(props.value)
        ) {
          if (options.length && props.onChange) {
            props.onChange(syntheticEvent, options[0], "selectOption");
          }
        }
      }
    } catch (err) {}
  }, [props.inputName]);

  return (
    <ReactAutocomplete
      {...props}
      className={
        "ReactAutocomplete " + (props.className ? props.className : "")
      }
      popupIcon={<ArrowDropDownIcon />}
      filterOptions={
        props.filterOptions ??
        ((options, state) => {
          if (!isTyping.current) return options;
          return defaultFilter(options, state);
        })
      }
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
