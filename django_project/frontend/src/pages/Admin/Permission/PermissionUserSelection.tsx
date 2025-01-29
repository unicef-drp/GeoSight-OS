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
 * __date__ = '15/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */
import React, { useState } from "react";
import { AddButton } from "../../../components/Elements/Button";
import { FormControl } from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { User } from "../../../types/User";
import UserSelector from "../../../components/ResourceSelector/UserSelector";


interface Props {
  setData: (permission: string, objects: User[]) => void;
  permissionChoices: string[];
}

export function PermissionUserSelection(
  {
    permissionChoices, setData
  }: Props
) {
  const [permissionChoice, setPermissionChoice] = useState(permissionChoices[0][0])

  return <UserSelector
    initData={[]}
    showSelected={false}
    dataSelected={(data: User[]) => {
      setData(permissionChoice, data)
    }}
    multipleSelection={true}
    mode={'filter'}
    opener={
      <AddButton
        variant="primary"
        text={"Share to new user(s)"}
      />
    }
    topChildren={
      <div className='AdminContent' style={{ marginBottom: "1rem" }}>
        <div
          className='BasicForm'
          style={{
            paddingLeft: "1rem",
            paddingRight: "1rem",
            marginBottom: "1rem"
          }}
        >
          <div className="BasicFormSection" style={{ marginBottom: 0 }}>
            <div>
              <label className="form-label">Permission</label>
            </div>
            <div>
              <FormControl className='BasicForm'>
                <Select
                  value={permissionChoice}
                  onChange={(evt) => {
                    setPermissionChoice(evt.target.value)
                  }}
                >
                  {
                    permissionChoices.map(choice => {
                      return <MenuItem
                        key={choice[0]}
                        value={choice[0]}>{choice[1]}</MenuItem>
                    })
                  }
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
      </div>
    }
  />
}