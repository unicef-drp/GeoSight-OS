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
 * __author__ = 'fpsampayo@geomatico.es'
 * __date__ = '31/10/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

import React, { Fragment } from 'react';
import { FormControl } from "@mui/material";
import ColorPaletteStyleConfig, {
  QUANTITATIVE_TYPE
} from "../../../Style/Form/DynamicStyleConfig/Palette";
import { dictDeepCopy } from "../../../../../utils/main";
import {
  dynamicClassificationChoices
} from "../../../Style/Form/DynamicStyleConfig";

/**
 * Map Config component.
 */
export default function RasterCogLayer(
  {
    data, setData, useOverride
  }
) {
  const { styles } = dictDeepCopy(data);
  return <>
    <div className='Style'>
      <label className="form-label required" htmlFor="group">
        Band values
      </label>
      <FormControl
        className="BasicFormSection">
        <input
          placeholder='Minimum band' type='number'
          value={styles.min_band}
          onChange={evt => {
            setData({
              ...data,
              styles: {
                ...styles,
                min_band: evt.target.value
              }
            })
          }}
          style={{ width: "fit-content", flexGrow: 1 }}
        />
        <span> - </span>
        <input
          placeholder='Maximum band' type='number'
          value={styles.max_band}
          onChange={evt => {
            setData({
              ...data,
              styles: {
                ...styles,
                max_band: evt.target.value
              }
            })
          }}
          style={{ width: "fit-content", flexGrow: 1 }}
        />
        <br/>
        <br/>
        {/*  Palette */}
        <ColorPaletteStyleConfig
          styleType={QUANTITATIVE_TYPE}
          styleConfig={styles ? styles : {}}
          setStyleConfig={
            (newStyles) => {
              if (newStyles.min_band === undefined) {
                newStyles.min_band = 0;
                newStyles.max_band = 100;
                newStyles.dynamic_class_num = 7;
                newStyles.dynamic_classification = dynamicClassificationChoices[0].value;
              }
              setData({
                ...data,
                styles: {
                  ...styles,
                  ...newStyles
                }
              })
            }
          }
          options={
            [
              {
                label: dynamicClassificationChoices[0].label.replace('.', ''),
                value: dynamicClassificationChoices[0].value,
              }
            ]
          }
        />
      </FormControl>
    </div>
  </>
}
