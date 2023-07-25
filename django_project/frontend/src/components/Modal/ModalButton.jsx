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

import React, { forwardRef, Fragment, useState } from 'react';
import Modal, { ModalHeader } from "./index";

/**
 * Modal with button.
 * @param {React.Component} Button React component for input.
 */
export const ModalButton = forwardRef(
  ({ Button, header, onClose, children, ...props }, ref
  ) => {
    const [open, setOpen] = useState(false)
    const closeModal = () => {
      setOpen(false)
      if (onClose) {
        onClose()
      }
    }
    return <Fragment>
      {
        React.cloneElement(Button, {
          onClick: () => setOpen(true)
        })
      }
      <Modal
        className={props.className ? props.className : ''}
        open={open}
        onClosed={() => {
          closeModal()
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          {header}
        </ModalHeader>
        {
          React.cloneElement(children, {
            close: () => closeModal()
          })
        }
      </Modal>
    </Fragment>
  }
)