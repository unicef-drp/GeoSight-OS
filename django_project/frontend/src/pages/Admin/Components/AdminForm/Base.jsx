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

import { Checkbox } from "@mui/material";
import React, { useState } from "react";


/** Create Input **/
export function AdminFormInput(
  {
    attrName, label = null, helptext = null, required = false,
    selectableInput, children
  }
) {
  const [selectableInputState, setSelectableInputState] = useState({});
  const selectableInputChecked = !selectableInputState[attrName] ? false : true
  const selectableInputEnabled = !selectableInput || selectableInputChecked
  return <div className="BasicFormSection">
    {
      label ?
        <div>
          <label
            className={"form-label " + (required ? 'required' : '')}>{label}</label>
        </div> : null
    }
    <div className='InputInLine'>
      {
        selectableInput && attrName ?
          <Checkbox
            className='InputEnabler'
            checked={selectableInputChecked}
            onClick={evt => {
              selectableInputState[attrName] = !selectableInputChecked
              setSelectableInputState({ ...selectableInputState })
            }}
          /> : null
      }
      {
        React.Children.map(children, child => {
          return React.cloneElement(child, {
            isDisabled: !selectableInputEnabled,
            disabled: !selectableInputEnabled,
          })
        })
      }
    </div>
    {
      helptext ? <span className="form-helptext">{helptext}</span> : null
    }
  </div>
}