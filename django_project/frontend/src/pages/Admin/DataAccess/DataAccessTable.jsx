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
 * __date__ = '04/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { NotificationStatus } from "../../../components/Notification";
import { ServerTable } from "../Components/Table/ServerTable";
import { EditButton } from "../../../components/Elements/Button";
import { UpdatePermissionModal } from "./UpdatePermissionModal";

import './style.scss';

/**
 * Render public data access table
 */
export default function DataAccessTable(
  { urlData, filters, COLUMNS, PERMISSIONS }
) {
  const tableRef = useRef(null);
  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  const [selectionModel, setSelectionModel] = useState([]);
  const [updatePermissionOpen, setUpdatePermissionOpen] = useState(false);
  const [data, setData] = useState(null);

  // When filter changed
  useEffect(() => {
    tableRef?.current?.refresh()
  }, [filters])

  /***
   * Parameters Changed
   */
  const getParameters = (parameters) => {
    if (filters.indicators?.length) {
      parameters['indicator_id__in'] = filters.indicators.join(',')
    } else {
      delete parameters['indicator_id__in']
    }
    if (filters.datasets?.length) {
      parameters['reference_layer_id__in'] = filters.datasets.join(',')
    } else {
      delete parameters['reference_layer_id__in']
    }
    if (filters.permissions?.length) {
      parameters['permission__in'] = filters.permissions.join(',')
    } else {
      delete parameters['permission__in']
    }
    if (filters.users?.length) {
      parameters['user__id__in'] = filters.users.join(',')
    } else {
      delete parameters['user__id__in']
    }
    if (filters.groups?.length) {
      parameters['group__id__in'] = filters.groups.join(',')
    } else {
      delete parameters['group__id__in']
    }
    return parameters
  }

  return <div className='AdminList DataAccessAdminTable'>
    <ServerTable
      header={
        <Fragment>
          <EditButton
            disabled={!selectionModel.length}
            variant="primary Reverse"
            text={"Change permission"}
            onClick={() => {
              setUpdatePermissionOpen(true)
            }}
          />
          <UpdatePermissionModal
            open={updatePermissionOpen}
            setOpen={setUpdatePermissionOpen}
            choices={PERMISSIONS}
            selectedPermission={(permission) => {
              console.log(permission)
            }}
          />
        </Fragment>
      }
      urlData={urlData}
      columns={COLUMNS}
      selectionModel={selectionModel}
      setSelectionModel={setSelectionModel}
      getParameters={getParameters}
      checkboxSelection={true}
      ref={tableRef}
    />
  </div>
}