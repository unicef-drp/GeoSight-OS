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
 * __date__ = '13/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */


import React from 'react';
import { TextFieldProps } from "@mui/material";

declare module './Input' {
  interface InputProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Placeholder of the input. */
    placeholder?: string;

    /** Start icon on the input. */
    iconStart?: React.ReactNode;

    /** End icon on the input. */
    iconEnd?: React.ReactNode;

    /** On change. */
    onChange?: (data: any) => void;

    /** Additional InputProps for TextField. */
    InputProps?: TextFieldProps['InputProps'];

    children?: React.ReactNode;

    [key: string]: any;
  }

  // Declare the component type explicitly as a functional component.
  export const IconTextField: React.FC<InputProps>;
}