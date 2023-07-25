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

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import FormControl from "@mui/material/FormControl";
import Modal, { ModalHeader } from "./index";

/**
 * Modal with input.
 * @param {React.Component} Input React component for input.
 * @param {String} modalHeader Modal header.
 * @param {React.Component} ModalInput React component for modal.
 */
export const ModalInput = forwardRef(
  ({ Input, modalHeader, ModalInputContent, onClose, ...props }, ref
  ) => {
    const [open, setOpen] = useState(false)
    const closeModal = () => {
      setOpen(false)
      if (onClose) {
        onClose()
      }
    }
    useImperativeHandle(ref, () => ({
      close() {
        closeModal()
      }
    }));
    return <FormControl className='InputControl'>
      <label className="MuiFormLabel-root" data-shrink="true">
        {modalHeader}
      </label>
      {
        React.cloneElement(Input, {
          onClick: () => setOpen(true)
        })
      }
      <Modal
        className={'ModalInput ' + props.className ? props.className : ''}
        open={open}
        onClosed={() => {
          closeModal()
        }}
      >
        <ModalHeader onClosed={() => {
          closeModal()
        }}>
          {modalHeader}
        </ModalHeader>
        {ModalInputContent}
      </Modal>
    </FormControl>
  }
)