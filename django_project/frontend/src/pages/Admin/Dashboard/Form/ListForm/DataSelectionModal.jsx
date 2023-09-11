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

import React, { useEffect, useState } from "react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Checkbox } from "@mui/material";

import { COLUMNS, List } from '../../../Components/List'
import { SaveButton } from "../../../../../components/Elements/Button";
import Modal, { ModalHeader } from "../../../../../components/Modal";
import { dictDeepCopy } from "../../../../../utils/main";

/**
 * Form Group
 * @param {string} pageName Page Name.
 * @param {string} groupName Group Name.
 * @param {Array} selectedIds Selected id.
 * @param {Array} listData List of data.
 * @param {Array} selectedData Selected data.
 * @param {boolean} open Is Model Open.
 * @param {Function} setOpen Set modal open.
 * @param {Function} applyData Apply data that contains added and removed.
 * @param {Array} initColumns Column initiation.
 */
export default function DataSelectionModal(
  {
    pageName, groupName,
    listData, selectedData,
    open, setOpen,
    applyData, initColumns
  }) {
  const selectedDataList = JSON.parse(JSON.stringify(selectedData))
  const [groupSelectedDataIds, setGroupSelectedDataIds] = useState([]);
  const [groupSelectedData, setGroupSelectedData] = useState([]);
  const [nonGroupSelectedDataIds, setNonGroupSelectedDataIds] = useState([]);
  const [nonGroupSelectedData, setNonGroupSelectedData] = useState([]);

  // ----------------------------------------------
  // Check data in list that is in this group
  // Remove the data from other group to table
  useEffect(() => {

    // ----------------------------------------------
    // Check data in list that is in this group
    // Remove the data from other group to table
    // Remove data from other group
    const groupSelectedDataIds = []
    const groupSelectedData = selectedDataList.filter(function (row) {
      row.id = row.trueId ? row.trueId : row.id
      const rowGroup = row.group ? row.group : '';
      const condition = rowGroup === groupName;
      if (condition) {
        groupSelectedDataIds.push(row.trueId ? row.trueId : row.id)
      }
      return condition
    })
    setGroupSelectedDataIds([...groupSelectedDataIds])
    setGroupSelectedData([...groupSelectedData])

    const nonGroupSelectedDataIds = []
    const nonGroupSelectedData = selectedDataList.filter(function (row) {
      row.id = row.trueId ? row.trueId : row.id
      const rowGroup = row.group ? row.group : '';
      const condition = rowGroup !== groupName;
      if (condition) {
        nonGroupSelectedDataIds.push(row.id)
      }
      return condition
    })
    setNonGroupSelectedDataIds([...nonGroupSelectedDataIds])
    setNonGroupSelectedData([...nonGroupSelectedData])
  }, [open])

  const cleanListData = listData ? listData.filter(row => {
    return !nonGroupSelectedDataIds.includes(row.id)
  }) : null

  const updateList = (id, checked) => {
    if (checked) {
      groupSelectedDataIds.push(id)
    } else {
      const index = groupSelectedDataIds.indexOf(id);
      if (index !== -1) {
        groupSelectedDataIds.splice(index, 1);
      }
    }
    setGroupSelectedDataIds([...groupSelectedDataIds])
  }

  // ----------------------------------------------
  // Restructure columns
  const columns = initColumns ? dictDeepCopy(initColumns) : [].concat(COLUMNS(pageName));
  columns.pop();
  columns.unshift({
    field: 'actions',
    type: 'actions',
    width: 80,
    getActions: (params) => {
      return [
        <GridActionsCellItem
          className='MuiDataGrid-cellCheckbox'
          icon={
            <Checkbox
              checked={groupSelectedDataIds.includes(params.id)}
              onChange={(evt) => {
                updateList(params.id, evt.target.checked)
              }}
            />
          }
          label="Edit"
        />
      ]
    },
  })

  /**
   * Apply save data
   */
  const apply = () => {
    const currentSelectedIds = groupSelectedData.map(function (row) {
      return row.id
    })
    const addedIds = groupSelectedDataIds.filter(id => {
      return !currentSelectedIds.includes(id)
    })
    const removedIds = currentSelectedIds.filter(id => {
      return !groupSelectedDataIds.includes(id)
    })
    const addedData = listData.filter(row => {
      return addedIds.includes(row.id)
    })
    const removedData = listData.filter(row => {
      return removedIds.includes(row.id)
    })
    applyData(addedData, removedData)
  }
  return <Modal
    className='AdminSelectDataForm'
    open={open}
    onClosed={() => {
      setOpen(false)
    }}
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
    }}>
      Select {pageName} {groupName ? "For " + groupName : ""}
    </ModalHeader>
    <div className='AdminContent'>
      <List
        columns={columns}
        pageName={pageName}
        initData={cleanListData}
        enableSelectionOnClick={true}
        setSelectionModel={(newSelectionModel) => {
          newSelectionModel.map(id => {
            const checked = !groupSelectedDataIds.includes(id)
            console.log(checked)
            console.log(id)
            updateList(id, checked)
          })
        }}
      />
      <div className='Save-Button'>
        <SaveButton
          variant="primary"
          text={"Apply Selections : Selected (" + groupSelectedDataIds.length + ")"}
          onClick={apply}/>
      </div>
    </div>
  </Modal>
}