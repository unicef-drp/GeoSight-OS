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
 * __date__ = '31/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";

import ColorPaletteSelector
  from "../../../../../components/Input/ColorPaletteSelector";
import { Select } from "../../../../../components/Input";

export const dynamicClassificationChoices = dynamicClassification.map(type => {
  return {
    value: type[0],
    label: type[1].replace('.', '')
  }
})

export const QUALITATIVE_TYPE = 'Dynamic qualitative style.'
export const QUANTITATIVE_TYPE = 'Dynamic quantitative style.'

/*** Style section ***/
export default function ColorPaletteStyleConfig(
  {
    styleType,
    styleConfig,
    setStyleConfig,
    options = dynamicClassificationChoices
  }
) {
  return <>
    <ColorPaletteSelector
      colorPalette={styleConfig.color_palette}
      colorPaletteReverse={styleConfig.color_palette_reverse}
      onChange={val => {
        styleConfig.color_palette = val;
        setStyleConfig({ ...styleConfig })
      }}
      onChangeReverse={val => {
        styleConfig.color_palette_reverse = val
        setStyleConfig({ ...styleConfig })
      }}
      keepData={true}
      menuPlacement={'bottom'}
      reverseInput={true}
    />
    <div hidden={styleType === QUALITATIVE_TYPE}>
      <div className="BasicFormSection">
        <div className='RuleTable-Title'>Classification</div>
        <Select
          options={options}
          value={options.find(type => type.value === styleConfig.dynamic_classification)}
          name='dynamic_classification'
          onChange={evt => {
            styleConfig.dynamic_classification = evt.value
            setStyleConfig({ ...styleConfig })
          }}
          menuPlacement={'bottom'}
        />
      </div>
      <div className="BasicFormSection">
        <div className='RuleTable-Title'>Number of Classes</div>
        <input
          type='number' min='1' value={styleConfig.dynamic_class_num}
          name='dynamic_class_num'
          onChange={evt => {
            styleConfig.dynamic_class_num = evt.target.value
            setStyleConfig({ ...styleConfig })
          }}/>
      </div>
    </div>
  </>
}