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
import { Actions } from "../../../../../store/dashboard";
import { dictDeepCopy } from "../../../../../utils/main";
import ListForm from '../ListForm'
import { COLUMNS } from "../../../Components/List";
import { DeleteButton } from "../../../../../components/Elements/Button";
import { MagnifyIcon } from "../../../../../components/Icons";
import { IconTextField } from "../../../../../components/Elements/Input";

import './style.scss';

/**
 * Basemaps dashboard
 */
export default function IndicatorsForm() {
  const dispatch = useDispatch();
  const [selectionModel, setSelectionModel] = useState([]);
  const [search, setSearch] = useState('');
  const { indicators } = dictDeepCopy(
    useSelector(state => state.dashboard.data)
  )
  const columns = dictDeepCopy(
    COLUMNS('Indicators', urls.admin.indicatorList)
  )
  delete columns[4]

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
  />
}