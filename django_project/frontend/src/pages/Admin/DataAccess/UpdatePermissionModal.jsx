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
 * __date__ = '04/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useState } from 'react';
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SaveButton } from "../../../components/Elements/Button";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../components/Modal";

import './style.scss';


/**
 * Update permission modal
 */
export function UpdatePermissionModal(
  { choices, open, setOpen, selectedPermission }
) {
  const [selected, setSelected] = useState(choices[0][0])

  return <Modal
    className='PermissionFormModal'
    open={open}
    onClosed={() => {
      setOpen(false)
    }}
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
    }}>Update permission</ModalHeader>
    <ModalContent>
      <FormControl className='BasicForm'>
        <Select
          value={selected}
          onChange={(evt) => {
            setSelected(evt.target.value)
          }}
        >
          {
            choices.map(choice => {
              return <MenuItem
                key={choice[0]}
                value={choice[0]}>{choice[1]}</MenuItem>
            })
          }
        </Select>
      </FormControl>
    </ModalContent>
    <ModalFooter>
      <div className='Save-Button'>
        <SaveButton
          variant="primary"
          text={"Apply Changes"}
          onClick={() => {
            selectedPermission(selected)
          }}
        />
      </div>
    </ModalFooter>
  </Modal>
}
