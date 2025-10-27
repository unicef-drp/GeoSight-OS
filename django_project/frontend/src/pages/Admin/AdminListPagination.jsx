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
import CircularProgress from "@mui/material/CircularProgress";
import { dictDeepCopy, jsonToUrlParams } from "../../utils/main";
import {
  Notification,
  NotificationStatus
} from "../../components/Notification";
import { AdminListContent } from "./AdminList";
import { fetchJSON } from "../../Requests";
import { DeleteButton, ThemeButton } from "../../components/Elements/Button";
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
        if (props.deselectWhenParameterChanged) {
          setSelectionModel([])
        }
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
    let initParameters = {
      page: 0,
      page_size: pageSize
    }
    if (getParameters) {
      initParameters = getParameters(initParameters)
    }
    const [parameters, setParameters] = useState(initParameters)
    const [data, setData] = useState([])
    const [rowSize, setRowSize] = useState(0)
    const [error, setError] = useState(null);
    const [fetchingIds, setFetchingIds] = useState(null);
    let [selectionModel, setSelectionModel] = useState([]);

    // Use parent's selection model if it has
    if (props.selectionModel) {
      selectionModel = props.selectionModel
      setSelectionModel = props.setSelectionModel
    }

    /***
     * Parameters Changed
     */
    const parametersChanged = () => {
      const params = getParameters ? getParameters(parameters) : {}
      setParameters({ ...parameters, ...params })
    }

    /*** Load data */
    const loadData = async (force) => {
      setData(null)
      setError(null)
      const paramsUsed = dictDeepCopy(parameters)
      if (!paramsUsed.page) {
        paramsUsed.page = 0;
      }
      paramsUsed.page += 1
      const params = jsonToUrlParams(paramsUsed)
      const url = urlData + '?' + params
      if (!force && url === prev.urlRequest) {
        return
      }
      prev.urlRequest = url

      try {
        const data = await fetchJSON(url, {}, false)

        // Set the data
        if (prev.urlRequest === url) {
          setRowSize(data.count)
          setData(data.results)
        }

        // Fetch quick data for filter
        if (props.quickDataChanged) {
          const quickParams = jsonToUrlParams(
            dictDeepCopy(
              getParameters ? getParameters({}) : {}
            )
          )
          if (!quickParams) {
            props.quickDataChanged({})
          } else {
            try {
              const quickData = await fetchJSON(
                urlData + 'data' + '?' + quickParams, {}, false
              )
              if (prev.urlRequest === url) {
                props.quickDataChanged(quickData)
              }
            } catch (e) {
              console.log(`Quick data is error ${e}`)
            }
          }
        }
      } catch (error) {
        if (error.message === 'Invalid page.') {
          setParameters({ ...parameters, page: 0 })
        } else {
          if (error?.response?.data) {
            setError(error.response.data)
          } else {
            setError(error.message)
          }
        }
      }
    }

    /*** Load ids data */
    const loadIds = () => {
      setFetchingIds(true)
      const paramsUsed = dictDeepCopy({ ...parameters, page: 1 })
      const params = jsonToUrlParams(paramsUsed)
      const url = props.selectAllUrl + '?' + params
      fetchJSON(url, {}, false)
        .then(data => {
          setFetchingIds(false)
          setSelectionModel(data)
        })
        .catch(error => {
          notify(error, NotificationStatus.ERROR)
          setFetchingIds(false)
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
    const filtered = Object.keys(parameters).filter(param => !['page', 'page_size'].includes(param)).length;
    return <Fragment>
      <AdminListContent
        leftHeader={
          <Fragment>
            {
              props.selectAllUrl && rowSize && rowSize !== selectionModel.length ?
                <ThemeButton
                  variant="primary Reverse"
                  className='SelectAllButton'
                  disabled={fetchingIds}
                  onClick={() => {
                    setSelectionModel([])
                    loadIds()
                  }}
                >
                  Select all {rowSize} {filtered ? 'filtered ' : ''}data.
                  {
                    fetchingIds ? <CircularProgress/> : null
                  }
                </ThemeButton> : null
            }
          </Fragment>
        }
        otherFilters={otherFilters}
        tableHeader={
          props.disabledDelete ? null :
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
            if (!params.row.permission?.delete) {
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
          if (JSON.stringify(newSelectionModel) !== JSON.stringify(selectionModel)) {
            setSelectionModel(newSelectionModel)
          }
        }}
        selectionParent={selectionModel}
        error={error}
        {...props}
      />
      <Notification ref={notificationRef}/>
    </Fragment>
  })