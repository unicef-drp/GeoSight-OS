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
 * __date__ = '14/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */


import React from 'react';

declare module './IconInput' {
  interface IconInputProps {
    /** Placeholder of the input. */
    placeholder?: string;

    /** Value of the input. */
    value?: string;

    /** On change . */
    onChange?: (data: string) => void;

    [key: string]: any;
  }

  // Declare the component type explicitly as a functional component.
  export const SearchInput: React.FC<IconInputProps>;
}