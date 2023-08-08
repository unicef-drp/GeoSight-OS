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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useState } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import StyleRules from "./StyleRules";
import DynamicStyleConfig from "./DynamicStyleConfig";
import {
  StyleInputSelector
} from "../../../../components/ResourceList/WithModal/WithInput";
import { dictDeepCopy } from "../../../../utils/main";
import { dynamicStyleTypes } from "../../../../utils/Style";
import { Select } from "../../../../components/Input";

export const styleTypesChoices = styleTypes.map(type => {
  return {
    value: type[0],
    label: type[1]
  }
})


/*** Style section ***/
export default function StyleConfig(
  {
    data,
    setData,
    defaultStyleRules,
    defaultCodes,
    selectableInput,
    valuesUrl
  }
) {
  const [selectableInputState, setSelectableInputState] = useState({});
  const [style, setStyle] = useState(data.style_data ? data.style_data : null)

  /** Return selectable input state by checked, enabled **/
  const selectableInputStateOutput = (attrName) => {
    const selectableInputChecked = !selectableInputState[attrName] ? false : true
    const selectableInputEnabled = !selectableInput || selectableInputChecked
    return [selectableInputChecked, selectableInputEnabled]
  }

  // Init codelist
  let codelist = defaultCodes
  if (codelists?.find(list => list.id === data.codelist)) {
    codelist = codelists.find(list => list.id === data.codelist).codes
  }

  // Init data
  useEffect(() => {
    if (!data.style_type) {
      data.style_type = styleTypes[0][1]
      data.style = []
      setData({ ...data })
    }
  }, [])

  // When data changed
  useEffect(() => {
    if (data.style_id !== style?.id) {
      data.style_data = style
      data.style_id = style?.id
      setData(data)
    }
  }, [data, style])

  return <Fragment>
    {
      selectableInput ?
        <div className="BasicFormSection">
          <FormControlLabel
            checked={selectableInputStateOutput('style_config_enable')[0]}
            control={<Checkbox name='style_config_enable'/>}
            onChange={evt => {
              selectableInputState['style_config_enable'] = !selectableInputStateOutput('style_config_enable')[0]
              setSelectableInputState({ ...selectableInputState })
            }}
            label={'Change style'}/>
        </div> : null
    }
    {
      selectableInputStateOutput('style_config_enable')[1] ?
        <Fragment>
          <div className="BasicFormSection">
            <div>
              <label className="form-label required">Style type</label>
            </div>
            <Select
              options={styleTypesChoices}
              value={
                styleTypesChoices.find(type => type.value === data.style_type)
              }
              name='style_type'
              onChange={
                evt => {
                  data.style_type = evt.value
                  setData({ ...data })
                }
              }
            />
          </div>
          {/* Predefined style/color rules. */}
          <div className="BasicFormSection"
               hidden={data.style_type !== 'Predefined style/color rules.'}>
            <div className='RuleTable-Title'>Style</div>
            <StyleRules
              inputStyleRules={dictDeepCopy(defaultStyleRules)}
              valueType={data.value_type}
              valuesUrl={valuesUrl}
              defaultCodeChoices={codelist}
              onStyleRulesChanged={style => {
                if (JSON.stringify(style) !== JSON.stringify(data.style)) {
                  data.style = dictDeepCopy(style)
                  setData({ ...data })
                }
              }}
            />
          </div>
          {/* Style from library. */}
          <div className="BasicFormSection"
               hidden={data.style_type !== 'Style from library.'}>
            <label className="form-label required">Style</label>
            <StyleInputSelector
              selectedData={style ? [style] : []}
              selectedDataChanged={(styles) => {
                setStyle(styles[0])
              }}
              placeholder='Select style'
              isMultiple={false}
            />
            <input
              type="text" name="style" value={style?.id}
              hidden={true}
              onChange={evt => {
              }}/>
          </div>
          {/* Style from library. */}
          <div
            hidden={!dynamicStyleTypes.includes(data.style_type)}>
            <DynamicStyleConfig
              data={data}
              setData={setData}
            />
          </div>
        </Fragment> : null
    }
  </Fragment>
}