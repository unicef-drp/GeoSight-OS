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

import { GridActionsCellItem } from "@mui/x-data-grid";
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { AdminTable } from '../Table';
import { IconTextField } from '../../../../components/Elements/Input'
import { DjangoRequests, fetchingData } from "../../../../Requests";
import MoreAction from "../../../../components/Elements/MoreAction";
import { dictDeepCopy, toSingular } from "../../../../utils/main";
import { DeleteIcon, MagnifyIcon } from "../../../../components/Icons";
import { useConfirmDialog } from "../../../../providers/ConfirmDialog";
import { useTranslation } from 'react-i18next';

import './style.scss';

// Delete action
const DeleteAction = ({
  params,
  redirectUrl,
  detailUrl = null,
  moreActions = null,
}) => {
  const { t } = useTranslation();
  const { openConfirmDialog } = useConfirmDialog();

  const permission = params.row.permission;
  if (permission && !permission.delete) return null;

  return (
    <GridActionsCellItem
      data-id={params.id}
      icon={
        <MoreAction moreIcon={<MoreVertIcon />}>
          {moreActions
            ? React.Children.map(moreActions, (child) => child)
            : null}

          {detailUrl && (
            <div
              className="error"
              onClick={() => {
                openConfirmDialog({
                  header: t("admin.deleteConfirmation"),
                  onConfirmed: async () => {
                    const api = detailUrl.replace("/0", `/${params.id}`);
                    await DjangoRequests.delete(api, {}).then(() => {
                      try {
                        params.columns[params.columns.length - 1]?.tableRef.current.refresh();
                      } catch (err) {
                        if (
                          window.location.href.replace(
                            window.location.origin,
                            ""
                          ) === redirectUrl
                        ) {
                          location.reload();
                        } else {
                          window.location = redirectUrl;
                        }
                      }
                    });
                  },
                  onRejected: () => {},
                  children: (
                    <div>
                      {t("admin.deleteConfirmationMessage", {
                        item: params.row.name ?? params.row.id,
                      })}
                    </div>
                  ),
                });
              }}
            >
              <DeleteIcon /> {t("admin.delete")}
            </div>
          )}
        </MoreAction>
      }
      label="More"
    />
  );
};

/**
 *
 * DEFAULT COLUMNS ACTIONS
 * @param {dict} params Params for action.
 * @param {String} redirectUrl Url for redirecting after action done.
 * @param {String} editUrl Url for edit row.
 * @param {String} detailUrl Url for detail of row.
 * @param {React.Component} moreActions More actions before delete
 * @returns {list}
 */
export function COLUMNS_ACTION(
  params, redirectUrl, editUrl = null, detailUrl = null, moreActions = null
) {
  detailUrl = detailUrl ? detailUrl : urls.api.detail;
  const actions = []

  // Delete action
  const permission = params.row.permission
  if (!permission || permission.delete) {
    actions.push(
      <DeleteAction
        params={params}
        redirectUrl={redirectUrl}
        detailUrl={detailUrl}
        moreActions={moreActions}
      />,
    );
  }
  return actions
}

/**
 *
 * DEFAULT COLUMNS
 * @param {String} pageName Page name.
 * @param {String} redirectUrl Url for redirecting after action done.
 * @param {String} editUrl Url for edit row.
 * @param {String} detailUrl Url for detail of row.
 * @returns {list}
 */
export function COLUMNS(pageName, redirectUrl, editUrl = null, detailUrl = null) {
  const { t } = useTranslation();
  editUrl = editUrl ? editUrl : urls.api.edit;
  detailUrl = detailUrl ? detailUrl : urls.api.detail;
  const _columns = [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    {
      field: 'name', headerName: t('admin.pageNameFormats.names.' + pageName), flex: 1,
      renderCell: (params) => {
        const permission = params.row.permission
        if (editUrl && (!permission || permission.edit)) {
          return <a className='MuiButtonLike CellLink'
                    href={editUrl.replace('/0', `/${params.id}`)}>
            {params.value}
          </a>
        } else {
          return <div className='MuiDataGrid-cellContent'>{params.value}</div>
        }
      }
    },
    { field: 'description', headerName: t('admin.columns.description'), flex: 1 },
    {
      field: 'category',
      headerName: t('admin.columns.category'),
      flex: 0.5,
      serverKey: 'group__name'
    },
    {
      field: 'actions',
      type: 'actions',
      cellClassName: 'MuiDataGrid-ActionsColumn',
      width: 80,
      getActions: (params) => {
        return COLUMNS_ACTION(params, redirectUrl, editUrl, detailUrl)
      },
    }
  ]
  if (['indicators', 'indicator'].includes(pageName)) {
    _columns[2] = { field: 'shortcode', headerName: t('admin.columns.shortcode'), flex: 0.5 }
  }
  return _columns
}

