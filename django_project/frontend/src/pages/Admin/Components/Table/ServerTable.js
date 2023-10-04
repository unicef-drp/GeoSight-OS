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
import { MainDataGrid } from "../../../../components/MainDataGrid";

import './style.scss';
import { NotificationStatus } from "../../../../components/Notification";
import { dictDeepCopy, jsonToUrlParams } from "../../../../utils/main";
import { fetchJSON } from "../../../../Requests";

/**
 * Admin Table
 * @param {Array} rows List of data.
 * @param {Array} columns Columns for the table.
 * @param {function} selectionChanged Function when selection changed.
 * @param {function} sortingDefault The sorting default.
 * @param {boolean} selectable Is selectable.
 */
export const ServerTable = forwardRef(
  ({
     urlData,
     columns,
     selectionModel,
     setSelectionModel,
     getParameters = null,
     selectable = true,
     ...props
   }, ref
  ) => {
    const prev = useRef();

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      refresh() {
        parametersChanged()
        loadData(true)
      }
    }));

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
    const [data, setData] = useState(null)
    const [rowSize, setRowSize] = useState(0)
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

    return (
      <Fragment>
        {
          selectionModel === undefined ? null :
            <div className='AdminListHeader'>
              <div
                className={'AdminListHeader-Count ' + (!selectionModel.length ? 'Empty' : '')}>
                {selectionModel.length + ' item' + (selectionModel.length > 1 ? 's' : '') + ' on this list ' + (selectionModel.length > 1 ? 'are' : 'is') + ' selected.'}
              </div>
              <div className='Separator'/>
              <div className='AdminListHeader-Right'>
                {props.header}
              </div>
            </div>
        }
        <div className='AdminTable'>
          <MainDataGrid
            columns={columns}
            rows={data ? data : []}

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
            loading={!data}
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

            onSelectionModelChange={(newSelectionModel) => {
              if (JSON.stringify(newSelectionModel) !== JSON.stringify(selectionModel)) {
                setSelectionModel(newSelectionModel)
              }
            }}
            selectionModel={selectionModel}
            error={error}
            {...props}
          />
        </div>
      </Fragment>
    )
  }
)