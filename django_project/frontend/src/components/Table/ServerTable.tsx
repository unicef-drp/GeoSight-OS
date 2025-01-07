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
import { ServerTableProps } from "./types";
import { dictDeepCopy, jsonToUrlParams } from "../../utils/main";
import { ThemeButton } from "../Elements/Button";
import { MainDataGrid } from "./index";
import { DjangoRequests } from "../../Requests";

import './ServerTable.scss';

/** Server Table */
const ServerTable = forwardRef(
  ({
     url,
     columns,
     selectionModel,
     setSelectionModel,
     getParameters = null,
     selectable = true,
     header = null,
     defaultSortModel = [],
     ...props
   }: ServerTableProps, ref
  ) => {
    const prev = useRef<string | null>(null);
    const pageSize = 25;

    const getSort = (_sortModel: any[]) => {
      const sort: string[] = []
      _sortModel.map(model => {
        const column = columns.find(column => column.field == model.field)

        // @ts-ignore
        const field = column.orderField ? column.orderField : column.field
        sort.push(model.sort === 'asc' ? field : `-${field}`)
      })
      return sort
    }

    // Other parameters
    const [parameters, setParameters] = useState({
      page: 0,
      page_size: pageSize,
      sort: getSort(defaultSortModel)
    })

    // Sort model
    const [sortModel, setSortModel] = useState<any[]>(defaultSortModel);

    // Data states
    const [data, setData] = useState<any[]>(null)
    const [dataCount, setDataCount] = useState<number>(0)
    const [error, setError] = useState<string>(null)

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      refresh() {
        parametersChanged()
        loadData(true)
      },
      /** Update data from outside **/
      updateData(
        fn: (data: any[]) => any[]) {
        setData([...fn(data)])
      }
    }));

    /*** Parameters Changed */
    const parametersChanged = () => {
      const params = getParameters ? getParameters(parameters) : {}
      setParameters({ ...parameters, ...params })
    }

    /*** Load data */
    const loadData = (force: boolean) => {
      setData(null)
      setError(null)
      let _parameters = dictDeepCopy(parameters)
      _parameters.page += 1
      _parameters = jsonToUrlParams(_parameters)

      // Construct url
      const _url = url + '?' + _parameters
      if (!force && _url === prev.current) {
        return
      }
      prev.current = _url
      DjangoRequests.get(_url).then(data => {
        if (prev.current === _url) {
          setDataCount(data.data.count)
          setData(data.data.results)
        }
      })
        .catch(error => {
          let errorString = error.toString()
          if (error?.response?.data?.detail) {
            errorString = error?.response?.data?.detail
          } else if (error.message) {
            errorString = error.message
          }
          if (errorString === 'Invalid page.') {
            setParameters({ ...parameters, page: 0 })
          } else {
            setError(errorString)
          }
        })
    }
    /*** When parameters changed */
    useEffect(() => {
      loadData(false)
    }, [parameters])

    /*** When page size and filter changed */
    useEffect(() => {
        parameters.page = 0
        setDataCount(0)
        parametersChanged()
      }, [pageSize]
    )

    /*** When sortmodel changed */
    useEffect(() => {
        setParameters({ ...parameters, sort: getSort(sortModel) })
      }, [sortModel]
    )

    return (
      <Fragment>
        {
          selectionModel === undefined ? null :
            <div className='AdminListHeader'>
              <div
                className={'AdminListHeader-Count ' + (!selectionModel.length ? 'Empty' : '')}>
                {selectionModel.length + ' item' + (selectionModel.length > 1 ? 's' : '') + ' on this list ' + (selectionModel.length > 1 ? 'are' : 'is') + ' selected.'}
                {
                  selectionModel.length ?
                    <ThemeButton
                      variant="primary Reverse"
                      onClick={() => {
                        setSelectionModel([])
                      }}
                    >
                      Clear selection.
                    </ThemeButton> : null
                }
              </div>
              <div className='Separator'/>
              <div className='AdminListHeader-Right'>{header}</div>
            </div>
        }
        <div className='AdminTable'>
          <MainDataGrid
            columns={columns}
            rows={data ? data : []}

            rowCount={dataCount}
            page={parameters.page}

            getCellClassName={(params: any) => {
              let className = ''
              if (params.row.updated) {
                className = 'Updated '
              }
              if (params.row.updating) {
                className = 'Updating '
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
            onPageSizeChange={(newPageSize: number) => {
              parameters.page_size = newPageSize
              parametersChanged()
            }}
            paginationMode="server"
            onPageChange={(newPage: number) => {
              parameters.page = newPage
              parametersChanged()
            }}

            disableSelectionOnClick
            disableColumnFilter

            onSelectionModelChange={(newSelectionModel: any[]) => {
              if (JSON.stringify(newSelectionModel) !== JSON.stringify(selectionModel)) {
                setSelectionModel(newSelectionModel)
              }
            }}
            selectionModel={selectionModel}
            error={error}

            /*Multisort just enabled for PRO */
            sortModel={sortModel}
            onSortModelChange={(newSortModel: any[]) => setSortModel(newSortModel)}

            {...props}
          />
        </div>
      </Fragment>
    )
  }
)
export default ServerTable;