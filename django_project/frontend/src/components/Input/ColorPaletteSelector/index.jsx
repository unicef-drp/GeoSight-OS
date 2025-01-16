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
import { SelectWithList } from "../SelectWithList";
import Grid from "@mui/material/Grid";
import Checkbox from "@mui/material/Checkbox";
import { dictDeepCopy } from "../../../utils/main";
import { updateColorPaletteData } from "../../../utils/Style";

import './style.scss';

/**
 * Color Palette Selector
 * @param colorPalette Color palette value
 * @param colorPaletteReverse Color palette value
 * @param onChange onChange function when color is changed
 * @param onChangeReverse onChangeReverse function when reverse is changed
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function ColorPaletteSelector(
  { colorPalette, colorPaletteReverse, onChange, onChangeReverse, ...props }
) {
  const [colorPalettes, setColorPalettes] = useState([]);

  // On init
  useEffect(() => {
    (
      async () => {
        await updateColorPaletteData().then(response => {
          setColorPalettes(response);
          if (!colorPalette) {
            onChange(preferences.default_color_palette ? preferences.default_color_palette : response[0]?.id)
          }
        })
      }
    )()
  }, [])

  return <div className="BasicFormSection">
    <Grid container spacing={2}>
      <Grid item xs={props.reverseInput ? 6 : 12}>
        <div className='BasicForm-Title'>Palette</div>
        <SelectWithList
          className={'Color-Palette-Input'}
          list={colorPalettes}
          menuPlacement={props.menuPlacement ? props.menuPlacement : 'top'}
          value={colorPalettes.find(color => color.id === colorPalette)}
          onChange={evt => {
            onChange(evt.value.id)
          }}
          isDisabled={props.isDisabled}
          getOptionLabel={(option) => {
            const colors = dictDeepCopy(option.data.colors)
            if (colorPaletteReverse) {
              colors.reverse()
            }
            return <div className='Color-Palette-Option'>
              {
                colors.map(color => {
                  return <div
                    key={color}
                    style={{ backgroundColor: color }}></div>
                })
              }
            </div>
          }}
          keepData={props.keepData}
        />
        <input
          type="text" name="color_palette" value={colorPalette}
          hidden={true}
          onChange={evt => {
          }}/>
      </Grid>
      {
        props.reverseInput ?
          <Grid item xs={6}>
            <div className='BasicForm-Title'>Reverse</div>
            <Checkbox
              name='color_palette_reverse'
              checked={colorPaletteReverse ? colorPaletteReverse : false}
              onClick={
                _ => {
                  onChangeReverse(!colorPaletteReverse)
                }
              }/>
          </Grid> : null
      }
    </Grid>
  </div>
}