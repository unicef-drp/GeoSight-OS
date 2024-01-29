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
 * __date__ = '11/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useState } from 'react';
import CircularProgress from "@mui/material/CircularProgress";
import { fetchingData } from "../../../Requests";
import CustomPopover from "../../CustomPopover";

import './style.scss';

/**
 * Color Palette Selector in PopOver
 */
export default function ColorPalettePopover({ onSelected, ...props }) {
  const [colorPalettes, setColorPalettes] = useState(null);


  // On init
  useEffect(() => {
    (
      async () => {
        await fetchingData(
          `/api/color/palette/list`,
          {}, {}, (response, error) => {
            setColorPalettes(response);
          }
        )
      }
    )()
  }, [])

  return <CustomPopover
    {...props}
  >
    <div className='ColorPalettePopover' style={{ padding: "1rem" }}>
      {
        colorPalettes ? <>
            {
              colorPalettes.map(colorPalette => {
                return <div
                  key={colorPalette.id}
                  className='Color-Palette-Option'
                  onClick={() => onSelected(colorPalette)}
                >
                  {
                    colorPalette.colors.map(color => {
                      return <div
                        key={color}
                        style={{ backgroundColor: color }}
                      />
                    })
                  }
                </div>
              })
            }
          </> :
          <div className='Throbber'>
            <CircularProgress/>
          </div>
      }
    </div>
  </CustomPopover>
}