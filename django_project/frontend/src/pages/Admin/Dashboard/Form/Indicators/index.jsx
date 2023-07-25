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

import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import { dictDeepCopy } from "../../../../../utils/main";
import ListForm from '../ListForm'

import './style.scss';

/**
 * Basemaps dashboard
 */
export default function IndicatorsForm() {
  const dispatch = useDispatch();
  const { indicators } = dictDeepCopy(
    useSelector(state => state.dashboard.data)
  )
  const indicatorList = indicators.map(indicator => {
    indicator.name = indicator.full_name
    return indicator
  }).sort((a, b) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })
  return <ListForm
    pageName={'Indicators'}
    data={indicatorList}
    dataStructure={{
      group: '',
      children: indicatorList.map(row => row.id)
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
    selectable={true}
  />
}