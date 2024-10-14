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

import React, { Fragment, useEffect, useState } from 'react';
import { fetchJSON } from "../../../../Requests";
import { PermissionForm } from "../../Permission";
import { Checkbox, FormControlLabel } from "@mui/material";
import { urlParams } from "../../../../utils/main";

import './style.scss';

/**
 * PermissionForm
 */
export default function PermissionFormAdmin({ permissionApi }) {
  const selectableInput = batch !== null
  const [selectableInputState, setSelectableInputState] = useState({});
  const [data, setData] = useState(null)

  /** Return selectable input state by checked, enabled **/
  const selectableInputStateOutput = (attrName) => {
    const selectableInputChecked = !!selectableInputState[attrName]
    const selectableInputEnabled = !selectableInput || selectableInputChecked
    return [selectableInputChecked, selectableInputEnabled]
  }

  /** Fetch data when modal is opened **/
  useEffect(() => {
    if (permissionApi) {
      let url = permissionApi
      if (selectableInput) {
        // put ids to permission api
        const { ids } = urlParams()
        if (ids) {
          url += '?ids=' + ids
        }
      }
      fetchJSON(url)
        .then(data => {
          setData(data)
        })
    }
  }, [open])

  /** Render **/
  return (
    <Fragment>
      {
        selectableInput ?
          <div className="BasicFormSection">
            <FormControlLabel
              checked={selectableInputStateOutput('permission_config')[0]}
              control={<Checkbox name='permission_config'/>}
              onChange={evt => {
                selectableInputState['permission_config'] = !selectableInputStateOutput('permission_config')[0]
                setSelectableInputState({ ...selectableInputState })
              }}
              label={'Change permission'}/>
          </div> : null
      }
      {
        selectableInputStateOutput('permission_config')[1] ?
          data ?
            <Fragment>
              <input
                type="text" name="permission"
                value={JSON.stringify(data)}
                hidden={true}
              />
              <PermissionForm
                data={data} setData={setData} selectableInput={selectableInput}
              />
            </Fragment> : <div>Loading</div> : null
      }
    </Fragment>
  );
}