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
 * __date__ = '16/06/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React from "react";
import Slider from "@mui/material/Slider";

export interface Props {
  value: number;
  onChange: (value: number) => void;
  onChangeCommitted: (value: number) => void;
}

export function Transparency({ value, onChange, onChangeCommitted }: Props) {
  return (
    <div className="Transparency" style={{ padding: "0 1.5rem" }}>
      <Slider
        value={value}
        step={1}
        min={0}
        max={100}
        onChange={(event) => {
          // @ts-ignore
          onChange(event.target.value);
        }}
        onChangeCommitted={() => {
          // @ts-ignore
          onChangeCommitted(value);
        }}
        valueLabelDisplay="on"
        /* STYLES */
        sx={{
          height: 4,
          "& .MuiSlider-valueLabel": {
            background: "none",
            color: "white",
            top: "0",
            transform: "translateY(0) scale(1) !important",
            fontSize: 10,
          },
          "& .MuiSlider-thumb": {
            height: 20,
            width: 30,
            borderRadius: 4,
            backgroundColor: "var(--primary-color)",
            "&:hover": {
              boxShadow: "0px 0px 0px 4px rgba(25, 118, 210, 0.1)",
            },
            "&.Mui-focusVisible": {
              boxShadow: "0px 0px 0px 4px rgba(25, 118, 210, 0.1)",
            },
            "&.Mui-active": {
              boxShadow: "0px 0px 0px 6px rgba(25, 118, 210, 0.1)",
            },
          },
          "& .MuiSlider-track": {
            borderRadius: 4,
            backgroundColor: "var(--primary-color)",
            opacity: 0.5,
          },
          "& .MuiSlider-rail": {
            borderRadius: 4,
            backgroundColor: "#aaa",
          },
        }}
      />
    </div>
  );
}
