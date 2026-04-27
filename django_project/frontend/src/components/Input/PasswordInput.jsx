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
 * __date__ = '27/04/2026'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useState } from 'react';
import { IconButton } from "@mui/material";
import { IconTextField } from "../Elements/Input";
import { VisibilityIcon, VisibilityOffIcon } from "../Icons";

/** Password input with show/hide toggle.
 * @param {JSX.Element} iconStart Optional start icon.
 * @param {dict} props Props forwarded to IconTextField.
 */
export function PasswordInput({ ...props }) {
  const [show, setShow] = useState(false);
  return (
    <IconTextField
      {...props}
      type={show ? "text" : "password"}
      iconEnd={
        <IconButton onClick={() => setShow((v) => !v)} tabIndex={-1}>
          {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      }
    />
  );
}
