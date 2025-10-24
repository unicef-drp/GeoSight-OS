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
 * __author__ = 'zakki@kartoza.com'
 * __date__ = '30/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useMemo, useState } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { debounce } from "@mui/material/utils";
import CustomPopover from "../../CustomPopover";
import { hexToRgba, removeHexAlpha, rgbaToHex } from "../../../utils/color";

import "./style.scss";

export interface Props {
  color: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  hideInput?: boolean;
}

/**
 * Color Selector
 * @param color Color value in hex
 * @param onChange onChange function when color is changed
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function ColorSelector({
  color,
  onChange,
  name,
  disabled,
  fullWidth,
  hideInput,
}: Props) {
  const className = fullWidth ? "ColorConfig FullWidth" : "ColorConfig";
  const [colorInput, setColorInput] = useState<string>(color);
  const rgba = (
    colorInput
      ? hexToRgba(colorInput, 1, "object")
      : {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        }
  ) as {
    r: number;
    g: number;
    b: number;
    a: number;
  };

  const update = useMemo(
    () =>
      debounce((newValue) => {
        if (newValue !== color) {
          // @ts-ignore
          onChange({
            // @ts-ignore
            target: {
              value: newValue,
            },
          });
        }
      }, 400),
    [],
  );

  useEffect(() => {
    setColorInput(color);
  }, [color]);

  useEffect(() => {
    update(colorInput);
  }, [colorInput]);

  const handleColorChange = (colorResult: ColorResult) => {
    // @ts-ignore
    setColorInput(rgbaToHex(colorResult.rgb));
  };

  return (
    <div className={className}>
      {hideInput ? null : (
        // @ts-ignore
        <input
          type="text"
          name={name ? name : null}
          disabled={!!disabled}
          value={colorInput}
          onChange={(evt: any) => setColorInput(evt.target.value)}
          spellCheck="false"
        />
      )}
      <div className="ColorConfigPreview">
        <CustomPopover
          showCloseButton={true}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          preventDefault={true}
          Button={
            <input
              type="color"
              value={removeHexAlpha(colorInput)}
              /* ts-ignore */
              style={{ opacity: rgba.a }}
            />
          }
        >
          <SketchPicker color={colorInput} onChange={handleColorChange} />
        </CustomPopover>
      </div>
    </div>
  );
}
