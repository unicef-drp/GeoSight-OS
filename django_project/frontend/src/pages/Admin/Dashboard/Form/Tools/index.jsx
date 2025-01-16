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
 * __date__ = '30/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import ListForm from '../ListForm'
import { Variables } from "../../../../../utils/Variables";
import { ZonalAnalysisConfiguration } from "./ZonalAnalysis";

import './style.scss';

export const columns = [
  {
    field: 'id',
    headerName: 'id',
    hide: true,
    width: 30,
  },
  { field: 'name', headerName: 'columns', flex: 1 }
]

/**
 * Tools dashboard
 */
export default function ToolsForm() {
  const dispatch = useDispatch()
  const { tools } = useSelector(state => state.dashboard.data);

  return <ListForm
    pageName={'Tools'}
    data={tools}
    dataStructure={{
      group: '',
      children: tools.map(row => row.id)
    }}
    setDataStructure={structure => {
    }}
    addLayerAction={(data) => {
    }}
    removeLayerAction={(data) => {
    }}
    changeLayerAction={(data) => {
      dispatch(Actions.DashboardTool.update(data))
    }}
    initColumns={columns}
    hasGroup={false}
    otherActionsFunction={data => {
      if (data.name === Variables.DASHBOARD.TOOL.ZONAL_ANALYSIS) {
        return <ZonalAnalysisConfiguration
          config={data.config}
          setConfig={config => {
            dispatch(Actions.DashboardTool.update({ ...data, config: config }))
          }}
        />
      }
      return null
    }}
  />
}