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

import React, { Fragment, useEffect, useState } from 'react';
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { pageNames } from '../../index';
import { GridActionsCellItem } from "@mui/x-data-grid";
import { COLUMNS_ACTION } from "../../Components/List";
import { AdminList } from "../../AdminList";

import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../components/Modal";
import { fetchingData } from "../../../../Requests";

import './style.scss';
import { ThemeButton } from "../../../../components/Elements/Button";
import $ from "jquery";

/**
 *
 * DEFAULT COLUMNS
 * @param {String} pageName Page name.
 * @param {String} redirectUrl Url for redirecting after action done.
 * @param {Function} onDetails Function to on details.
 * @param {String} editUrl Url for edit row.
 * @param {String} detailUrl Url for detail of row.
 * @returns {list}
 */
export function COLUMNS(pageName, redirectUrl, onDetails, editUrl = null, detailUrl = null,) {
  detailUrl = detailUrl ? detailUrl : urls.api.detail;
  return [
    { field: 'id', headerName: 'id', hide: true, width: 30, },
    { field: 'reference_layer', headerName: 'Reference Layer', flex: 1 },
    { field: 'name', headerName: 'Reference Layer name', flex: 1 },
    { field: 'geom_id', headerName: 'Geometry Code', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'value', headerName: 'Value', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      width: 130,
      getActions: (params) => {
        const actions = COLUMNS_ACTION(params, redirectUrl, null, detailUrl)
        // Unshift before more & edit action
        actions.unshift(
          <GridActionsCellItem
            className='TextButton'
            onClick={() => {
              onDetails(params)
            }}
            icon={
              <div
                className='MuiButton-Div MuiButtonBase-root MuiButton-secondary ThemeButton'>
                Details
              </div>
            }
            label="Value List"
          />)
        return actions
      },
    }
  ]
}

export function DetailModal({ id, onClose }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  useEffect(() => {
    if (id) {
      setData(null)
      const api = urls.api.detail.replace('/0', `/${id}`);
      fetchingData(api, {}, {}, (data) => {
        setData(data)
      })
      setOpen(true)
    }
  }, [id])

  return <Modal
    className='DetailModal'
    open={open}
    onClosed={() => {
      setOpen(false)
      onClose()
    }}
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
    }}>
      Detail
    </ModalHeader>
    <ModalContent>
      {
        data ? Object.keys(data).map(key => {
          return <div>
            <b className='light'>{key} : </b>
            <span>{JSON.stringify(data[key])}</span>
          </div>
        }) : <div>Loading</div>
      }
    </ModalContent>
  </Modal>
}

/**
 * Indicator List App
 */
export default function IndicatorValueList() {
  const pageName = pageNames.Indicators
  const [id, setId] = useState(null);
  const [selected, setSelected] = useState([]);

  const columns = COLUMNS(pageName, window.location.href, (data) => {
    setId(data.id)
  });

  const onClose = () => {
    setId(null)
  }
  const selectionChanged = (selected) => {
    setSelected(selected)
  }
  const deleteSelected = () => {
    if (selected.length) {
      if (confirm(`Are you sure you want to delete ${selected.length} selected values?`)) {
        $.ajax({
          url: urls.api.list,
          method: 'DELETE',
          data: {
            'ids': JSON.stringify(selected)
          },
          success: function () {
            window.location = window.location.href;
          },
          beforeSend: beforeAjaxSend
        });
        return false;
      }
    }
  }

  return <Fragment>
    <AdminList
      columns={columns}
      pageName={pageName}
      listUrl={urls.api.list}
      selectionChanged={selectionChanged}
      rightHeader={
        <div>
          <ThemeButton
            variant="secondary" disabled={!selected.length}
            onClick={() => deleteSelected()}>
            Delete Selected
            {selected.length ? " (" + selected.length + " Selected)" : ""}
          </ThemeButton>
        </div>
      }
    />
    <DetailModal id={id} onClose={onClose}/>
  </Fragment>
}

render(IndicatorValueList, store)