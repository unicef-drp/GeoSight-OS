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
import ListForm from '../ListForm'
import WidgetSelectionSection
  from "../../../../../components/Widget/WidgetSelection";

/**
 * Widget dashboard
 */
export default function WidgetForm() {
  const dispatch = useDispatch();
  const {
    widgets,
    widgetsStructure
  } = useSelector(state => state.dashboard.data);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);

  /** Update data **/
  const updateData = (newData) => {
    if (newData) {
      if (!newData.id) {
        const maxId = Math.max(...widgets.map(widget => {
          return widget.id;
        }))
        const newID = maxId ? maxId : widgets.length
        const newOrder = Math.max(...widgets.map(widget => {
          return widget.order;
        })) ? widgets.length : 0
        newData.visible_by_default = true;
        newData.id = newID + 1;
        newData.group = groupName;
        newData.order = newOrder + 1;
        dispatch(Actions.Widgets.add(newData))
      } else {
        dispatch(Actions.Widgets.update(newData))
      }
    }
    setSelectedWidget(null)
  }

  const setOpenModal = (opened) => {
    if (!opened) {
      setSelectedWidget(null)
    }
    setOpen(opened)
  }

  return <Fragment>
    <WidgetSelectionSection
      initData={selectedWidget}
      open={open} setOpen={setOpenModal}
      updateData={updateData}/>

    <ListForm
      pageName={'Widgets'}
      data={widgets}
      dataStructure={widgetsStructure}
      setDataStructure={structure => {
        dispatch(
          Actions.Dashboard.updateStructure('widgetsStructure', structure)
        )
      }}
      addLayerAction={layer => {
        dispatch(Actions.Widgets.add(layer))
      }}
      removeLayerAction={(layer) => {
        dispatch(Actions.Widgets.remove(layer))
      }}
      changeLayerAction={(layer) => {
        dispatch(Actions.Widgets.update(layer))
      }}
      addLayerInGroupAction={(groupName) => {
        setSelectedWidget(null)
        setGroupName(groupName)
        setOpen(true)
      }}
      editLayerInGroupAction={(data) => {
        setSelectedWidget(data)
      }}
      hasGroup={false}
    />
  </Fragment>
}