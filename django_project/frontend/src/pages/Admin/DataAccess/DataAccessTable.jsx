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

import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { DeleteIcon } from "../../../components/Icons";
import MoreAction from "../../../components/Elements/MoreAction";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import {
  Notification,
  NotificationStatus
} from "../../../components/Notification";
import { DeleteButton, EditButton } from "../../../components/Elements/Button";
import { UpdatePermissionModal } from "./UpdatePermissionModal";
import { DjangoRequests } from "../../../Requests";
import { ServerTable } from "../../../components/Table";

import './style.scss';

/**
 * Render public data access table
 */
export const DataAccessTable = forwardRef(
  ({
     urlData,
     filters,
     ableToDelete,
     COLUMNS,
     PERMISSIONS,
     dataName = 'Public'
   }, ref
  ) => {
    const deleteDialogRef = useRef(null);
    const tableRef = useRef(null);
    const [deletingIds, setDeletingIds] = useState([]);

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      createData(data, success, failed) {
        return DjangoRequests.post(
          urlData,
          data
        ).then(response => {
          success();
          tableRef?.current?.refresh()
        }).catch(error => {
            notify('Failed to update data', NotificationStatus.ERROR);
            failed();
          }
        )
      },
    }));

    // Notification
    const notificationRef = useRef(null);
    const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
      notificationRef?.current?.notify(newMessage, newSeverity)
    }

    const [selectionModel, setSelectionModel] = useState([]);
    const [updatePermission, setUpdatePermission] = useState({
      open: false,
      updating: false
    });

    // When filter changed
    useEffect(() => {
      tableRef?.current?.refresh()
      setSelectionModel([])
    }, [filters])

    /*** Parameters Changed */
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
        parameters['user_id__in'] = filters.users.join(',')
      } else {
        delete parameters['user_id__in']
      }
      if (filters.groups?.length) {
        parameters['group_id__in'] = filters.groups.join(',')
      } else {
        delete parameters['group_id__in']
      }
      return parameters
    }

    // ----------------------------
    // Render Permission
    // ----------------------------
    const renderPermission = (params) => {
      return <FormControl className='BasicForm'>
        <Select
          value={params.value}
          disabled={params.row.updating}
          onChange={(evt) => {
            let prevPermission = null
            tableRef?.current?.updateData(data => {
              const row = data.find(row => row.id === params.id);
              if (row) {
                prevPermission = row.permission
                row.permission = evt.target.value
                row.updating = true
              }
              return data
            })
            DjangoRequests.put(
              urlData,
              { ids: [params.id], permission: evt.target.value }
            ).then(response => {
              tableRef?.current?.updateData(data => {
                const row = data.find(row => row.id === params.id);
                if (row) {
                  row.updating = false
                }
                return data
              })
            }).catch(error => {
                notify('Failed to update data', NotificationStatus.ERROR);
                tableRef?.current?.updateData(data => {
                  const row = data.find(row => row.id === params.id);
                  if (row) {
                    row.permission = prevPermission
                    row.updating = false
                  }
                  return data
                })
              }
            )
          }}
        >
          {
            PERMISSIONS.map(choice => {
              return <MenuItem
                key={choice[0]}
                value={choice[0]}>
                {choice[1]}
              </MenuItem>
            })
          }
        </Select>
      </FormControl>
    }
    if (!COLUMNS.find(col => col.field === 'permission')) {
      COLUMNS.push(
        {
          field: 'permission', headerName: 'Permission', width: 200,
          renderCell: (params) => {
            return renderPermission(params, 'permission')
          },
          sortable: false
        })
    }

    // ----------------------------
    // Render Delete Action
    // ----------------------------
    const actions = (params) => {
      return [
        <MoreAction moreIcon={<MoreVertIcon/>}>
          <div className='error' onClick={
            () => {
              setDeletingIds([params.id]);
              deleteDialogRef?.current?.open();
            }
          }>
            <DeleteIcon/> Delete
          </div>
        </MoreAction>
      ]
    }
    if (ableToDelete) {
      if (!COLUMNS.find(col => col.field === 'actions')) {
        COLUMNS.push({
          field: 'actions',
          type: 'actions',
          width: 80,
          getActions: (params) => {
            return actions(params)
          },
        })
      }
    }

    return <div className='AdminList DataAccessAdminTable'>
      <ServerTable
        header={
          <Fragment>
            {
              ableToDelete ? <DeleteButton
                disabled={!selectionModel.length}
                variant="Error Reverse"
                text={"Delete"}
                onClick={() => {
                  setDeletingIds(selectionModel)
                  deleteDialogRef?.current?.open()
                }}
              /> : null
            }
            <EditButton
              disabled={!selectionModel.length}
              variant="primary Reverse"
              text={"Change permission"}
              onClick={() => {
                setUpdatePermission({ ...updatePermission, open: true })
              }}
            />
            <UpdatePermissionModal
              state={updatePermission}
              onClosed={() => setUpdatePermission({
                ...updatePermission,
                open: false
              })}
              choices={PERMISSIONS}
              selectedPermission={(permission) => {

                // Update bulk permission
                setUpdatePermission({
                  ...updatePermission,
                  updating: true
                })

                DjangoRequests.put(
                  urlData,
                  { ids: selectionModel, permission: permission }
                ).then(response => {
                  tableRef?.current?.refresh();
                  setUpdatePermission({
                    ...updatePermission,
                    updating: false,
                    open: false
                  })
                }).catch(error => {
                    notify('Failed to update data', NotificationStatus.ERROR);
                    setUpdatePermission({
                      ...updatePermission,
                      updating: false
                    })
                  }
                )
              }}
            />
          </Fragment>
        }
        url={urlData}
        columns={COLUMNS}
        selectionModel={selectionModel}
        setSelectionModel={setSelectionModel}
        getParameters={getParameters}
        checkboxSelection={true}
        defaultSortModel={
          [
            { field: 'indicator_name', sort: 'asc' },
            { field: 'dataset_name', sort: 'asc' }
          ]
        }
        ref={tableRef}
      />
      <ConfirmDialog
        onConfirmed={() => {
          DjangoRequests.delete(
            urlData,
            { ids: deletingIds }
          ).then(response => {
            tableRef?.current?.refresh();
            setSelectionModel(selectionModel.filter(id => !deletingIds.includes(id)))
            setDeletingIds([])
          }).catch(error => {
              notify('Failed to update data', NotificationStatus.ERROR);
            }
          )
        }}
        ref={deleteDialogRef}
      >
        <div>
          Are you sure want to
          delete {deletingIds.length ? deletingIds.length : 1}&nbsp;
          {dataName.toLowerCase() + (deletingIds.length > 1 ? 's' : '')} data
          access?
        </div>
      </ConfirmDialog>
      <Notification ref={notificationRef}/>
    </div>
  }
)