/**
 * Admin List App
 * @param {list} columns Columns setup.
 * @param {String} pageName Page Name.
 * @param {String} listUrl Url for list row.
 * @param {list} initData Init Data.
 * @param {function} selectionChanged Function when selection changed.
 * @param {dict} sortingDefault Default for sorting.
 * @param {str} searchDefault Default for search.
 * @param {boolean} selectable Is selectable.
 */

export const BaseList = forwardRef(
  ({
     columns, pageName, listUrl, initData, setInitData,
     sortingDefault, searchDefault,
     selectionModel,
     setSelectionModel,
     search, selectable = true,
     ...props
   }, ref
  ) => {
    const [data, setData] = useState(initData);
    const [error, setError] = useState(null);

    /** Refresh data **/
    const refresh = (force) => {
      if (listUrl && (!data || force)) {
        fetchingData(listUrl, {}, {}, (data, error) => {
          // Check if not array, return error
          if (!Array.isArray(data)) {
            error = 'Data is not an array'
          } else {
            setData(data)
          }

          // If error
          if (error) {
            setError(error.toString())
          } else {
            setError(null)
          }
        }, false)
      }
    }
    // Ready check
    useImperativeHandle(ref, () => ({
      refresh() {
        setData(null)
        refresh(true)
      }
    }));

    // Fetch data when created if it has url
    useEffect(() => {
      refresh()
    }, [])

    // Change data when init data changed
    useEffect(() => {
      setData(initData)
    }, [initData])

    // Change init data when data changed
    useEffect(() => {
      if (setInitData) {
        setInitData(data)
      }
    }, [data])

    /** Filter by search input */
    let rows = dictDeepCopy(data);
    const fields = columns?.map(column => column.field).filter(column => column !== 'id')
    if (search && columns && data) {
      rows = rows.filter(row => {
        let found = false
        fields.map(field => {
          if (('' + row[field])?.toLowerCase().includes(search)) {
            found = true;
          }
        })
        return found
      })
    }
    if (rows) {
      rows.map(row => {
        row.state = {
          data: data,
          setData: setData
        }
      })
    }

    /** Render **/
    return (
      <Fragment>
        <div className='AdminList'>
          <AdminTable
            rows={rows}
            columns={columns}
            selectionModel={selectionModel}
            setSelectionModel={setSelectionModel}
            sortingDefault={sortingDefault}
            selectable={selectable}
            error={error}
            {...props}
          />
        </div>
      </Fragment>
    );
  }
)
export const List = forwardRef(
  ({
     columns, pageName, listUrl, initData, setInitData,
     selectionChanged, sortingDefault, searchDefault,
     selectable = true,
     ...props
   }, ref
  ) => {
    const listRef = useRef(null);
    const [search, setSearch] = useState(searchDefault);

    // Refresh changed
    useImperativeHandle(ref, () => ({
      refresh() {
        listRef.current.refresh()
      }
    }));

    /** Render **/
    return (
      <Fragment>
        <div className='AdminBaseInput Indicator-Search'>
          <IconTextField
            placeholder={"Search " + pageName}
            defaultValue={search ? search : ""}
            iconEnd={<MagnifyIcon/>}
            onChange={evt => setSearch(evt.target.value.toLowerCase())}
          />
        </div>
        <BaseList
          columns={columns}
          pageName={pageName}
          listUrl={listUrl}
          initData={initData}
          setInitData={setInitData}
          selectionChanged={selectionChanged}
          sortingDefault={sortingDefault}
          search={search}
          searchDefault={searchDefault}
          selectable={selectable}
          ref={listRef}
          {...props}
        />
      </Fragment>
    );
  }
)