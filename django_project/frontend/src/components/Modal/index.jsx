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
   BASE MODAL CONTAINER
   ========================================================================== */

import React, { useEffect, useState } from "react";

import { Modal as BaseModal } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import { CloseIcon } from "../Icons";

import "./style.scss";

/**
 * Base modal component.
 * @param {bool} open Initial state if modal is open or not.
 * @param {function} onClosed Function when modal closed.
 * @param {string} className Class name for modal.
 * @param {React.Component} children React component to be rendered.
 */
export default function Modal({ open, onClosed, className, children }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const onClosedFn = () => {
    setIsOpen(false);
    onClosed();
  };

  return (
    <BaseModal
      open={isOpen}
      onClose={onClosedFn}
      className={className}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 300,
      }}
    >
      <Fade in={isOpen}>
        <Box className="modal--wrapper--box">
          <Box className="modal--box">{children}</Box>
        </Box>
      </Fade>
    </BaseModal>
  );
}

export function ModalHeader({ children, onClosed }) {
  return (
    <div className="modal--header">
      <div className="modal--header--title">{children}</div>
      <div
        className="MuiButtonLike modal--header--close"
        onClick={() => {
          if (onClosed) {
            onClosed();
          }
        }}
      >
        <CloseIcon />
      </div>
    </div>
  );
}

export function ModalContent({ className = null, children }) {
  return (
    <div className={"modal--content " + (className ? className : "")}>
      {children}
    </div>
  );
}

export function ModalFooter({ children }) {
  return <div className="modal--footer">{children}</div>;
}
