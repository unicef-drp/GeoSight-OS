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

/* ==========================================================================
   LOGIN COMPONENT
   ========================================================================== */

import React from 'react';

import { Button, FormControl, Input, InputLabel } from '@mui/material'
import Modal, { ModalContent, ModalHeader } from '../Modal'

import './style.scss';

/**
 * Modal for login.
 * @param {bool} open Initial state if modal is open or not.
 * @param {function} onClosed Function when modal closed.
 */
export default function LoginModal({ open, onClosed }) {
  const authUrl = `${urls.login}?next=${window.location.pathname}` // eslint-disable-line no-undef
  const csrftoken = csrfmiddlewaretoken; // eslint-disable-line no-undef

  return (
    <Modal
      open={open}
      onClosed={onClosed}
      className='modal__login'
    >
      <ModalHeader onClosed={onClosed}>
        Sign In
      </ModalHeader>
      <ModalContent>
        <form action={authUrl} method='POST'>
          <FormControl>
            <InputLabel>Username</InputLabel>
            <Input type="text" name="username" placeholder="Enter username"
                   required={true}/>
          </FormControl>
          <FormControl>
            <InputLabel>Password</InputLabel>
            <Input type="password" name="password" placeholder="Password"
                   required={true}/>
          </FormControl>
          <Button variant="primary" type="submit"
                  className="modal__login__submit">
            Sign In
          </Button>
          <FormControl className='MuiFormControl-hidden'>
            <Input
              type="hidden" name="csrfmiddlewaretoken"
              value={csrftoken}/>
          </FormControl>
        </form>
      </ModalContent>
    </Modal>
  )
}
