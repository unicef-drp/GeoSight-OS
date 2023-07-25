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

import React, { useEffect, useState } from 'react';

import Modal, { ModalHeader } from "../../Modal";
import ResourceList from "../../ResourceList";
import { SaveButton } from "../../Elements/Button";

import './style.scss';

/**
 * For modal data selection.
 * @param {String} title Title of modal.
 * @param {String} url api url of data.
 * @param {Array} columns Columns for table.
 * @param {Array} defaultSorting Default sorting table.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Array} selectedData Selected data.
 * @param {Function} selectedDataChanged Function of Selected data changed.
 * @param {boolean} isMultiple Is multiple selection.
 * @param {Array} initData Init Data.
 * */
export default function ModalSelector(
  {
    title,
    url,
    columns,
    sortingDefault,

    open,
    setOpen,
    selectedData,
    selectedDataChanged,
    isMultiple,

    initData
  }
) {
  const [selectionModel, setSelectionModel] = useState([])

  // Update selected data to model
  useEffect(() => {
    if (selectedData) {
      setSelectionModel(selectedData)
    }
  }, [selectedData])

  /**
   * When data on save
   */
  const onSave = () => {
    selectedDataChanged(selectionModel)
    setOpen(false)
  }

  return <div>
    <Modal
      className='ModalResourceSelector'
      open={open}
      onClosed={() => {
        setOpen(false)
      }}
    >
      <ModalHeader onClosed={() => {
        setOpen(false)
      }}>
        Select {title}
      </ModalHeader>
      <ResourceList
        title={title} url={url} columns={columns}
        sortingDefault={sortingDefault}
        selectedData={selectionModel}
        selectedDataChanged={(newSelectedData) => {
          setSelectionModel(newSelectedData)
          if (!isMultiple) {
            selectedDataChanged(newSelectedData)
            setOpen(false)
          }
        }}
        isMultiple={isMultiple} initData={initData}
      />
      {
        isMultiple ?
          <div className='Save-Button'>
            <SaveButton
              variant="secondary"
              text={"Update Selection(s)"}
              onClick={onSave}
            />
          </div> : ""
      }
    </Modal>
  </div>
}