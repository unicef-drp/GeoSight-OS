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

import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import $ from "jquery";
import { dictDeepCopy, jsonToUrlParams } from "../../utils/main";
import {
  Notification,
  NotificationStatus
} from "../../components/Notification";
import { AdminListContent } from "./AdminList";
import { fetchJSON } from "../../Requests";
import { DeleteButton } from "../../components/Elements/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";

import './style.scss';

/*** Admin list pagination */
export const AdminListPagination = forwardRef(
  ({
     urlData, COLUMNS,
     disabled, setDisabled, otherFilters,
     getParameters, updateData, ...props
   }, ref
  ) => {

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      refresh() {
        parametersChanged()
        loadData(true)
      }
    }));

    const deleteDialogRef = useRef(null);
    const prev = useRef();

    // Notification
    const notificationRef = useRef(null);
    const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
      notificationRef?.current?.notify(newMessage, newSeverity)
    }

    // Other attributes
    const pageSize = 25;
    const [parameters, setParameters] = useState({
      page: 0,
      page_size: pageSize
    })
    const [data, setData] = useState([])
    const [rowSize, setRowSize] = useState(0)
    const [selectionModel, setSelectionModel] = useState([]);
    const [error, setError] = useState(null);

    /***
     * Parameters Changed
     */
    const parametersChanged = () => {
      const params = getParameters ? getParameters(parameters) : {}
      setParameters({ ...parameters, ...params })
    }

    /*** Load data */
    const loadData = (force) => {
      setData(null)
      setError(null)
      const paramsUsed = dictDeepCopy(parameters)
      paramsUsed.page += 1
      const params = jsonToUrlParams(paramsUsed)
      const url = urlData + '?' + params
      if (!force && url === prev.urlRequest) {
        return
      }
      prev.urlRequest = url

      fetchJSON(url, {}, false)
        .then(data => {
          if (prev.urlRequest === url) {
            setRowSize(data.count)
            setData(data.results)
          }
        })
        .catch(error => {
          if (error.message === 'Invalid page.') {
            setParameters({ ...parameters, page: 0 })
          } else {
            if (error?.response?.data) {
              setError(error.response.data)
            } else {
              setError(error.message)
            }
          }
        })
    }
    /*** When parameters changed */
    useEffect(() => {
      loadData()
    }, [parameters])

    /***
     * When page size and filter changed
     */
    useEffect(() => {
        parameters.page = 0
        setRowSize(0)
        parametersChanged()
      }, [pageSize]
    )

    // Update with edited one
    let usedData = null
    if (data) {
      usedData = dictDeepCopy(data)
      if (updateData) {
        usedData = updateData(usedData)
      }
    }

    return <Fragment>
      <AdminListContent
        otherFilters={otherFilters}
        tableHeader={
          <Fragment>
            <DeleteButton
              disabled={!selectionModel.length || disabled}
              variant="Error Reverse"
              text={"Delete"}
              onClick={() => {
                deleteDialogRef?.current?.open()
              }}
            />
            <ConfirmDialog
              onConfirmed={() => {
                setDisabled(true)
                $.ajax({
                  url: urlData,
                  method: 'DELETE',
                  data: {
                    'ids': JSON.stringify(selectionModel)
                  },
                  success: function () {
                    setDisabled(false)
                    setSelectionModel([])
                    loadData(true)
                  },
                  error: function () {
                    setDisabled(false)
                    notify(error.responseText, NotificationStatus.ERROR)
                  },
                  beforeSend: beforeAjaxSend
                });
              }}
              ref={deleteDialogRef}
            >
              <div>
                Are you sure want to delete {selectionModel.length} data.
              </div>
            </ConfirmDialog>
          </Fragment>
        }
        columns={COLUMNS}
        rows={usedData}

        rowCount={rowSize}
        page={parameters.page}

        getCellClassName={params => {
          let className = ''
          if (params.row.updated) {
            className = 'Updated '
          }
          if (["__check__", "actions"].includes(params.field)) {
            if (!params.row.permission.delete) {
              className += "Hide"
            }
          }
          return className
        }}

        pagination
        pageSize={parameters.page_size}
        rowsPerPageOptions={[25, 50, 100]}
        onPageSizeChange={(newPageSize) => {
          parameters.page_size = newPageSize
          parametersChanged()
        }}
        paginationMode="server"
        onPageChange={(newPage) => {
          parameters.page = newPage
          parametersChanged()
        }}

        disableSelectionOnClick
        disableColumnFilter

        selectionChanged={(newSelectionModel) => {
          setSelectionModel(newSelectionModel)
        }}
        selectionParent={selectionModel}
        error={error}
        {...props}
      />
      <Notification ref={notificationRef}/>
    </Fragment>
  })