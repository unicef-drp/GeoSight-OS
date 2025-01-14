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
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import axios from "axios";
import pluralize from 'pluralize';
import { ServerTableProps, } from "./types";
import { dictDeepCopy } from "../../utils/main";
import { DeleteButton, ThemeButton } from "../Elements/Button";
import { MainDataGrid } from "./index";
import { constructUrl, DjangoRequests } from "../../Requests";
import { Notification, NotificationStatus } from "../Notification";
import { useConfirmDialog } from "../../providers/ConfirmDialog";

import './ServerTable.scss';

/** Server Table */
const ServerTable = forwardRef(
  ({
     url,
     urlHeader,
     dataName,
     columns,

     // Selection model with ids
     selectionModel,
     setSelectionModel,

     // Selection model with data
     selectionModelData = [],
     setSelectionModelData,

     getParameters = null,
     defaults = {
       sort: [],
       search: null,
       filters: {}
     },
     leftHeader = null,
     rightHeader = null,
     enable = {
       select: true,
       delete: true,
       singleSelection: false
     },
     rowIdKey = 'id',
     className = '',
     disableSelectionOnClick = true,
     ...props
   }: ServerTableProps, ref
  ) => {
    const { openConfirmDialog } = useConfirmDialog();

    // Notification
    const notificationRef = useRef(null);
    const notify = (newMessage: string, newSeverity: string = NotificationStatus.INFO) => {
      notificationRef?.current?.notify(newMessage, newSeverity)
    }

    const prev = useRef(
      {
        url: null
      }
    );
    const pageSize = 25;

    const getSort = (_sortModel: any[]) => {
      const sort: string[] = []
      _sortModel.map(model => {
        const column = columns.find(column => column.field == model.field)

        // @ts-ignore
        const field = column.sortField ? column.sortField : column.field
        sort.push(model.sort === 'asc' ? field : `-${field}`)
      })
      return sort
    }

    // Other parameters
    const [parameters, setParameters] = useState(
      {
        page: 0,
        page_size: pageSize,
        sort: getSort(defaults.sort),
        ...defaults.filters
      }
    )

    // Sort model
    const [sortModel, setSortModel] = useState<any[]>(defaults.sort);

    // Data states
    const [data, setData] = useState<any[]>(null)
    const [dataCount, setDataCount] = useState<number>(0)
    const [error, setError] = useState<string>(null)

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      refresh(force: boolean = true) {
        parametersChanged()
        loadData(force)
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
      let _parameters = dictDeepCopy(parameters)
      _parameters.page += 1

      // Construct url
      const _url = constructUrl(url, _parameters)

      // not force and the url are same
      if (!force && _url === prev.current.url) {
        return
      }
      setData(null)
      setError(null)
      prev.current.url = _url
      axios.get(_url, { headers: urlHeader }).then(data => {
        if (prev.current.url === _url) {
          if (data.data.count !== undefined) {
            setDataCount(data.data.count)
          } else {
            setDataCount(data.data.page_size * data.data.total_page)
          }
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

    /*** When selectionModel */
    useEffect(() => {
      if (setSelectionModelData) {
        let newSelectedModelData = []
        let existedId: any[] = []
        if (selectionModelData) {
          newSelectedModelData = selectionModelData.filter(
            row => {
              const selected = selectionModel.includes(row[rowIdKey])
              if (selected) {
                existedId.push(row[rowIdKey])
              }
              return selected
            }
          )
        }
        if (data) {
          newSelectedModelData = newSelectedModelData.concat(
            data.filter(
              row => {
                return selectionModel.includes(row[rowIdKey]) && !existedId.includes(row[rowIdKey])
              }
            )
          )
        }
        newSelectedModelData = Array.from(new Set(newSelectedModelData))
        if (JSON.stringify(newSelectedModelData) !== JSON.stringify(selectionModelData)) {
          setSelectionModelData(newSelectedModelData)
        }
      }
    }, [selectionModel])

    /*** When sortmodel changed */
    useEffect(() => {
        setParameters({ ...parameters, sort: getSort(sortModel) })
      }, [sortModel]
    )

    return (
      <Fragment>
        {
          enable.singleSelection || selectionModel === undefined ? null :
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
                {leftHeader}
              </div>
              <div className='Separator'/>
              <div className='AdminListHeader-Right'>
                {rightHeader}
                {
                  enable.delete ? <DeleteButton
                    disabled={!selectionModel.length}
                    variant="Error Reverse"
                    text={"Delete"}
                    onClick={() => {
                      openConfirmDialog({
                        header: 'Delete confirmation',
                        onConfirmed: async () => {
                          const deletingIds = selectionModel.map(model => {
                            if (typeof model === 'object') {
                              return model.id
                            } else {
                              return model
                            }
                          })
                          await DjangoRequests.delete(
                            url,
                            {
                              ids: deletingIds
                            }
                          ).then(response => {
                            loadData(true)
                            setSelectionModel([])
                          }).catch(error => {
                              notify('Failed to delete data', NotificationStatus.ERROR);
                            }
                          )
                        },
                        onRejected: () => {
                        },
                        children: <div>
                          Are you sure want to
                          delete {selectionModel.length}&nbsp;
                          {selectionModel.length > 1 ? pluralize(dataName).toLowerCase() : dataName.toLowerCase()}?
                        </div>,
                      })
                    }}
                  /> : null
                }
              </div>
            </div>
        }
        <div className='AdminTable'>
          <MainDataGrid
            className={className}
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
                if (!params.row.permission?.delete) {
                  className += "Hide"
                }
              }
              return className
            }}

            pagination
            loading={!data}
            pageSize={parameters.page_size}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageSizeChange={(newPageSize: number) => {
              parameters.page_size = newPageSize
              parametersChanged()
            }}
            paginationMode="server"
            onPageChange={(newPage: number) => {
              parameters.page = newPage
              parametersChanged()
            }}

            disableColumnFilter

            onSelectionModelChange={(newSelectionModel: any[]) => {
              if (enable.singleSelection) {
                let selected = undefined
                newSelectionModel.map(id => {
                  if (!selectionModel.includes(id)) {
                    selected = id
                  }
                })
                if (selected) {
                  setSelectionModel([selected])
                }
              } else {
                if (JSON.stringify(newSelectionModel) !== JSON.stringify(selectionModel)) {
                  setSelectionModel(newSelectionModel)
                }
              }
            }
            }
            selectionModel={selectionModel}
            error={error}
            disableSelectionOnClick={disableSelectionOnClick}

            /*Multisort just enabled for PRO */
            sortModel={sortModel}
            onSortModelChange={(newSortModel: any[]) => setSortModel(newSortModel)}

            getRowId={(row: any) => row[rowIdKey]}

            {...props}
          />
        </div>
        <Notification ref={notificationRef}/>
      </Fragment>
    )
  }
)
export default ServerTable;