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
import { ReactElement, ReactNode } from "react";
import { DefaultProps } from "../Table/types";


export interface ModalFilterSelectorProps {

  /** Init data for the selector. */
  data: any[];

  /** When the data selected. */
  setData: (data: any) => void;

  /** If the selected is show, it will show in the bottom of input. */
  showSelected: boolean;

  /** Is the input disabled. */
  disabled?: boolean;

  /** Mode that will be used. */
  mode?: 'input' | 'filter';

  /** Is selection is multiple. */
  multipleSelection: boolean;
}


export interface ModalInputSelectorProps {
  /** Placeholder of input. */
  placeholder?: string;

  /** Init data for the selector. */
  initData: any[];

  /** When the data selected. */
  dataSelected: (data: any) => void;

  /** Is selection is multiple. */
  multipleSelection: boolean;

  /** If the selected is show, it will show in the bottom of input. */
  showSelected: boolean;

  /** The key that being used as id. */
  rowIdKey?: string;

  /** Is the input disabled. */
  disabled?: boolean;

  /** Mode that will be used. */
  mode?: 'input' | 'filter';

  /** The content to be rendered in the top of modal. */
  topChildren?: ReactNode;

  /** If the input selector has other opener. */
  opener?: ReactElement;

  /** Defaults properties. */
  defaults?: DefaultProps;
}
