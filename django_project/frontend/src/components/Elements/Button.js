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

import React from 'react';
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { DeleteIcon } from "../Icons";

/** Main button
 * @param {string} buttonProps Variant of Button.
 * @param {React.Component} children React component to be rendered
 */
export function ThemeButton({ children, ...props }) {
  return (
    <Button {...props}
            className={'ThemeButton ' + (props.className ? props.className : '')}>
      {children}
    </Button>
  )
}

/** Add button
 * @param {string} text Text of button.
 * @param {string} buttonProps Variant of Button.
 */
export function AddButton({ text, ...props }) {
  return (
    <ThemeButton {...props}>
      <AddIcon/>{text}
    </ThemeButton>
  )
}

/** Edit button
 * @param {string} text Text of button.
 * @param {string} buttonProps Variant of Button.
 */
export function EditButton({ text, ...props }) {
  return (
    <ThemeButton {...props}>
      <EditIcon/>{text}
    </ThemeButton>
  )
}

/** Save button
 * @param {string} text Text of button.
 * @param {string} buttonProps Variant of Button.
 */
export function SaveButton({ text, ...props }) {
  return (
    <ThemeButton
      {...props}
      className={'SaveButton ' + (props.className ? props.className : '')}>
      <SaveIcon/>{text}
    </ThemeButton>
  )
}

/** Delete button
 * @param {string} text Text of button.
 * @param {string} buttonProps Variant of Button.
 */
export function DeleteButton({ text, ...props }) {
  return (
    <ThemeButton {...props}>
      <DeleteIcon/>{text}
    </ThemeButton>
  )
}

/** Close button
 * @param {string} text Text of button.
 * @param {string} buttonProps Variant of Button.
 */
export function CloseButton({ text, ...props }) {
  return (
    <ThemeButton {...props}>
      {text}
    </ThemeButton>
  )
}