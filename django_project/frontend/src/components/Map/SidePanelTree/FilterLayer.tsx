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
 * __date__ = '09/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "@mui/material/utils";
import TextField from "@mui/material/TextField";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { MagnifyIcon } from "../../Icons";

export interface Props {
  placeholder: string;
  inputChanged: (value: string) => void;
}

export default function FilterLayer({ placeholder, inputChanged }: Props) {
  const [value, setValue] = useState("");

  const update = useMemo(
    () =>
      debounce((input) => {
        inputChanged(input);
      }, 400),
    [],
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    update(value);
  }, [value]);

  return (
    <TextField
      className="PanelSearchBox"
      variant={"outlined"}
      value={value}
      onKeyPress={(e) => {
        e.key === "Enter" && e.preventDefault();
      }}
      placeholder={placeholder ? placeholder : ""}
      onChange={onChange}
      InputProps={{
        endAdornment: (
          <IconButton
            type="button"
            sx={{ p: "10px" }}
            aria-label="search"
            disabled={value.length === 0}
            onClick={() => setValue("")}
          >
            {value ? <ClearIcon /> : <MagnifyIcon />}
          </IconButton>
        ),
      }}
    />
  );
}
