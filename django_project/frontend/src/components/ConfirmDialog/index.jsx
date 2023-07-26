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
 * __date__ = '25/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { forwardRef, useImperativeHandle, useState } from 'react';

import Modal, { ModalContent, ModalFooter, ModalHeader } from "../Modal";
import { ThemeButton } from "../Elements/Button";


/**
 * Confirm Dialog.
 * @param {React.Component} children React component to be rendered.
 */
export const ConfirmDialog = forwardRef(
  ({ header, onConfirmed, onRejected, children, ...props }, ref
  ) => {
    const [open, setOpen] = useState(false);

    // Set Open
    useImperativeHandle(ref, () => ({
      open() {
        setOpen(true)
      }
    }));

    return (
      <Modal
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          {header}
        </ModalHeader>
        <ModalContent>
          {children}
        </ModalContent>
        <ModalFooter>
          <div style={{ marginLeft: 'auto', width: 'fit-content' }}>
            <ThemeButton
              variant="Basic Reverse"
              onClick={() => {
                if (onRejected) {
                  onRejected()
                }
                setOpen(false)
              }}>
              Cancel
            </ThemeButton>
            &nbsp;
            <ThemeButton
              variant="secondary Basic"
              disabled={props.disabledConfirm}
              onClick={() => {
                onConfirmed()
                setOpen(false)
              }}>
              Confirm
            </ThemeButton>
          </div>
        </ModalFooter>
      </Modal>
    )
  }
)
