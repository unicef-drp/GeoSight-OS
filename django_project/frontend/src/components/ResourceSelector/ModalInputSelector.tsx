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
 * __date__ = '13/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconTextField } from "../Elements/Input";
import { ArrowDownwardIcon, MagnifyIcon } from "../Icons";
import { ServerTable } from "../Table";
import Modal, { ModalHeader } from "../Modal";
import { debounce } from "@mui/material/utils";
import { headers } from "../../utils/georepo";
import { MainDataGridProps } from "../Table/types";
import { ModalInputSelectorProps } from "./types";
import FormControl from "@mui/material/FormControl";

import './style.scss';

interface Props extends MainDataGridProps, ModalInputSelectorProps {
}

/** Input modal selector component */
export function ModalInputSelector(
  {
    url,
    columns,
    getParameters: getParametersParent,
    dataName,
    multipleSelection,
    showSelected,
    dataSelected,
    initData = [],
    defaults = {},
    rowIdKey = 'id',
    topChildren,
    disabled
  }: Props
) {
  const tableRef = useRef(null);
  const [open, setOpen] = useState(false)

  const [selectionModel, setSelectionModel] = useState([]);
  const [selectionModelData, setSelectionModelData] = useState(initData);
  const [search, setSearch] = useState<string>(defaults.search);

  /** Search value changed, debouce **/
  const searchValueUpdate = useMemo(
    () =>
      debounce(
        (newValue) => {
          tableRef?.current?.refresh(false)
        },
        400
      ),
    []
  )

  /** Search name value changed **/
  useEffect(() => {
    searchValueUpdate(search)
  }, [search]);

  /** When open **/
  useEffect(() => {
    setSelectionModel(initData ? initData.map(row => row.id) : [])
    setSelectionModelData(initData)
  }, [open]);

  /** When url changed **/
  useEffect(() => {
    tableRef?.current?.refresh(false)
  }, [url]);

  /*** Parameters Changed */
  const getParameters = (parameters: any) => {
    if (search) {
      parameters['name__icontains'] = search
    } else {
      delete parameters['name__icontains']
    }
    if (getParametersParent) {
      parameters = getParametersParent(parameters)
    }
    return parameters
  }

  let inputValue = initData.length ? initData.length + ' selected' : ''
  if (!multipleSelection && initData.length) {
    inputValue = initData[0]?.name
  }
  return <>
    <FormControl className='InputControl'>
      <IconTextField
        placeholder={'Select view ' + (multipleSelection ? '(s)' : '')}
        iconEnd={<ArrowDownwardIcon/>}
        onClick={() => setOpen(true)}
        value={inputValue}
        disabled={disabled}
      />
    </FormControl>
    <Modal
      className='ModalDataSelector'
      open={open}
      onClosed={() => {
        setOpen(false)
      }}
    >
      <ModalHeader onClosed={() => {
        setOpen(false)
      }}>
        Select {dataName}{multipleSelection ? '(s)' : null}
      </ModalHeader>
      <div className='AdminContent'>
        {topChildren}
        <div className='AdminBaseInput Indicator-Search'>
          <IconTextField
            placeholder={"Search " + dataName}
            iconStart={<MagnifyIcon/>}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(evt.target.value.toLowerCase())
            }}
            value={search ? search : ""}
          />
        </div>

        <div className='AdminList'>
          <ServerTable
            url={url}
            urlHeader={headers.headers}
            columns={columns}
            selectionModel={selectionModel}
            setSelectionModel={setSelectionModel}
            getParameters={getParameters}
            checkboxSelection={true}
            defaults={{
              sort: [
                { field: 'name', sort: 'asc' }
              ]
            }}
            enable={
              {
                delete: false,
                select: true,
                singleSelection: !multipleSelection
              }
            }
            rowIdKey={rowIdKey}
            selectionModelData={selectionModelData}
            setSelectionModelData={(data: any[]) => {
              setSelectionModelData(data)
              // For single selection
              if (dataSelected && !multipleSelection) {
                const selected = data.find(
                  _row => _row[rowIdKey] == selectionModel[selectionModel.length - 1]
                )
                if (selected) {
                  dataSelected([selected])
                  setOpen(false)
                }
              }
            }}
            className='ModalSelector'
            ref={tableRef}
          />
        </div>
      </div>
    </Modal>
  </>
}