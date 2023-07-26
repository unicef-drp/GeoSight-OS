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

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
export const NotificationStatus = {
  SUCCESS: 'success',
  INFO: 'info',
  ERROR: 'error',
}

/**
 * Notification
 */
export const Notification = forwardRef(
  ({}, ref
  ) => {
    const [state, setState] = useState({
      message: '',
      severity: 'info',
      open: false
    });
    // Ready check
    useImperativeHandle(ref, () => ({
      notify(newMessage, newSeverity = NotificationStatus.INFO) {
        console.log('notify')
        setState(
          { message: newMessage, open: true, severity: newSeverity }
        )
      }
    }));
    const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
      setState(
        { message: newMessage, open: true, severity: newSeverity }
      )
    }
    /** Handle close **/
    const handleClose = () => {
      setState({ ...state, open: false })
    };

    return <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      open={state.open}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={state.severity}
        sx={{ width: '100%' }}>
        {state.message}
      </Alert>
    </Snackbar>
  }
)