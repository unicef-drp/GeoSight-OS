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
import { ArrowDownwardIcon, FilterIcon, MagnifyIcon } from "../Icons";
import { ServerTable } from "../Table";
import Modal, { ModalHeader } from "../Modal";
import { debounce } from "@mui/material/utils";
import { headers } from "../../utils/georepo";
import { MainDataGridProps } from "../Table/types";
import { ModalInputSelectorProps } from "./types";
import FormControl from "@mui/material/FormControl";
import { SaveButton } from "../Elements/Button";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

import './style.scss';

interface Props extends MainDataGridProps, ModalInputSelectorProps {
}

/** Input modal selector component */
export function ModalInputSelector(
  {
    // Input properties
    mode = 'input',
    placeholder,
    dataName,
    disabled,
    showSelected,

    // Data properties
    url,
    columns,
    getParameters: getParametersParent,
    initData = [],

    // Listeners
    dataSelected,

    // Table properties
    multipleSelection,
    defaults = {},
    rowIdKey = 'id',
    topChildren,
    opener
  }: Props
) {
  const tableRef = useRef(null);
  const [open, setOpen] = useState(false)

  const [selectionModel, setSelectionModel] = useState([]);
  const [selectionModelData, setSelectionModelData] = useState([]);
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
    if (open) {
      const newSelectionModel = initData ? initData.map(row => row[rowIdKey]) : []
      if (JSON.stringify(newSelectionModel) !== JSON.stringify(selectionModel)) {
        setSelectionModel(initData ? initData.map(row => row[rowIdKey]) : [])
        setSelectionModelData(initData)
      }
    }
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
    {
      opener ? <>
          {
            React.cloneElement(opener, {
              onClick: () => setOpen(true)
            })
          }
        </> :
        <FormControl
          className={(mode === 'input' ? 'InputControl' : 'FilterControl') + ' ResourceSelector'}
        >
          {
            mode === 'input' ?
              <IconTextField
                placeholder={`Select ${dataName}` + (multipleSelection ? '(s)' : '')}
                iconEnd={<ArrowDownwardIcon/>}
                onClick={() => setOpen(true)}
                value={inputValue}
                disabled={disabled}
              /> : <IconTextField
                iconEnd={
                  <FilterIcon
                    className={selectionModel.length ? 'HasValue' : ''}
                    onClick={(e: any) => {
                      if (selectionModel.length) {
                        setSelectionModel([])
                        setSelectionModelData([])
                        e.stopPropagation();
                      }
                    }}
                  />
                }
                onClick={() => setOpen(true)}
                value={selectionModel.length ? selectionModel.length + ' selected' : placeholder}
                inputProps={
                  { readOnly: true, }
                }
              />
          }

          {
            showSelected && multipleSelection ?
              <div className='ModalDataSelectorSelected'>
                {
                  selectionModelData.map(
                    _row => <div
                      key={_row[rowIdKey]}
                      className='ModalDataSelectorSelectedObject'
                      title={_row.name}
                    >
                      <div>{_row.name}</div>
                      <RemoveCircleIcon onClick={() => {
                        const selectedData = [...selectionModel.filter(id => id !== _row.id)]
                        setSelectionModel(selectedData)
                      }}/>
                    </div>
                  )
                }
              </div> : null
          }
        </FormControl>
    }
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
            className='ModalSelector'
            url={url}
            urlHeader={headers.headers}
            columns={columns}
            selectionModel={selectionModel}
            setSelectionModel={setSelectionModel}
            getParameters={getParameters}
            checkboxSelection={true}
            defaults={{
              sort: defaults.sort ? defaults.sort : [
                { field: 'name', sort: 'asc' }
              ],
              search: defaults.search,
              filters: defaults.filters
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
              // For single selection close and trigger data selected
              if (!multipleSelection) {
                if (dataSelected) {
                  const selected = data.find(
                    _row => _row[rowIdKey] == selectionModel[selectionModel.length - 1]
                  )
                  if (selected) {
                    dataSelected([selected])
                    setOpen(false)
                  }
                }
              }
            }}
            disableSelectionOnClick={false}
            ref={tableRef}
          />
          {
            multipleSelection ?
              <div className='Save-Button'>
                <SaveButton
                  variant="primary"
                  text={"Update Selection"}
                  onClick={() => {
                    dataSelected(selectionModelData)
                    setOpen(false)
                  }}
                />
              </div> : null
          }
        </div>
      </div>
    </Modal>
  </>
}