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

// Define the component props
export interface SelectWithListProps {
  list?: string[];
  value?: string | number | (string | number)[]; // The selected value(s)
  showFloatingLabel?: boolean; // Whether to show a floating label
  createable?: boolean; // Whether the select is creatable
  keepData?: boolean; // Whether to keep additional data
  isMulti?: boolean; // Whether it's a multi-select
  menuPlacement?: 'auto' | 'top' | 'bottom'; // Menu placement option
  placeholder?: string; // Placeholder text
  required?: boolean; // Whether the field is required
  ClassName?: string; // Custom CSS class name
  [key: string]: any; // Any other additional props
}

// Declare the `SelectWithList` function
export function SelectWithList(props: SelectWithListProps): JSX.Element;