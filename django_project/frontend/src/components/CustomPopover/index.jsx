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
   POPOVER
   ========================================================================== */

import React, { Fragment, useState } from "react";
import Popover from "@mui/material/Popover";

import "./style.scss";
import { CloseIcon } from "../Icons";

/**
 * Popover component
 * @param {dict} anchorOrigin anchorOrigin prop.
 * @param {dict} transformOrigin transformOrigin prop.
 * @param {React.Component} Button The button that will be used as the anchor.
 * @param {React.Component} children React component to be rendered
 * @param {boolean} showOnHover Popover on show over
 * @param {Function} onHover FUnction when on hover
 * @param {str} className Class for popup
 */
export default function CustomPopover({
  anchorOrigin,
  transformOrigin,
  Button,
  children,
  showOnHover,
  onHover,
  className,
  showCloseButton = false,
  preventDefault = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (preventDefault) {
      event.preventDefault();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <Fragment>
      {React.cloneElement(Button, {
        "aria-describedby": id,
        onClick: handleClick,
        onMouseEnter: (evt) => {
          if (showOnHover) {
            handleClick(evt);
            if (onHover) {
              onHover();
            }
          }
        },
        onMouseLeave: (evt) => {
          if (showOnHover) {
            handleClose();
          }
        },
      })}
      <Popover
        id={id}
        sx={{
          pointerEvents: showOnHover ? "none" : "auto",
        }}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        className={anchorOrigin.horizontal + (className ? " " + className : "")}
      >
        {showCloseButton && (
          <CloseIcon
            style={{
              cursor: "pointer",
              position: "absolute",
              top: "1rem",
              right: "1rem",
            }}
            onClick={handleClose}
          />
        )}
        {children}
      </Popover>
    </Fragment>
  );
}
