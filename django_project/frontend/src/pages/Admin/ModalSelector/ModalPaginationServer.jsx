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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Modal, { ModalHeader } from "../../../components/Modal";
import { IconTextField } from "../../../components/Elements/Input";
import { SaveButton } from "../../../components/Elements/Button";
import { MainDataGrid } from "../../../components/MainDataGrid";
import { MagnifyIcon } from "../../../components/Icons";
import { dictDeepCopy, jsonToUrlParams } from "../../../utils/main";
import { fetchJSON } from "../../../Requests";
import { debounce } from "@mui/material/utils";

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
export default function ModalPaginationServer(
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
  const prev = useRef();
  const [error, setError] = useState(null);
  const [data, setData] = useState(null)
  const [selectionModel, setSelectionModel] = useState([]);
  const [search, setSearch] = useState(null);

  // Other attributes
  const pageSize = 25;
  const [parameters, setParameters] = useState({
    page: 0,
    page_size: pageSize
  })
  const [rowSize, setRowSize] = useState(0)

  /**
   * Update search
   */
  const updateSearch = useMemo(
    () =>
      debounce(
        (newValue) => {
          if (newValue !== search) {
            if (newValue) {
              parameters['name__icontains'] = newValue
            } else {
              delete parameters['name__icontains']
            }
            refresh()
          }
        },
        400
      ),
    []
  )

  useEffect(() => {
    updateSearch(search)
  }, [search])

  /** Refresh **/
  const refresh = () => {
    setSelectionModel([])
    loadData(true)
  }

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

  /** Change data based on the input data **/
  useEffect(() => {
    setData(inputData)
  }, [inputData])

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

  /*** Load data */
  const loadData = async (force) => {
    setData(null)
    setError(null)
    const paramsUsed = dictDeepCopy(parameters)
    paramsUsed.page += 1
    const params = jsonToUrlParams(paramsUsed)
    const url = api + '?' + params
    if (!force && url === prev.urlRequest) {
      return
    }
    prev.urlRequest = url

    try {
      const data = await fetchJSON(url, {}, false)

      // Set the data
      if (prev.urlRequest === url) {
        setRowSize(data.count)
        setData(data.results)
      }
    } catch (error) {
      if (error.message === 'Invalid page.') {
        setParameters({ ...parameters, page: 0 })
      } else {
        if (error?.response?.data) {
          setError(error.response.data)
        } else {
          setError(error.message)
        }
      }
    }
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

  /***
   * Parameters Changed
   */
  const parametersChanged = () => {
    setParameters({ ...parameters })
  }

  /*** When parameters changed */
  useEffect(() => {
    loadData()
  }, [parameters])

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
            iconStart={<MagnifyIcon/>}
            onChange={searchOnChange}
            value={search ? search : ""}
          />
        </div>

        <div className='AdminList'>
          <MainDataGrid
            className='ModalSelector'
            rows={data ? data : []}
            columns={columns}
            pagination
            rowCount={rowSize}
            page={parameters.page}
            pageSize={parameters.page_size}
            rowsPerPageOptions={[25, 50, 100]}
            onPageSizeChange={(newPageSize) => {
              parameters.page_size = newPageSize
              parametersChanged()
            }}
            paginationMode="server"
            onPageChange={(newPage) => {
              parameters.page = newPage
              parametersChanged()
            }}
            initialState={{
              sorting: {
                sortModel: defaultSorting,
              },
            }}
            checkboxSelection={true}
            onSelectionModelChange={(ouput) => {
              if (isMultiple) {
                setSelectionModel(ouput);
              } else {
                let selected = undefined
                ouput.map(id => {
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
            loading={data === null}
            error={error}
          />
        </div>
        {
          isMultiple ?
            <div className='Save-Button'>
              <SaveButton
                variant="primary"
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