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
 * __date__ = '16/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export const TYPE = {
  GROUP: 'GROUP',
  EXPRESSION: 'EXPRESSION',
} as const;

export const WHERE_OPERATOR = {
  AND: 'AND',
  OR: 'OR'
} as const;

export const OPTIONS_TYPES = [
  { id: WHERE_OPERATOR.AND, name: 'And' },
  { id: WHERE_OPERATOR.OR, name: 'Or' }
]


export interface OnDeleteProps {
  onDelete?: () => void;
}

export interface DeleteProps extends OnDeleteProps {
  text: string;
}

export interface BasicFilterElementProps extends OnDeleteProps {
  // Operator
  operator: typeof WHERE_OPERATOR[keyof typeof WHERE_OPERATOR];
  setOperator?: (data: string) => void;

  // Active
  active: boolean;
  setActive?: (data: boolean) => void;
}

export interface FilterGroupElementProps extends BasicFilterElementProps {

  // Is master, no delete
  isMaster?: boolean;
}

export interface FilterGroupDataProps extends OnDeleteProps {
  // Global data update
  query: any;
  updateQuery?: () => void;

  // Is master, no delete
  isMaster?: boolean;
}

export interface FilterInputProps {
  operator: typeof WHERE_OPERATOR[keyof typeof WHERE_OPERATOR];

  // For layout
  name: string;
  description?: string;
  allowModify: boolean;

  // Filter definition
  field?: string;
  type?: typeof TYPE[keyof typeof TYPE];
  value?: any;
}

export interface FilterInputElementProps extends FilterInputProps, BasicFilterElementProps {

}

export interface FilterInputDataProps extends OnDeleteProps {
  // Global data update
  query: FilterInputElementProps;
  updateQuery?: () => void;
}