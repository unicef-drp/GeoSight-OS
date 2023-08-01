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
import SearchIcon from '@mui/icons-material/Search';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Modal, { ModalHeader } from "../../../components/Modal";
import { IconTextField } from "../../../components/Elements/Input";
import { SaveButton } from "../../../components/Elements/Button";
import { fetchJSON } from "../../../Requests";
import { MainDataGrid } from "../../../components/MainDataGrid";

import './style.scss';

/**
 * For modal data selection.
 * @param {String} title Title of modal.
 * @param {String} api api url of data.
 * @param {Array} columns Columns for table.
 * @param {Array} inputData Input data that will be used not from api.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Array} selectedData Selected data.
 * @param {Function} selectedDataChanged Function of Selected data changed.
 * @param {Array} defaultSorting Default sorting table.
 * @param {Boolean} isMultiple Is data returned multiple object.
 * @param {Boolean} showSelected Is data returned multiple object.
 * @param {React.Component} beforeChildren Components before the table.
 * @param {dict} props Other properties.
 * */
export default function ModalSelector(
  {
    title,
    api,
    columns,
    inputData,
    open,
    setOpen,
    selectedData,
    selectedDataChanged,
    defaultSorting,
    isMultiple = true,
    showSelected = true,
    beforeChildren,
    ...props
  }
) {
  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [selectionModel, setSelectionModel] = useState([]);
  const [search, setSearch] = useState(null);
  const [pageSize, setPageSize] = useState(25);

  /** Search on change */
  const searchOnChange = (evt) => {
    setSearch(evt.target.value.toLowerCase())
  }
  /** Return id of data
   */
  const returnId = (data) => {
    if (data.id) {
      return data.id
    } else {
      return data
    }
  }

  /** Filter by search input */
  const fields = columns.map(column => column.field).filter(column => column !== 'id')
  let rows = data;
  let excludedSelectionModel = [];

  // Filter with initFilter
  if (props?.initFilter && rows) {
    const { id: idFilter } = props?.initFilter
    rows = rows.filter(row => {
      const id = returnId(row)
      if (idFilter) {
        return idFilter.includes(id)
      }
      return true;
    })
  }

  // Filter with search
  if (search && rows) {
    rows = rows.filter(row => {
      const id = returnId(row)
      let found = false
      fields.map(field => {
        if (Array.isArray(row[field])) {
          if (row[field].includes(search)) {
            found = true;
          }
        } else if (row[field]?.toLowerCase().includes(search)) {
          found = true;
        }
      })
      if (!found && selectionModel.includes(id)) {
        excludedSelectionModel.push(id)
      }
      return found
    })
  }

  /** Change data based on the input data **/
  useEffect(() => {
    setData(inputData)
  }, [inputData])

  /** Change data based on the input data **/
  useEffect(() => {
    if (open && api && !loaded) {
      setLoaded(true)
      fetchJSON(api)
        .then(data => {
          setData(data)
        })
    }

    if (open) {
      // Update selection model
      setSelectionModel(selectedData.map(row => returnId(row)))
    }
  }, [open])

  /** Change data based on the input data **/
  useEffect(() => {
    // Update selection model
    setSelectionModel(selectedData.map(row => returnId(row)))
  }, [selectedData, data])

  let selectedModel = []
  if (data) {
    selectedModel = data.filter(row => {
      return selectionModel.includes(row.id)
    })
  }

  const submitted = (selected) => {
    let newData = []
    if (data) {
      newData = data.filter(row => {
        return selected.includes(row.id)
      })
    }
    selectedDataChanged(newData)
    setOpen(false)
  }

  return <div>
    {
      isMultiple ?
        <div className='ModalDataSelectorSelected'>
          {
            showSelected ?
              selectedModel.map(
                selectedModelData => <div
                  key={selectedModelData.id}
                  className='ModalDataSelectorSelectedObject'
                  title={selectedModelData.name}
                >
                  <div>{selectedModelData.name}</div>
                  <RemoveCircleIcon onClick={() => {
                    const selectedData = [...selectionModel.filter(id => id !== selectedModelData.id)]
                    const newData = data.filter(row => {
                      return selectedData.includes(row.id)
                    })
                    selectedDataChanged(newData)
                    setOpen(false)
                  }}/>
                </div>
              ) : null
          }
        </div> : null
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
        Select {title}
      </ModalHeader>
      <div className='AdminContent'>

        {
          beforeChildren ?
            <div className='AdminBaseInput'>
              {beforeChildren}
            </div> : null
        }

        <div className='AdminBaseInput Indicator-Search'>
          <IconTextField
            placeholder={"Search " + title}
            iconStart={<SearchIcon/>}
            onChange={searchOnChange}
            value={search ? search : ""}
          />
        </div>

        <div className='AdminList'>
          <MainDataGrid
            rows={rows ? rows : []}
            columns={columns}
            pagination
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[25, 50, 100]}
            initialState={{
              sorting: {
                sortModel: defaultSorting,
              },
            }}
            disableSelectionOnClick

            checkboxSelection={true}
            onSelectionModelChange={(ouput) => {
              let newSelectionModel = Array.from(new Set(ouput.concat(excludedSelectionModel)))
              if (isMultiple) {
                setSelectionModel(newSelectionModel);
              } else {
                let selected = undefined
                newSelectionModel.map(id => {
                  if (!selectedModel.includes(id)) {
                    selected = id
                  }
                })
                const selectedData = selectedModel.map(row => row.id)
                if (selected !== selectedData[0]) {
                  submitted(selected ? [selected] : [])
                }
              }
            }}
            selectionModel={selectionModel}
            loading={!data}
          />
        </div>
        {
          isMultiple ?
            <div className='Save-Button'>
              <SaveButton
                variant="secondary"
                text={"Update Selection"}
                disabled={!data}
                onClick={() => {
                  submitted(selectionModel)
                }}
              />
            </div> : null
        }
      </div>
    </Modal>
  </div>
}