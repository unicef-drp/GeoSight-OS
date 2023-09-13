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

import React, { Fragment, useRef } from 'react';
import Tooltip from "@mui/material/Tooltip";
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import StorageIcon from '@mui/icons-material/Storage';
import { GridActionsCellItem } from "@mui/x-data-grid";
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';

import { COLUMNS, COLUMNS_ACTION } from "../../Components/List";
import { AdminList } from "../../AdminList";
import PermissionModal from "../../Permission";
import {
  DataManagementActiveIcon,
  MapActiveIcon
} from "../../../../components/Icons";

import './style.scss';

/**
 * Indicator List App
 */
export default function IndicatorList() {
  const listRef = useRef(null);

  // Notification
  const pageName = pageNames.Indicators
  const columns = COLUMNS(pageName, urls.admin.indicatorList);

  columns[4] = {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 320,
    getActions: (params) => {
      const permission = params.row.permission
      // Create actions
      const actions = [].concat(
        COLUMNS_ACTION(
          params, urls.admin.indicatorList, urls.api.edit, urls.api.detail
        )
      );

      // Unshift before more & edit action
      if (permission.share) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <a>
                <PermissionModal
                  name={params.row.name}
                  urlData={urls.api.permission.replace('/0', `/${params.id}`)}
                  additionalTabs={
                    permission.edit ? {
                      'Push API':
                        <div className='Other'>
                          You can push data using api POST &nbsp;
                          <a
                            target={"_blank"}
                            href={location.origin + '/api/indicator/' + params.row.id + '/values/'}>
                            {location.origin + '/api/indicator/' + params.row.id + '/values/'}
                          </a>
                          <br/>
                          <br/>
                          <div>
                            You need to login or using Basic Authentication to
                            push the data.
                            You also need to have edit permission on the data,
                            and you role should be
                            contributor, creator or admin.

                          </div>
                          <br/>
                          <div>
                            Payload data that will be pushed should be in
                            array of json.

                            Example:
                            <pre>
                              <code dangerouslySetInnerHTML={{
                                __html: JSON.stringify([{
                                    "reference_layer": "-Reference layer uuid-",
                                    "value": "-value of data-",
                                    "admin_level": "-admin level in integer-",
                                    "geom_id": "-geometry code-",
                                    "geom_id_type": "-code type of geometry code. e.g : Pcode, ucode, etc-",
                                    "timestamp": "-Timestamp of data-"
                                  }], null, 2
                                )
                              }}>
                              </code>
                            </pre>

                          </div>
                        </div>
                    } : {}
                  }
                />
              </a>
            }
            label="Change Share Configuration."
          />)
      }
      if (permission.delete) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Go to data access.`}>
                <a
                  href={urls.api.permissionAdmin + '?indicators=' + params.id}>
                  <div className='ButtonIcon'>
                    <StorageIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Go to data access."
          />)
      }

      if (permission.edit) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Management Map`}>
                <a
                  href={urls.api.map.replace('/0', `/${params.id}`)}>
                  <div className='ButtonIcon'>
                    <MapActiveIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Edit"
          />)
      }
      if (permission.edit) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Management Form`}>
                <a
                  href={urls.api.form.replace('/0', `/${params.id}`)}>
                  <div className='ButtonIcon'>
                    <DynamicFormIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Management Form"
          />)
      }
      if (permission.edit) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Import data`}>
                <a
                  href={`${urls.admin.importer}?indicator_data_value=${params.id}`}>
                  <div className='ButtonIcon'>
                    <DataManagementActiveIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Import data"
          />
        )
      }
      if (permission.edit) {
        actions.unshift(
          <GridActionsCellItem
            className='TextButton'
            icon={
              <a href={urls.api.dataBrowser + '?indicators=' + params.id}>
                <div
                  className='MuiButton-Div MuiButtonBase-root MuiButton-primary Reverse ThemeButton'>
                  <DataUsageIcon/> Value List
                </div>
              </a>
            }
            label="Value List"
          />)
      }
      return actions
    },
  }
  return <Fragment>
    <AdminList
      columns={columns}
      pageName={pageName}
      listUrl={urls.api.list}
      multipleDelete={true}
      ref={listRef}
    />
  </Fragment>
}

render(IndicatorList, store)