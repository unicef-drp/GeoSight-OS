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

import {
  AddButton,
  DeleteButton,
  ThemeButton
} from '../../components/Elements/Button'
import { AdminPage } from './index';
import { BaseList } from './Components/List'
import EditIcon from "@mui/icons-material/Edit";
import { IconTextField } from "../../components/Elements/Input";
import { MagnifyIcon } from "../../components/Icons";
import { ConfirmDialog } from "../../components/ConfirmDialog";

import './style.scss';


/**
 * Admin List that contains content of list
 * @param {list} columns Columns setup.
 * @param {String} pageName Page Name.
 * @param {String} listUrl Url for list row.
 * @param {function} selectionChanged Function when selection changed.
 * @param {list} initData If there is init data.
 * @param {React.Component} rightHeader Right header.
 * @param {Array} sortingDefault Default for sorting.
 * @param {str} searchDefault Default for search.
 * @param {React.Component} children React component to be rendered
 */

export const AdminListContent = forwardRef(
  ({
     columns,
     pageName = '',
     listUrl,
     selectionChanged,
     initData = null,
     rightHeader = null,
     sortingDefault = null,
     searchDefault = null,
     multipleDelete = null,
     tableHeader,
     otherFilters,
     tabChildren,
     ...props
   }, ref
  ) => {
    const deleteDialogRef = useRef(null);
    const apiBatch = props.apiBatch ? props.apiBatch : urls.api.batch
    const apiCreate = props.apiCreate ? props.apiCreate : urls.api.create;
    const [data, setData] = useState([]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false)
    const listRef = useRef(null);
    const [search, setSearch] = useState(searchDefault);

    const dataName = pageName.replace(/s$/, '');

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      refresh() {
        listRef.current.refresh()
      }
    }));

    // When selection changed
    useEffect(() => {
      if (selectionChanged) {
        selectionChanged(selectionModel)
      }
    }, [selectionModel])

    // When selection changed
    useEffect(() => {
      if (props.selectionParent) {
        setSelectionModel(props.selectionParent)
      }
    }, [props.selectionParent])

    // When init data changed
    useEffect(() => {
      if (initData) {
        const selectableIds = initData.filter(row => [null, undefined, true].includes(row.selectable)).map(row => row.id)
        const newSelectionModel = selectionModel.filter(row => selectableIds.includes(row))
        if (JSON.stringify(newSelectionModel) !== JSON.stringify(selectionModel)) {
          setSelectionModel(newSelectionModel)
        }
      }
    }, [initData])

    /** Render **/
    let selectableFunction = !isDeleting
    if (!isDeleting && (multipleDelete || apiBatch)) {
      selectableFunction = (params) => {
        const { permission } = params.row
        return !permission || permission.edit || permission.delete
      }
    }
    const selectedModelData = data.filter(row => selectionModel.includes(row.id))
    const deleteButton = () => {
      if (user.is_creator && multipleDelete && listUrl) {
        const selectedIds = selectedModelData.filter(row => !row.permission || row.permission.delete).map(row => row.id)
        return <Fragment>
          <DeleteButton
            disabled={isDeleting || !selectedIds.length}
            variant="Error Reverse"
            text={"Delete"}
            onClick={() => {
              deleteDialogRef?.current?.open()
            }}
          />
          <ConfirmDialog
            onConfirmed={() => {
              setIsDeleting(true)
              $.ajax({
                url: listUrl,
                method: 'DELETE',
                data: {
                  'ids': JSON.stringify(selectedIds)
                },
                success: function () {
                  setIsDeleting(false)
                  listRef.current.refresh()
                },
                error: function () {
                  setIsDeleting(false)
                },
                beforeSend: beforeAjaxSend
              });
              return false;
            }}
            ref={deleteDialogRef}
          >
            <div>
              Are you sure want to
              delete {selectedIds.length} {dataName.toLowerCase() + (selectedIds.length > 1 ? 's' : '')}?
            </div>
          </ConfirmDialog>
        </Fragment>
      }
    }
    const createButton = () => {
      if (user.is_creator && apiCreate) {
        return <a href={apiCreate}>
          <AddButton
            variant="primary"
            text={"Create New " + pageName}
          />
        </a>
      }
    }
    /** Button for batch edit **/
    const batchEditButton = () => {
      if (user.is_creator && apiBatch) {
        const selectedIds = selectedModelData.filter(row => !row.permission || row.permission.edit).map(row => row.id)
        return <a
          href={apiBatch + '?ids=' + selectedIds.join(',')}>
          <ThemeButton
            variant="primary Basic"
            disabled={!selectedIds.length}>
            <EditIcon/>Edit
          </ThemeButton>
        </a>
      }
    }
    return (
      <div className={'AdminContent ' + props.className}>
        <div className='AdminContentHeader'>
          <div className='AdminContentHeader-Left'>
            <b className='light'
               dangerouslySetInnerHTML={{ __html: props.title ? props.title : contentTitle }}></b>
          </div>
          <div>
            {
              props.hideSearch ? null :
                <IconTextField
                  placeholder={"Search " + pageName}
                  defaultValue={search ? search : ""}
                  iconEnd={<MagnifyIcon/>}
                  onChange={evt => {
                    setSearch(evt.target.value.toLowerCase())
                  }}
                />
            }
          </div>
          <div className='AdminContentHeader-Right'>
            {rightHeader ? rightHeader : null}
            {createButton()}
          </div>
        </div>
        {otherFilters}
        {tabChildren}
        <BaseList
          columns={columns}
          pageName={pageName}
          listUrl={listUrl}
          initData={initData}
          setInitData={newData => {
            if (newData) {
              setData(newData)
            }
          }}
          sortingDefault={sortingDefault}
          search={search}
          searchDefault={searchDefault}
          selectable={selectableFunction}
          ref={listRef}
          {...props}
          selectionModel={selectionModel}
          setSelectionModel={
            selectionChanged || multipleDelete ? (
              selectedData => {
                setSelectionModel(selectedData)
                if (props.selectionChanged) {
                  props.selectionChanged(selectedData)
                }
              }
            ) : null
          }
          header={
            <Fragment>
              {batchEditButton()}
              {deleteButton()}
              {tableHeader}
            </Fragment>
          }
        />
      </div>
    )
  }
)
/**
 * Admin List App
 * @param {list} columns Columns setup.
 * @param {String} pageName Page Name.
 * @param {String} listUrl Url for list row.
 * @param {function} selectionChanged Function when selection changed.
 * @param {list} initData If there is init data.
 * @param {React.Component} rightHeader Right header.
 * @param {Array} sortingDefault Default for sorting.
 * @param {str} searchDefault Default for search.
 * @param {React.Component} children React component to be rendered
 */

export const AdminList = forwardRef(
  ({
     columns, pageName,
     listUrl, selectionChanged,
     initData = null,
     rightHeader = null,
     sortingDefault = null,
     searchDefault = null,
     multipleDelete = null,
     ...props
   }, ref
  ) => {
    return (
      <AdminPage pageName={pageName}>
        <AdminListContent
          columns={columns} pageName={pageName}
          listUrl={listUrl} selectionChanged={selectionChanged}
          initData={initData}
          rightHeader={rightHeader}
          sortingDefault={sortingDefault}
          searchDefault={searchDefault}
          multipleDelete={multipleDelete}
          {...props}
        />
      </AdminPage>
    );
  })