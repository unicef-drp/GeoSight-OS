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

import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { GridActionsCellItem } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import DynamicFormIcon from "@mui/icons-material/DynamicForm";

import { Actions } from "../../../../../store/dashboard";
import { dictDeepCopy, jsonToUrlParams } from "../../../../../utils/main";
import ListForm from '../ListForm'
import { COLUMNS } from "../../../Components/List";
import { DeleteButton } from "../../../../../components/Elements/Button";
import {
  DataAccessActiveIcon,
  DataBrowserActiveIcon,
  DataManagementActiveIcon,
  MagnifyIcon,
  MapActiveIcon
} from "../../../../../components/Icons";
import { IconTextField } from "../../../../../components/Elements/Input";

import './style.scss';
import IndicatorSelector
  from "../../../../../components/ResourceSelector/IndicatorSelector";

/**
 * Basemaps dashboard
 */
export default function IndicatorsForm() {
  const dispatch = useDispatch();
  const [selectionModel, setSelectionModel] = useState([]);
  const [search, setSearch] = useState('');
  const { indicators, referenceLayer } = dictDeepCopy(
    useSelector(state => state.dashboard.data)
  )
  const columns = dictDeepCopy(
    COLUMNS('Indicators', urls.admin.indicatorList)
  )

  // Other actions
  columns[4] = {
    field: 'actions',
    type: 'actions',
    cellClassName: 'MuiDataGrid-ActionsColumn',
    width: 320,
    getActions: (params) => {
      const permission = params.row.permission
      // Create actions
      const actions = []
      if (permission.edit) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Management Map`}>
                <a
                  href={urls.api.map.replace('/0', `/${params.id}`)}>
                  <div className='ButtonIcon'>
                    <MapActiveIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Edit"
          />)
      }
      if (permission.edit) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Management Form`}>
                <a
                  href={urls.api.form.replace('/0', `/${params.id}`)}>
                  <div className='ButtonIcon'>
                    <DynamicFormIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Management Form"
          />)
      }
      if (permission.edit) {
        const parameters = {
          indicator_data_value: params.id
        }
        if (referenceLayer?.identifier) {
          parameters.reference_layer = referenceLayer?.identifier
          parameters.reference_layer_name = referenceLayer?.name
        }
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Import data`}>
                <a
                  href={`${urls.admin.importer}?${jsonToUrlParams(parameters)}`}>
                  <div className='ButtonIcon'>
                    <DataManagementActiveIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Import data"
          />
        )
      }
      if (permission.edit) {
        const parameters = {
          indicators: params.id
        }
        if (referenceLayer?.identifier) {
          parameters.datasets = referenceLayer?.identifier
        }
        actions.unshift(
          <GridActionsCellItem
            icon={
              <Tooltip title={`Browse data`}>
                <a
                  href={`${urls.api.dataBrowser}?${jsonToUrlParams(parameters)}`}>
                  <div className='ButtonIcon'>
                    <DataBrowserActiveIcon/>
                  </div>
                </a>
              </Tooltip>
            }
            label="Value List"
          />
        )
      }
      return actions
    },
  }

  // Delete Button
  const deleteButton = () => {
    return <DeleteButton
      disabled={!selectionModel.length}
      variant="Error Reverse"
      text={"Delete"}
      onClick={() => {
        dispatch(Actions.Indicators.batchRemove(selectionModel))
        setSelectionModel([])
      }}
    />
  }
  const pageName = 'Indicators'
  return <ListForm
    pageName={pageName}
    data={indicators}
    dataStructure={{
      group: '',
      children: indicators.map(row => row.id)
    }}
    setDataStructure={structure => {
    }}
    listUrl={urls.api.indicatorListAPI}
    addLayerAction={(layer) => {
      dispatch(Actions.Indicators.add(layer))
    }}
    removeLayerAction={(layer) => {
      dispatch(Actions.Indicators.remove(layer))
    }}
    changeLayerAction={(layer) => {
      dispatch(Actions.Indicators.update(layer))
    }}
    otherHeaders={
      <Fragment>
        <IconTextField
          placeholder={"Search " + pageName}
          iconEnd={<MagnifyIcon/>}
          onChange={evt => setSearch(evt.target.value.toLowerCase())}
        />
      </Fragment>
    }
    hasGroup={false}
    selectable={true}
    createNew={true}
    listConfig={{
      initData: indicators,
      columns: columns,
      selectionModel: selectionModel,
      setSelectionModel: setSelectionModel,
      header: deleteButton(),
      search: search
    }}
    resourceSelector={<IndicatorSelector/>}
  />
}