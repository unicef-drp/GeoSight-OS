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
 * __date__ = '08/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React, {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes
} from 'react';

interface ConfirmDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The header content of the dialog. */
  header?: ReactNode;

  /** Callback function triggered when the "Confirm" button is clicked. */
  onConfirmed: () => void;

  /** Callback function triggered when the "Cancel" button is clicked. */
  onRejected?: () => void;

  /** Whether the dialog should automatically close after confirmation. */
  autoClose?: boolean;

  /** The content to be rendered inside the dialog. */
  children: ReactNode;

  /** Disable the "Confirm" button. */
  disabledConfirm?: boolean;
}

/**
 * Confirm Dialog.
 * A reusable confirmation dialog component.
 */
export declare const ConfirmDialog: ForwardRefExoticComponent<
  ConfirmDialogProps & RefAttributes<unknown>
>;