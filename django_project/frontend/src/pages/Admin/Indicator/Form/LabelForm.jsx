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
import LabelStyle from "../../LabelStyle";
import TextField from "@mui/material/TextField";


/*** Label section ***/
export default function LabelForm({ indicator, setIndicator }) {
  const selectableInput = batch !== null
  const [selectableInputState, setSelectableInputState] = useState({});
  const [indicatorData, setIndicatorData] = useState(indicator);

  /** Return selectable input state by checked, enabled **/
  const selectableInputStateOutput = (attrName) => {
    const selectableInputChecked = !selectableInputState[attrName] ? false : true
    const selectableInputEnabled = !selectableInput || selectableInputChecked
    return [selectableInputChecked, selectableInputEnabled]
  }

  // When indicator changed
  useEffect(() => {
    if (setIndicator) {
      setIndicator(indicatorData)
    }
  }, [indicatorData])

  return <Fragment>
    {
      selectableInput ?
        <div className="BasicFormSection">
          <FormControlLabel
            checked={selectableInputStateOutput('label_config_enable')[0]}
            control={<Checkbox name='label_config_enable'/>}
            onChange={evt => {
              selectableInputState['label_config_enable'] = !selectableInputStateOutput('label_config_enable')[0]
              setSelectableInputState({ ...selectableInputState })
            }}
            label={'Change label'}/>
        </div> : null
    }
    {
      selectableInputStateOutput('label_config_enable')[1] ?
        <Fragment>
          <input
            type="text" name="label_config"
            value={indicatorData.label_config ? JSON.stringify(indicatorData.label_config) : ''}
            hidden={true}/>
          <LabelStyle
            label_styles={indicatorData.label_config?.style}
            update={(label_styles) => {
              if (!indicatorData.label_config) {
                indicatorData.label_config = {
                  text: `{name}
{value}.round(2)`
                }
              }
              indicatorData.label_config = {
                ...indicatorData.label_config,
                style: label_styles
              }
              setIndicatorData({ ...indicatorData })
            }}/>
          <div className="BasicFormSection"></div>
          <div className="BasicFormSection">
            <label className="form-label">Text</label>
            <TextField
              multiline={true}
              value={indicatorData.label_config?.text ? indicatorData.label_config?.text : ''}
              onChange={evt => {
                if (!indicatorData.label_config) {
                  indicatorData.label_config = {}
                }
                indicatorData.label_config = {
                  ...indicatorData.label_config,
                  text: evt.target.value
                }
                setIndicatorData({ ...indicatorData })
              }}
            />
            <span className="form-helptext">
              {"Put any text in here. To put the value of indicator, you can put markup {<Field Name>}."}<br/>
              {"The field name that can be used are:"}<br/>
              {'"code" = geography code'}<br/>
              {'"date" = date of data'}<br/>
              {'"label" = Label of data based on legend'}<br/>
              {'"name" = Geography name'}<br/>
              {'"value" = Value of data'}<br/>
              <br/>
              {'and for "value", you can limit the number of decimal using .round(x)'}<br/>
              {'example, put {value}.round(2) to make value just 2 number of decimals.'}
            </span>
          </div>
        </Fragment> : null
    }
  </Fragment>
}