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
 * __date__ = '26/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */


import React from 'react';

declare module './Button' {
  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    [key: string]: any;

    children?: React.ReactNode;
    variant?: string;
  }

  export function ThemeButton(props: ButtonProps): JSX.Element;

  export function SaveButton(props: ButtonProps): JSX.Element;

  export function AddButton(props: ButtonProps): JSX.Element;

  export function DeleteButton(props: ButtonProps): JSX.Element;

  export function EditButton(props: ButtonProps): JSX.Element;
}