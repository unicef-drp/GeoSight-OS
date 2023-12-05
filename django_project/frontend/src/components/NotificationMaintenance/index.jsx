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
 * __date__ = '28/11/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   NotificationMaintenance
   ========================================================================== */

import { formatDateTime } from "../../utils/main";
import React, { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';

import Modal, { ModalContent, ModalHeader } from "../Modal";

import './style.scss';

export default function NotificationMaintenance() {
  const [data, setData] = useState(null)
  const [open, setOpen] = useState(false)

  const onClosed = () => {
    setOpen(false);
  };

  useEffect(
    () => {
      fetch('/api/maintenance',)
        .then(response => response.json())
        .then((response) => {
          if (response.detail) {
            throw new Error(response.detail)
          }
          setData(response)
        })
        .catch(err => {
        })
    }, []
  )


  const Notification = () => {
    const _from = new Date(data.scheduled_from);
    const isUpcoming = new Date() < _from;

    return <span className='NotificationMaintenanceWrapperInfo'>
      <div>
        We {isUpcoming ? 'will be' : 'are'} peforming a maintenance
        from <b>{formatDateTime(_from, false, false, false)}</b>
        {
          data.scheduled_end ? (
            <> to <b>{formatDateTime(new Date(data.scheduled_end), false, false, false)}</b></>
          ) : null
        }
      </div>
      </span>
  }
  if (!data?.id) {
    return null
  }
  return <div className='NotificationMaintenance'>
    <div className='NotificationMaintenanceWrapper'
         onClick={() => setOpen(true)}
    >
      <Notification/>
      <InfoIcon style={{ marginLeft: "0.5rem" }}/>
    </div>
    <Modal
      open={open}
      onClosed={onClosed}
    >
      <ModalHeader onClosed={onClosed}>
        <Notification/>
      </ModalHeader>
      <ModalContent>
        <div dangerouslySetInnerHTML={{ __html: data.message }}/>
      </ModalContent>
    </Modal>
  </div>
}